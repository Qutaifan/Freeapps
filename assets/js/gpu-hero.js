/*
 * gpu-hero.js — tiered hero background renderer.
 * Vanilla JS, no dependencies. Tier chain:
 *   1. WebGPU   (assets/js/gpu-renderer.js, node/connection "discovery graph")
 *   2. WebGL2   (this file, particle field — original implementation, kept
 *                as-is as the fallback tier)
 *   3. Canvas2D (this file, particle field — original implementation, kept
 *                as-is as the final animated fallback)
 *   4. no-op    (empty canvas, no errors)
 * Respects prefers-reduced-motion, pauses when offscreen/tab hidden,
 * caps particle count and frame rate for integrated-GPU friendliness.
 * Every tier below WebGPU is unchanged from the original single-tier
 * implementation; only the entry point now tries WebGPU first.
 */
(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('gpu-hero-canvas');
    if (!canvas) return;

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      reduceMotion = false;
    }

    var PARTICLE_COUNT = 110;
    var MAX_FPS = 60;
    var FRAME_BUDGET_MS = 1000 / MAX_FPS;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0;
    var running = false;
    var rafId = null;
    var lastFrameTime = 0;
    var visible = true;

    function resize() {
      var rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    function startFallbackChain() {
      // --- Tier 2: WebGL2 ---
      var gl = null;
      try {
        gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      } catch (e) {
        gl = null;
      }

      if (gl) {
        runWebGL2(gl);
      } else {
        // --- Tier 3: Canvas2D ---
        var ctx2d = null;
        try {
          ctx2d = canvas.getContext('2d', { alpha: true });
        } catch (e) {
          ctx2d = null;
        }
        if (ctx2d) {
          runCanvas2D(ctx2d);
        }
        // --- Tier 4: no-op. If neither context is available, leave the
        // canvas empty. No errors thrown. ---
      }
    }

    // --- Tier 1: WebGPU, delegated to gpu-renderer.js. Any failure inside
    // tryWebGPU resolves(false) rather than throwing, so this always falls
    // through cleanly to the existing WebGL2/Canvas2D chain. ---
    try {
      if (window.THEHUBGPU && typeof window.THEHUBGPU.tryWebGPU === 'function') {
        window.THEHUBGPU.tryWebGPU(canvas, { reduceMotion: reduceMotion }).then(function (ok) {
          if (!ok) startFallbackChain();
        }).catch(function () {
          startFallbackChain();
        });
      } else {
        startFallbackChain();
      }
    } catch (e) {
      startFallbackChain();
    }

    function setupVisibilityGuards(pauseFn, resumeFn) {
      // Pause when tab hidden.
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          pauseFn();
        } else if (visible) {
          resumeFn();
        }
      });

      // Pause when hero scrolls offscreen.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (visible && !document.hidden) {
              resumeFn();
            } else {
              pauseFn();
            }
          });
        }, { threshold: 0.01 });
        io.observe(canvas);
      }

      window.addEventListener('resize', resize, { passive: true });
    }

    // ---------------- WebGL2 path ----------------
    function runWebGL2(gl) {
      resize();

      var vsSource = [
        'attribute vec2 aOffset;',
        'attribute float aSeed;',
        'uniform float uTime;',
        'uniform vec2 uResolution;',
        'uniform float uStatic;',
        'void main() {',
        '  float speed = 0.02 + fract(aSeed * 13.37) * 0.03;',
        '  float t = uTime * speed * (1.0 - uStatic);',
        '  vec2 pos = aOffset;',
        '  pos.x += sin(t + aSeed * 6.28318) * 0.06;',
        '  pos.y += cos(t * 0.8 + aSeed * 6.28318) * 0.06;',
        '  gl_Position = vec4(pos, 0.0, 1.0);',
        '  gl_PointSize = 1.4 + fract(aSeed * 7.77) * 1.6;',
        '}'
      ].join('\n');

      var fsSource = [
        'precision lowp float;',
        'uniform vec3 uColor;',
        'void main() {',
        '  vec2 c = gl_PointCoord - vec2(0.5);',
        '  float d = dot(c, c);',
        '  if (d > 0.25) discard;',
        '  float alpha = smoothstep(0.25, 0.0, d) * 0.55;',
        '  gl_FragColor = vec4(uColor, alpha);',
        '}'
      ].join('\n');

      function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          gl.deleteShader(s);
          return null;
        }
        return s;
      }

      var vs = compile(gl.VERTEX_SHADER, vsSource);
      var fs = compile(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) {
        // Compilation failed unexpectedly — bail out quietly, try Canvas2D fallback.
        var ctx2dFallback = null;
        try { ctx2dFallback = canvas.getContext('2d'); } catch (e) {}
        if (ctx2dFallback) runCanvas2D(ctx2dFallback);
        return;
      }

      var program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return;
      }
      gl.useProgram(program);

      var offsets = new Float32Array(PARTICLE_COUNT * 2);
      var seeds = new Float32Array(PARTICLE_COUNT);
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        offsets[i * 2] = (Math.random() * 2 - 1);
        offsets[i * 2 + 1] = (Math.random() * 2 - 1);
        seeds[i] = Math.random();
      }

      var offsetBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.STATIC_DRAW);
      var aOffset = gl.getAttribLocation(program, 'aOffset');
      gl.enableVertexAttribArray(aOffset);
      gl.vertexAttribPointer(aOffset, 2, gl.FLOAT, false, 0, 0);

      var seedBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
      var aSeed = gl.getAttribLocation(program, 'aSeed');
      gl.enableVertexAttribArray(aSeed);
      gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, 0, 0);

      var uTime = gl.getUniformLocation(program, 'uTime');
      var uResolution = gl.getUniformLocation(program, 'uResolution');
      var uColor = gl.getUniformLocation(program, 'uColor');
      var uStatic = gl.getUniformLocation(program, 'uStatic');

      // Cyan accent, low intensity — matches --accent-cyan (#00F0FF).
      gl.uniform3f(uColor, 0.0, 0.94, 1.0);
      gl.uniform1f(uStatic, reduceMotion ? 1.0 : 0.0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      function drawFrame(timeMs) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, timeMs * 0.001);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);
      }

      if (reduceMotion) {
        drawFrame(0);
        return; // static single frame, no animation loop
      }

      function loop(ts) {
        if (!running) return;
        if (ts - lastFrameTime >= FRAME_BUDGET_MS) {
          lastFrameTime = ts;
          drawFrame(ts);
        }
        rafId = requestAnimationFrame(loop);
      }

      function start() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(loop);
      }
      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }

      setupVisibilityGuards(stop, start);
      start();
    }

    // ---------------- Canvas2D fallback ----------------
    function runCanvas2D(ctx) {
      resize();

      var particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.7 + Math.random() * 1.3,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          a: 0.15 + Math.random() * 0.35
        });
      }

      function drawStatic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        particles.forEach(function (p) {
          ctx.globalAlpha = p.a;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      if (reduceMotion) {
        drawStatic();
        return;
      }

      function step() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width; else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height; else if (p.y > height) p.y = 0;
          ctx.globalAlpha = p.a;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      function loop(ts) {
        if (!running) return;
        if (ts - lastFrameTime >= FRAME_BUDGET_MS) {
          lastFrameTime = ts;
          step();
        }
        rafId = requestAnimationFrame(loop);
      }

      function start() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(loop);
      }
      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }

      setupVisibilityGuards(stop, start);
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
