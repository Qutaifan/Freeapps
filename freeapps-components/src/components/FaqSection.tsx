import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'Are all software tools listed on THEHUB genuinely free?',
    answer: 'Yes. Every tool indexed in THEHUB is either 100% open-source under licenses like MIT, GPL, or Apache-2.0, or offers a permanent free tier with zero hidden credit card requirements.'
  },
  {
    question: 'How does THEHUB ensure user privacy and security?',
    answer: 'We prioritize client-side WebAssembly apps and local RAM processing tools (like Photopea, CryptPad, and KeePassXC) that process data directly on your device without transmitting private files to external servers.'
  },
  {
    question: 'Can I self-host the open-source tools featured here?',
    answer: 'Absolutely. Over 80% of our featured utilities and databases (such as Bitwarden, Supabase, CryptPad, and LocalSend) include Docker compose files and binaries for local or self-hosted deployment.'
  },
  {
    question: 'How is THEHUB funded?',
    answer: 'THEHUB is independently operated and supported via privacy-friendly Google AdSense advertisements. We do not use affiliate tracking links or paid placement listings.'
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="bento-card" style={{ marginBottom: '3.5rem', padding: '2.25rem' }}>
      <div className="section-header-quiet">
        <span className="section-tag">04 / FREQUENTLY ASKED QUESTIONS</span>
        <h2 className="section-title">Everything You Need To Know</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <div
              key={idx}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 150ms ease'
              }}
              onClick={() => toggleFaq(idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{faq.question}</h4>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                  {isOpen ? '−' : '+'}
                </span>
              </div>
              {isOpen && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {faq.answer}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
