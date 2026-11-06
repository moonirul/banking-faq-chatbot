import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp, Bot, Check, Clock3, Landmark, LockKeyhole, MessageCircle,
  MoreHorizontal, Plus, ShieldCheck, Sparkles, Trash2, Wifi,
} from 'lucide-react'
import { sendChatMessage } from './lib/chatApi'

const FAQS = [
  'How can I open a bank account?',
  'How do I reset my PIN?',
  "What are the bank's opening hours?",
  'How can I check my account balance?',
  'What is the loan application process?',
]

function makeSessionId() {
  return globalThis.crypto?.randomUUID?.() ||
    `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

function Message({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`message-row ${isUser ? 'message-row-user' : ''}`}>
      {!isUser && <div className="bot-avatar small"><Bot size={16} /></div>}
      <div className={`message-content ${isUser ? 'message-content-user' : ''}`}>
        <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
          {message.text}
        </div>
        <div className={`message-meta ${isUser ? 'meta-user' : ''}`}>
          <span>{isUser ? 'You' : 'Banking Assistant'}</span>
          <span className="meta-dot">·</span>
          <time>{formatTime(message.createdAt)}</time>
          {isUser && <Check size={12} className="read-check" />}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="message-row">
      <div className="bot-avatar small"><Bot size={16} /></div>
      <div className="typing-wrap" aria-label="Assistant is typing">
        <span /><span /><span />
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(makeSessionId)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const hasMessages = messages.length > 0
  const canSend = input.trim().length > 0 && !isLoading

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  async function handleSend(value = input) {
    const text = value.trim()
    if (!text || isLoading) return
    setError('')
    setInput('')
    const userMessage = { id: crypto.randomUUID?.() || `${Date.now()}-u`, role: 'user', text, createdAt: new Date() }
    setMessages((current) => [...current, userMessage])
    setIsLoading(true)

    try {
      const answer = await sendChatMessage(text, sessionId)
      setMessages((current) => [...current, {
        id: crypto.randomUUID?.() || `${Date.now()}-a`,
        role: 'assistant',
        text: answer,
        createdAt: new Date(),
      }])
    } catch (err) {
      setError(err?.message || 'We could not connect right now. Please try again.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function clearChat() {
    if (isLoading) return
    setMessages([])
    setError('')
    setInput('')
    setSessionId(makeSessionId())
    inputRef.current?.focus()
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="chat-window" aria-label="Banking Assistant chatbot">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><Landmark size={23} strokeWidth={1.8} /></div>
            <div>
              <div className="brand-title">Banking Assistant</div>
              <div className="brand-subtitle"><span className="online-dot" /> Here to help, anytime</div>
            </div>
          </div>
          <div className="header-actions">
            <div className="secure-label"><ShieldCheck size={14} /> Secure support</div>
            <button className="icon-button" onClick={clearChat} disabled={isLoading} title="Clear conversation" aria-label="Clear conversation">
              <Trash2 size={17} />
            </button>
          </div>
        </header>

        <div className="chat-body">
          {!hasMessages ? (
            <div className="welcome-screen">
              <div className="welcome-icon"><div className="welcome-icon-inner"><Bot size={31} /></div><span className="sparkle"><Sparkles size={15} /></span></div>
              <div className="eyebrow">YOUR DIGITAL BANKING COMPANION</div>
              <h1>Hello there<span className="wave">,</span><br /><span>how can I help?</span></h1>
              <p className="welcome-copy">Ask me about accounts, cards, payments, loans and everyday banking. I’m here to make things simpler.</p>
              <div className="suggestion-heading"><span>POPULAR QUESTIONS</span><span className="suggestion-line" /></div>
              <div className="suggestions">
                {FAQS.map((faq, index) => (
                  <button className="suggestion" key={faq} onClick={() => handleSend(faq)} disabled={isLoading}>
                    <span className="suggestion-number">0{index + 1}</span>
                    <span>{faq}</span>
                    <ArrowUp size={15} className="suggestion-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="conversation">
              <div className="conversation-date"><span /> TODAY <span /></div>
              {messages.map((message) => <Message key={message.id} message={message} />)}
              {isLoading && <TypingIndicator />}
              {error && (
                <div className="error-message" role="alert">
                  <div><Wifi size={16} /><span>{error}</span></div>
                  <button onClick={() => handleSend(messages.filter(m => m.role === 'user').at(-1)?.text || '')}>Try again</button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="composer-area">
          {error && !hasMessages && <div className="error-message" role="alert">{error}</div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); handleSend() }}>
            <div className="input-leading"><MessageCircle size={18} /></div>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me anything about banking..."
              aria-label="Type your banking question"
              disabled={isLoading}
              maxLength={1200}
            />
            <span className="input-divider" />
            <button className={`send-button ${canSend ? 'send-active' : ''}`} type="submit" disabled={!canSend} aria-label="Send message">
              <ArrowUp size={19} />
            </button>
          </form>
          <div className="composer-bottom">
            <span><LockKeyhole size={12} /> Your conversations are for general guidance only.</span>
            <span>Press <kbd>Enter</kbd> to send</span>
          </div>
          <div className="disclaimer"><ShieldCheck size={13} /> Never share your PIN, password, OTP or full card number in this chat.</div>
        </footer>
      </section>
      <div className="page-footer"><span>© {new Date().getFullYear()} Banking Assistant</span><span>General information · Not a banking transaction service</span></div>
    </main>
  )
}