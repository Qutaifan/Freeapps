/*
 * assets/js/gpu-renderer.js — Tier 1 (WebGPU) hero background renderer.
 *
 * Loaded before gpu-hero.js. Exposes window.THEHUBGPU.tryWebGPU(canvas, opts)
 * which:
 *   - resolves to `true`  if WebGPU initialized and is now animating the canvas
 *   - resolves to `false` on ANY failure (no navigator.gpu, adapter null,
 *     device request rejected, shader/pipeline compile error, etc.) — it
 *     NEVER throws and NEVER leaves a half-drawn/broken canvas behind.
 *
 * gpu-hero.js owns the decision of what to do on `false` (fall through to
 * its existing WebGL2 → Canvas2D → no-op chain).
 *
 * Aesthetic: a sparse "software discovery" node-and-connection graph —
 * nodes drift on an analytic flow field, nearest neighbors are linked by
 * faint lines, additive cyan/violet/magenta blending. No external deps.
 *
 * Config is JS-readable (shaders read from JS, not CSS) via
 * window.THEHUB_GPU_CONFIG, mirroring the CSS design-token approach used
 * for the rest of the site's visual language.
 */
(function (global) {
  'use strict';

  var CONFIG = {
    particleCountDesktop: 90,
    particleCountMobile: 36,
    connectionsPerNode: 2,
    maxConnectionDist: 0.6,
    speed: 0.05,
    pointSizePx: 5,
    // Neon cyan -> violet -> magenta, matches --accent-cyan / --accent-violet / --accent-magenta.
    colorStops: [
      [0.0, 0.94, 1.0],   // cyan   #00F0FF
      [0.69, 0.15, 1.0],  // violet #B026FF
      [1.0, 0.18, 0.83]   // magenta #FF2FD4
    ],
    maxFps: 60
  };
  global.THEHUB_GPU_CONFIG = CONFIG;

  function isMobileLike() {
    var narrow = false;
    try {
      narrow = global.matchMedia && global.matchMedia('(max-width: 640px)').matches;
    } catch (e) { narrow = false; }
    var lowCore = (navigator.hardwareConcurrency || 8) <= 4;
    return narrow || lowCore;
  }

  var NODE_STRUCT_FLOATS = 4; // pos.x, pos.y, seed, colorMix — 16 bytes, storage-buffer friendly

  var WGSL_NODES = [
    'struct Node { pos: vec2<f32>, seed: f32, colorMix: f32 };',
    'struct Uniforms { time: f32, aspect: f32, pointSize: f32, staticFlag: f32 };',
    '@group(0) @binding(0) var<storage, read> nodes: array<Node>;',
    '@group(0) @binding(1) var<uniform> u: Uniforms;',
    '',
    'struct VOut {',
    '  @builtin(position) position: vec4<f32>,',
    '  @location(0) uv: vec2<f32>,',
    '  @location(1) colorMix: f32,',
    '};',
    '',
    '@vertex',
    'fn vs_main(@builtin(vertex_index) vIdx: u32, @builtin(instance_index) iIdx: u32) -> VOut {',
    '  var corners = array<vec2<f32>, 4>(',
    '    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0),',
    '    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0)',
    '  );',
    '  let corner = corners[vIdx];',
    '  let n = nodes[iIdx];',
    '  let sizeClip = vec2<f32>(u.pointSize, u.pointSize * u.aspect);',
    '  var out: VOut;',
    '  out.position = vec4<f32>(n.pos + corner * sizeClip, 0.0, 1.0);',
    '  out.uv = corner;',
    '  out.colorMix = n.colorMix;',
    '  return out;',
    '}',
    '',
    '@fragment',
    'fn fs_main(in: VOut) -> @location(0) vec4<f32> {',
    '  let d = dot(in.uv, in.uv);',
    '  if (d > 1.0) { discard; }',
    '  let alpha = smoothstep(1.0, 0.0, d) * 0.6;',
    '  let cCyan = vec3<f32>(0.0, 0.94, 1.0);',
    '  let cViolet = vec3<f32>(0.69, 0.15, 1.0);',
    '  let cMagenta = vec3<f32>(1.0, 0.18, 0.83);',
    '  var col = mix(cCyan, cViolet, clamp(in.colorMix * 2.0, 0.0, 1.0));',
    '  col = mix(col, cMagenta, clamp(in.colorMix * 2.0 - 1.0, 0.0, 1.0));',
    '  return vec4<f32>(col * alpha, alpha);',
    '}'
  ].join('\n');

  var WGSL_LINES = [
    'struct Uniforms { time: f32, aspect: f32, pointSize: f32, staticFlag: f32 };',
    '@group(0) @binding(1) var<uniform> u: Uniforms;',
    '',
    '@vertex',
    'fn vs_main(@location(0) pos: vec2<f32>) -> @builtin(position) vec4<f32> {',
    '  return vec4<f32>(pos, 0.0, 1.0);',
    '}',
    '',
    '@fragment',
    'fn fs_main() -> @location(0) vec4<f32> {',
    '  return vec4<f32>(0.15, 0.55, 0.85, 0.10);',
    '}'
  ].join('\n');

  function tryWebGPU(canvas, opts) {
    opts = opts || {};
    var reduceMotion = !!opts.reduceMotion;

    return new Promise(function (resolve) {
      var settled = false;
      function fail() {
        if (settled) return;
        settled = true;
        resolve(false);
      }
      function succeed() {
        if (settled) return;
        settled = true;
        resolve(true);
      }

      try {
        if (!('gpu' in navigator) || !navigator.gpu) {
          fail();
          return;
        }

        var mobile = isMobileLike();
        var NODE_COUNT = mobile ? CONFIG.particleCountMobile : CONFIG.particleCountDesktop;
        var FRAME_BUDGET_MS = 1000 / CONFIG.maxFps;

        navigator.gpu.requestAdapter({ powerPreference: 'low-power' }).then(function (adapter) {
          try {
            if (!adapter) { fail(); return; }
            adapter.requestDevice().then(function (device) {
              try {
                if (!device) { fail(); return; }
                initDevice(device);
              } catch (e) {
                fail();
              }
            }).catch(function () { fail(); });
          } catch (e) {
            fail();
          }
        }).catch(function () { fail(); });

        function initDevice(device) {
          var ctx = null;
          try {
            ctx = canvas.getContext('webgpu');
          } catch (e) { ctx = null; }
          if (!ctx) { fail(); return; }

          var format;
          try {
            format = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : 'bgra8unorm';
          } catch (e) { format = 'bgra8unorm'; }

          var dpr = Math.min(global.devicePixelRatio || 1, 2);
          var width = 1, height = 1;

          function resize() {
            var rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
            width = Math.max(1, Math.round(rect.width));
            height = Math.max(1, Math.round(rect.height));
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            try {
              ctx.configure({ device: device, format: format, alphaMode: 'premultiplied' });
            } catch (e) {
              fail();
            }
          }

          try {
            resize();
          } catch (e) {
            fail();
            return;
          }

          // ---- Build node data (positions, velocities, seeds) ----
          var nodes = [];
          for (var i = 0; i < NODE_COUNT; i++) {
            nodes.push({
              x: Math.random() * 2 - 1,
              y: Math.random() * 2 - 1,
              seed: Math.random(),
              colorMix: Math.random()
            });
          }

          // ---- Precompute nearest-neighbor connections (static topology) ----
          var connections = [];
          for (var a = 0; a < nodes.length; a++) {
            var dists = [];
            for (var b = 0; b < nodes.length; b++) {
              if (a === b) continue;
              var dx = nodes[a].x - nodes[b].x;
              var dy = nodes[a].y - nodes[b].y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= CONFIG.maxConnectionDist) dists.push([dist, b]);
            }
            dists.sort(function (p, q) { return p[0] - q[0]; });
            for (var k = 0; k < Math.min(CONFIG.connectionsPerNode, dists.length); k++) {
              connections.push([a, dists[k][1]]);
            }
          }

          var nodeBufferData = new Float32Array(NODE_COUNT * NODE_STRUCT_FLOATS);
          var lineVertexData = new Float32Array(connections.length * 2 * 2); // 2 verts * (x,y)

          var nodeBuffer, uniformBuffer, lineBuffer;
          var nodePipeline, linePipeline, bindGroup, lineBindGroup;

          try {
            nodeBuffer = device.createBuffer({
              size: nodeBufferData.byteLength,
              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            });
            uniformBuffer = device.createBuffer({
              size: 16,
              usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });
            lineBuffer = device.createBuffer({
              size: Math.max(lineVertexData.byteLength, 16),
              usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });

            var nodeModule = device.createShaderModule({ code: WGSL_NODES });
            var lineModule = device.createShaderModule({ code: WGSL_LINES });

            var bindGroupLayout = device.createBindGroupLayout({
              entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
                { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
              ]
            });
            var pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });

            nodePipeline = device.createRenderPipeline({
              layout: pipelineLayout,
              vertex: { module: nodeModule, entryPoint: 'vs_main' },
              fragment: { module: nodeModule, entryPoint: 'fs_main', targets: [{
                format: format,
                blend: {
                  color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
                  alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }
                }
              }] },
              primitive: { topology: 'triangle-strip' }
            });

            var lineBindGroupLayout = device.createBindGroupLayout({
              entries: [
                { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
              ]
            });
            var linePipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [lineBindGroupLayout] });

            linePipeline = device.createRenderPipeline({
              layout: linePipelineLayout,
              vertex: {
                module: lineModule,
                entryPoint: 'vs_main',
                buffers: [{
                  arrayStride: 8,
                  attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }]
                }]
              },
              fragment: { module: lineModule, entryPoint: 'fs_main', targets: [{
                format: format,
                blend: {
                  color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
                  alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }
                }
              }] },
              primitive: { topology: 'line-list' }
            });

            bindGroup = device.createBindGroup({
              layout: bindGroupLayout,
              entries: [
                { binding: 0, resource: { buffer: nodeBuffer } },
                { binding: 1, resource: { buffer: uniformBuffer } }
              ]
            });
            lineBindGroup = device.createBindGroup({
              layout: lineBindGroupLayout,
              entries: [
                { binding: 1, resource: { buffer: uniformBuffer } }
              ]
            });
          } catch (e) {
            fail();
            return;
          }

          function updateSim(timeSec, still) {
            var t = still ? 0 : timeSec;
            for (var idx = 0; idx < nodes.length; idx++) {
              var n = nodes[idx];
              var speed = CONFIG.speed * (0.4 + n.seed * 0.8);
              var px = n.x + Math.sin(t * speed + n.seed * 6.283) * 0.18;
              var py = n.y + Math.cos(t * speed * 0.8 + n.seed * 6.283) * 0.18;
              var o = idx * NODE_STRUCT_FLOATS;
              nodeBufferData[o] = px;
              nodeBufferData[o + 1] = py;
              nodeBufferData[o + 2] = n.seed;
              nodeBufferData[o + 3] = n.colorMix;
            }
            var lo = 0;
            for (var c = 0; c < connections.length; c++) {
              var ai = connections[c][0], bi = connections[c][1];
              lineVertexData[lo++] = nodeBufferData[ai * NODE_STRUCT_FLOATS];
              lineVertexData[lo++] = nodeBufferData[ai * NODE_STRUCT_FLOATS + 1];
              lineVertexData[lo++] = nodeBufferData[bi * NODE_STRUCT_FLOATS];
              lineVertexData[lo++] = nodeBufferData[bi * NODE_STRUCT_FLOATS + 1];
            }
          }

          function drawFrame(timeSec, still) {
            try {
              updateSim(timeSec, still);
              device.queue.writeBuffer(nodeBuffer, 0, nodeBufferData);
              if (lineVertexData.length) device.queue.writeBuffer(lineBuffer, 0, lineVertexData);
              var aspect = width > 0 ? (width / height) : 1;
              device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([
                timeSec, aspect, (CONFIG.pointSizePx / Math.max(width, 1)), still ? 1 : 0
              ]));

              var encoder = device.createCommandEncoder();
              var view = ctx.getCurrentTexture().createView();
              var pass = encoder.beginRenderPass({
                colorAttachments: [{
                  view: view,
                  clearValue: { r: 0, g: 0, b: 0, a: 0 },
                  loadOp: 'clear',
                  storeOp: 'store'
                }]
              });
              if (connections.length) {
                pass.setPipeline(linePipeline);
                pass.setBindGroup(0, lineBindGroup);
                pass.setVertexBuffer(0, lineBuffer);
                pass.draw(connections.length * 2);
              }
              pass.setPipeline(nodePipeline);
              pass.setBindGroup(0, bindGroup);
              pass.draw(4, NODE_COUNT);
              pass.end();
              device.queue.submit([encoder.finish()]);
            } catch (e) {
              // Runtime draw failure (e.g. device lost mid-frame) — stop
              // cleanly, leave whatever was last drawn, never throw upward.
              stop();
            }
          }

          var running = false, rafId = null, lastFrameTime = 0, visible = true;

          function loop(ts) {
            if (!running) return;
            if (ts - lastFrameTime >= FRAME_BUDGET_MS) {
              lastFrameTime = ts;
              drawFrame(ts * 0.001, false);
            }
            rafId = global.requestAnimationFrame(loop);
          }
          function start() {
            if (running || reduceMotion) return;
            running = true;
            rafId = global.requestAnimationFrame(loop);
          }
          function stop() {
            running = false;
            if (rafId) global.cancelAnimationFrame(rafId);
            rafId = null;
          }

          try {
            if ('IntersectionObserver' in global) {
              var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                  visible = entry.isIntersecting;
                  if (visible && !document.hidden) start(); else stop();
                });
              }, { threshold: 0.01 });
              io.observe(canvas);
            }
            document.addEventListener('visibilitychange', function () {
              if (document.hidden) stop();
              else if (visible) start();
            });
            global.addEventListener('resize', resize, { passive: true });
          } catch (e) {
            // Visibility wiring is best-effort; failure here should not
            // block the render path itself.
          }

          if (typeof device.lost === 'object' && device.lost && typeof device.lost.then === 'function') {
            device.lost.then(function () { stop(); });
          }

          drawFrame(0, true);
          if (!reduceMotion) start();

          succeed();
        }
      } catch (e) {
        fail();
      }
    });
  }

  global.THEHUBGPU = { tryWebGPU: tryWebGPU, CONFIG: CONFIG };
})(window);
