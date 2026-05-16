import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Sparkles, Loader2, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { chatApi } from '@/services/api'
import { AIResponseRenderer } from '@/components/AIResponseRenderer'
import type { ChatMessage } from '@/types'

const SUGGESTED_PROMPTS = [
  "Why is CPU usage high?",
  "What are the top errors in recent logs?",
  "Explain the current system status",
  "Why is memory usage increasing?",
]

const QUICK_ACTIONS = [
  { label: "Analyze Logs", action: "Analyze the recent logs and identify issues" },
  { label: "System Health", action: "What is the current system health status?" },
  { label: "Alerts Summary", action: "Summarize the active alerts" },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Infrastructure Assistant. Ask me about your system metrics, logs, alerts, or any infrastructure questions.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: ChatMessage = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatApi.sendMessage(messageText)
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col p-4 pt-0">
      {/* Header */}
      <div className="flex-shrink-0 py-4">
        <h1 className="text-2xl font-bold text-slate-100">AI Assistant</h1>
        <p className="text-slate-400 text-sm">Chat with AI about your infrastructure</p>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-3 flex flex-col min-h-0"
        >
          <Card className="flex flex-col border-slate-800 min-h-0 flex-1">
            <CardHeader className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50 py-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent-primary" />
                <span className="text-slate-100">Chat</span>
                <span className="ml-auto text-xs text-slate-500">Powered by AI</span>
              </CardTitle>
            </CardHeader>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-4 py-3 rounded-2xl">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="w-full text-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-accent-primary" />
                        <span className="text-xs font-medium text-accent-primary">AI Response</span>
                      </div>
                      <AIResponseRenderer content={msg.content} />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                      <span className="text-sm text-slate-400">Analyzing and generating response...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sticky Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Ask about your infrastructure..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    rows={1}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>
                <Button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="bg-accent-primary hover:bg-accent-primary/90 px-4 h-12"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 min-h-0"
        >
          <Card className="border-slate-800">
            <CardHeader className="bg-slate-900/50 border-b border-slate-800">
              <CardTitle className="text-base text-slate-200">Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-lg bg-slate-800/50 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-all border border-transparent hover:border-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-800">
            <CardHeader className="bg-slate-900/50 border-b border-slate-800">
              <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {QUICK_ACTIONS.map((action, i) => (
                <Button
                  key={i}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start bg-slate-800/50 hover:bg-slate-800 border-slate-700"
                  onClick={() => sendMessage(action.action)}
                  disabled={loading}
                >
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent-primary" />
                <span className="text-sm font-medium text-slate-200">Pro Tip</span>
              </div>
              <p className="text-xs text-slate-400">
                Ask specific questions like "What's using most CPU?" or "Show me recent errors" for better results.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}