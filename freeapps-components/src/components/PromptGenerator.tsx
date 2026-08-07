import { useState } from 'react'

interface PresetTemplate {
  title: string
  targetModel: 'chatgpt' | 'claude' | 'midjourney' | 'coding' | 'seo'
  role: string
  task: string
  context: string
  tone: string
}

const PRESETS: PresetTemplate[] = [
  {
    title: '💻 Expert Coding & Refactoring',
    targetModel: 'coding',
    role: 'Senior Full-Stack Principal Engineer & Security Auditor',
    task: 'Refactor the provided code snippet to adhere to SOLID principles, optimize execution time, and eliminate security vulnerabilities.',
    context: 'Targeting production deployment with strict TypeScript and modern async patterns.',
    tone: 'Technical, concise, structured with code blocks only'
  },
  {
    title: '🚀 High-Converting Copywriter',
    targetModel: 'chatgpt',
    role: 'Direct Response Copywriting Specialist & Conversion Rate Optimizer',
    task: 'Write a compelling landing page hero headline, subtext, and call-to-action for a new developer SaaS product.',
    context: 'Target audience: Senior developers and CTOs looking for privacy-first tools.',
    tone: 'Persuasive, authoritative, punchy, zero fluff'
  },
  {
    title: '🎨 Midjourney Photorealistic Image',
    targetModel: 'midjourney',
    role: 'Cinematic Visual Director & Midjourney V6 Master Prompt Creator',
    task: 'Cyberpunk neon city street at night, ultra-detailed 8k resolution, volumetric lighting, photorealistic camera lens 85mm f/1.4.',
    context: 'Unreal Engine 5 render style, ray tracing reflections, cinematic depth of field --ar 16:9 --v 6.0 --style raw',
    tone: 'Descriptive tags separated by commas'
  },
  {
    title: '📈 SEO Article Outline & Strategy',
    targetModel: 'seo',
    role: 'Head of Growth & Senior SEO Content Architect',
    task: 'Generate a comprehensive, search-intent-optimized H2/H3 blog post outline covering the selected topic.',
    context: 'Must target featured snippets, include FAQ schema section, and prioritize high-value search intent.',
    tone: 'Structured markdown hierarchy with clear section summaries'
  }
]

interface PromptGeneratorProps {
  onShowToast?: (msg: string) => void
}

export function PromptGenerator({ onShowToast }: PromptGeneratorProps) {
  const [targetModel, setTargetModel] = useState<'chatgpt' | 'claude' | 'midjourney' | 'coding' | 'seo'>('chatgpt')
  const [role, setRole] = useState('Senior AI Prompt Engineer')
  const [task, setTask] = useState('Create a detailed, step-by-step technical guide for setting up open-source software.')
  const [context, setContext] = useState('Intended for developers seeking zero-tracking self-hosted tools.')
  const [tone, setTone] = useState('Professional, clear, actionable markdown')
  const [copied, setCopied] = useState(false)

  const handleApplyPreset = (preset: PresetTemplate) => {
    setTargetModel(preset.targetModel)
    setRole(preset.role)
    setTask(preset.task)
    setContext(preset.context)
    setTone(preset.tone)
    if (onShowToast) {
      onShowToast(`Applied preset: ${preset.title}`)
    }
  }

  const generatedPrompt = `[ROLE & PERSONA]
You are a ${role}.

[TASK & OBJECTIVE]
${task}

[CONTEXT & BACKGROUND]
${context}

[FORMAT & CONSTRAINTS]
- Output Format: ${tone}
- Strict Rules: No generic filler, prioritize actionable details, adhere strictly to best practices. Provide step-by-step examples.`

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    if (onShowToast) {
      onShowToast('Enhanced AI Prompt copied to clipboard! 📋')
    }
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenChatGPT = () => {
    navigator.clipboard.writeText(generatedPrompt)
    window.open('https://chatgpt.com/', '_blank')
    if (onShowToast) {
      onShowToast('Prompt copied! Opening ChatGPT...')
    }
  }

  const handleOpenClaude = () => {
    navigator.clipboard.writeText(generatedPrompt)
    window.open('https://claude.ai/', '_blank')
    if (onShowToast) {
      onShowToast('Prompt copied! Opening Claude...')
    }
  }

  return (
    <section id="prompt-generator" className="prompt-gen-section bento-card" style={{ marginBottom: '3.5rem', padding: '2.25rem' }}>
      <div className="section-header-quiet">
        <span className="section-tag">05 / FREE UNLIMITED TOOL</span>
        <h2 className="section-title">⚡ Free AI Prompt Generator [Unlimited &amp; No Login]</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
          Craft ultra-effective, high-precision prompts for ChatGPT, Claude, Midjourney, and LLMs. Runs 100% in your browser RAM with zero account registration.
        </p>
      </div>

      {/* Preset Chips */}
      <div style={{ margin: '1.25rem 0 1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="tag-cloud-label" style={{ alignSelf: 'center' }}>Presets:</span>
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            className="tag-chip"
            onClick={() => handleApplyPreset(preset)}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            {preset.title}
          </button>
        ))}
      </div>

      <div className="prompt-gen-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
        {/* Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>TARGET AI MODEL</label>
            <select
              className="code-install-text search-input-field"
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value as any)}
              style={{ cursor: 'pointer', marginTop: '0.25rem' }}
            >
              <option value="chatgpt">🤖 ChatGPT (GPT-4o / O1)</option>
              <option value="claude">🧠 Claude 3.5 Sonnet</option>
              <option value="midjourney">🎨 Midjourney / DALL-E 3 Image Prompt</option>
              <option value="coding">💻 Expert Code Generator &amp; Refactorer</option>
              <option value="seo">📈 SEO Article &amp; Content Strategy</option>
            </select>
          </div>

          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI ROLE &amp; PERSONA</label>
            <input
              type="text"
              className="code-install-text search-input-field"
              placeholder="e.g. Senior Principal Engineer, Copywriting Specialist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ marginTop: '0.25rem' }}
            />
          </div>

          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TASK &amp; GOAL</label>
            <textarea
              rows={3}
              className="code-install-text search-input-field"
              placeholder="What specifically should the AI generate or analyze?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              style={{ marginTop: '0.25rem' }}
            />
          </div>

          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CONTEXT &amp; BACKGROUND</label>
            <input
              type="text"
              className="code-install-text search-input-field"
              placeholder="Additional background, target audience, technical stack"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{ marginTop: '0.25rem' }}
            />
          </div>

          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TONE &amp; OUTPUT FORMAT</label>
            <input
              type="text"
              className="code-install-text search-input-field"
              placeholder="e.g. Professional markdown, concise bullet points, 8k render tags"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ marginTop: '0.25rem' }}
            />
          </div>
        </div>

        {/* Live Output Box */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>GENERATED ENHANCED PROMPT</span>
              <span className="card-license-badge">100% Free • Unlimited</span>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', background: 'var(--surface-1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', maxHeight: '280px', overflowY: 'auto' }}>
              {generatedPrompt}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button className="btn-accent" onClick={handleCopyPrompt} style={{ flex: 1 }}>
              {copied ? 'Copied!' : '📋 Copy Prompt'}
            </button>
            <button className="btn-secondary-hero" onClick={handleOpenChatGPT} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              Open ChatGPT ↗
            </button>
            <button className="btn-secondary-hero" onClick={handleOpenClaude} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              Open Claude ↗
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
