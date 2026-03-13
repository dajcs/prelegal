'use client'

import { useState, useRef, useEffect } from 'react'
import { NDAFormData } from '@/lib/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  data: NDAFormData
  onUpdates: (updates: Partial<NDAFormData>) => void
}

export default function ChatPanel({ data, onUpdates }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Kick off the conversation on mount
  useEffect(() => {
    sendToAI([])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendToAI(msgs: Message[]) {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, current_data: {} }),
      })
      const json = await res.json()
      const aiMsg: Message = { role: 'assistant', content: json.message }
      setMessages((prev) => [...prev, aiMsg])
      if (json.updates && Object.keys(json.updates).length > 0) {
        onUpdates(json.updates)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    await sendToAI(newMessages)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!loading) inputRef.current?.focus()
  }, [loading])

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#209dd7] text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <span className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#209dd7] focus:ring-1 focus:ring-[#209dd7]"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="rounded-full bg-[#753991] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-[#5e2d75] transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
