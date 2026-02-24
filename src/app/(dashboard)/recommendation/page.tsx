'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Trash2,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Package,
  CreditCard,
  BarChart3,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AIDisplay } from '@/components/ai/ai-display'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface QuestionCategory {
  title: string
  icon: React.ReactNode
  questions: string[]
}

const questionCategories: QuestionCategory[] = [
  {
    title: 'Statistik Umum',
    icon: <BarChart3 className="w-4 h-4" />,
    questions: [
      'Berapa total transaksi bulan ini?',
      'Berapa total revenue bulan ini?',
      'Berapa rata-rata nilai transaksi?',
      'Berapa total profit bulan ini?'
    ]
  },
  {
    title: 'Produk & Penjualan',
    icon: <Package className="w-4 h-4" />,
    questions: [
      'Produk apa yang paling banyak terjual?',
      'Produk apa dengan revenue tertinggi?',
      'Produk apa yang perlu perhatian?',
      'Berapa total unit terjual?'
    ]
  },
  {
    title: 'Department & Lokasi',
    icon: <MapPin className="w-4 h-4" />,
    questions: [
      'Department mana dengan penjualan tertinggi?',
      'Kota mana dengan transaksi tertinggi?',
      'Region mana yang paling baik?',
      'Department mana yang perlu dievaluasi?'
    ]
  },
  {
    title: 'Waktu & Lalu Lintas',
    icon: <Clock className="w-4 h-4" />,
    questions: [
      'Jam berapa paling banyak pesanan?',
      'Kapan waktu transaksi tertinggi?',
      'Bagaimana tren penjualan?'
    ]
  },
  {
    title: 'Pembayaran',
    icon: <CreditCard className="w-4 h-4" />,
    questions: [
      'Metode penjualan apa yang paling sering digunakan?',
      'Metode apa dengan nilai tertinggi?',
      'Metode pembayaran mana yang paling populer?'
    ]
  },
  {
    title: 'Insights & Forecast',
    icon: <TrendingUp className="w-4 h-4" />,
    questions: [
      'Apa insights untuk meningkatkan penjualan?',
      'Prediksi revenue bulan depan?',
      'Bagaimana tren penjualan bulan ini?',
      'Rekomendasi untuk meningkatkan revenue?'
    ]
  }
]

const quickActions = [
  'Ringkasan dashboard',
  'Produk terlaris',
  'Top Department',
  'Rekomendasi strategis'
]

export default function RecommendationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const allowedRoles = ['GM', 'ADMIN_PUSAT', 'MANAGER']
  
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasData, setHasData] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && !allowedRoles.includes(userRole)) router.push('/')
  }, [status, userRole, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError('')
    setQuery('')

    try {
      const response = await fetch('/api/v1/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      if (data.answer) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.answer,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        
        try {
          await fetch('/api/chat/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: userMessage.content,
              answer: data.answer,
              type: 'recommendation'
            })
          })
        } catch (saveErr) {
          console.error('Error saving chat:', saveErr)
        }
      } else if (data.error) {
        throw new Error(data.error + (data.debug ? `\n\nDebug: ${JSON.stringify(data.debug, null, 2)}` : ''))
      } else if (data.debug && data.debug.summaryCount === 0) {
        throw new Error(`Database tidak memiliki data. Silakan upload data terlebih dahulu.\n\nDebug Info:\n- Summary Count: ${data.debug.summaryCount}\n- Restaurant Count: ${data.debug.restaurantCount}\n- Recent Orders: ${data.debug.recentOrdersCount}`)
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Maaf, terjadi kesalahan: ${err.message}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  if (status === 'loading') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#054CC7] mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50 w-full overflow-hidden relative">
      
      {!hasData && (
        <div className="bg-amber-50 p-2 md:p-3 text-amber-700 text-xs flex items-center justify-center gap-2 border-b border-amber-200 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Belum ada data di database. Silakan upload data terlebih dahulu.
        </div>
      )}

      {/* HEADER DIUBAH WARNANYA DISINI */}
      <div className="shrink-0 text-white p-3 md:p-6" style={{ background: 'linear-gradient(135deg, #054CC7 0%, #17C3CC 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-base md:text-2xl font-bold leading-tight">
                AI Assistant
              </h1>
              <p className="text-[10px] md:text-sm mt-0.5 text-blue-100">
                Artavista Sales Insights
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 text-[9px] md:text-xs py-1 rounded-md font-medium shrink-0">
            <Bot className="w-3 h-3 md:mr-1 hidden md:inline-block" />
            RAG Powered
          </Badge>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto p-2 md:p-4 lg:p-6 flex flex-row gap-2 md:gap-6 min-h-0 overflow-hidden">
        
        {/* 1. Sidebar Kiri */}
        <Card className="w-[115px] sm:w-[140px] md:w-[260px] lg:w-[280px] shrink-0 h-full flex flex-col border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="p-3 md:p-4 border-b border-slate-100 shrink-0 bg-white rounded-t-xl">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-base font-bold text-slate-800">
              <Lightbulb className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-500 shrink-0" />
              <span>Pertanyaan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden bg-slate-50/30">
            <ScrollArea className="h-full">
              <div className="p-2 md:p-4 space-y-5">
                
                {/* Pintasan */}
                <div>
                  <p className="text-[9px] md:text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider pl-1">
                    Pintasan
                  </p>
                  <div className="space-y-1.5">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(action)}
                        className="w-full flex items-start text-left px-2 py-1.5 md:px-3 md:py-2 rounded-md hover:bg-slate-200/50 text-slate-700 text-[10px] md:text-sm font-medium transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 mr-1 mt-0.5 shrink-0 text-slate-400 hidden md:block" />
                        <span className="leading-snug">{action}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                {/* Daftar Kategori Pertanyaan */}
                {questionCategories.map((category, catIdx) => (
                  <div key={catIdx} className="mb-4">
                    <p className="text-[9px] md:text-xs font-bold text-[#054CC7] mb-2 uppercase tracking-wider flex items-center gap-1.5 md:gap-2 pl-1">
                      <span className="[&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4 shrink-0">
                        {category.icon}
                      </span>
                      <span>{category.title}</span>
                    </p>
                    <div className="space-y-2">
                      {category.questions.map((question, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleExampleClick(question)}
                          className="w-full text-left px-2.5 py-2 md:px-3 md:py-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#054CC7]/50 hover:bg-[#054CC7]/5 text-slate-600 hover:text-[#054CC7] text-[10px] md:text-sm leading-snug shadow-sm transition-all"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 2. Area Chat Utama */}
        <Card className="flex-1 h-full flex flex-col border-slate-200 shadow-sm rounded-xl overflow-hidden min-w-0">
          <CardHeader className="py-2.5 md:p-4 border-b border-slate-100 bg-white shrink-0 z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 md:gap-2 text-[12px] md:text-lg text-slate-800">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-[#054CC7] shrink-0" />
                <span className="truncate">Chat AI</span>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-1 md:ml-2 text-[9px] md:text-xs rounded-md bg-[#054CC7]/10 text-[#054CC7]">
                    {messages.length} pesan
                  </Badge>
                )}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearChat}
                disabled={messages.length === 0}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-7 md:h-9 px-2 md:px-3 rounded-md text-[10px] md:text-sm transition-colors"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 md:mr-1.5" />
                <span className="hidden md:inline-block">Bersihkan Chat</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0 bg-slate-50/50">
            <ScrollArea className="flex-1 p-2 md:p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-2 py-6 md:py-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#054CC7]/10 to-[#17C3CC]/20 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-sm shrink-0">
                    <Bot className="w-8 h-8 md:w-10 md:h-10 text-[#054CC7]" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-slate-800 mb-2">
                    Halo, Saya AI Assistant
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md text-[11px] md:text-sm leading-relaxed">
                    Saya terhubung dengan data penjualan Anda. Pilih pertanyaan di menu sebelah kiri atau ketik langsung di bawah.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-md w-full">
                    <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 md:gap-2 text-center sm:text-left hover:bg-slate-50 transition-colors">
                      <div className="bg-[#054CC7]/10 p-1.5 md:p-2 rounded-lg shrink-0"><BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-[#054CC7]" /></div>
                      <span className="font-semibold text-[10px] md:text-sm text-slate-700 truncate w-full">Statistik</span>
                    </div>
                    <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 md:gap-2 text-center sm:text-left hover:bg-slate-50 transition-colors">
                      <div className="bg-green-50 p-1.5 md:p-2 rounded-lg shrink-0"><TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" /></div>
                      <span className="font-semibold text-[10px] md:text-sm text-slate-700 truncate w-full">Forecasting</span>
                    </div>
                    <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 md:gap-2 text-center sm:text-left hover:bg-slate-50 transition-colors">
                      <div className="bg-purple-50 p-1.5 md:p-2 rounded-lg shrink-0"><Package className="w-4 h-4 md:w-5 md:h-5 text-purple-600" /></div>
                      <span className="font-semibold text-[10px] md:text-sm text-slate-700 truncate w-full">Produk</span>
                    </div>
                    <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 md:gap-2 text-center sm:text-left hover:bg-slate-50 transition-colors">
                      <div className="bg-amber-50 p-1.5 md:p-2 rounded-lg shrink-0"><DollarSign className="w-4 h-4 md:w-5 md:h-5 text-amber-600" /></div>
                      <span className="font-semibold text-[10px] md:text-sm text-slate-700 truncate w-full">Revenue</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 md:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#054CC7] to-[#17C3CC] flex items-center justify-center shrink-0 shadow-sm mt-1">
                          <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[85%] px-3 py-2.5 md:px-5 md:py-4 rounded-xl md:rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-[#054CC7] to-[#0a66f0] text-white rounded-tr-sm shadow-md'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {message.type === 'ai' ? (
                          <AIDisplay content={message.content} />
                        ) : (
                          <div className="text-[11px] md:text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                        )}
                        <div className={`text-[9px] md:text-xs mt-2 pt-2 border-t ${message.type === 'user' ? 'text-blue-100 border-[#17C3CC]/30' : 'text-slate-400 border-slate-100'}`}>
                          {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-sm mt-1">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 md:gap-4 justify-start max-w-4xl mx-auto">
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#054CC7] to-[#17C3CC] flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="bg-white border border-slate-200 px-4 py-3 md:px-5 md:py-4 rounded-xl md:rounded-2xl rounded-tl-sm shadow-sm">
                        <div className="flex gap-1 md:gap-1.5 h-full items-center">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#17C3CC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#054CC7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#17C3CC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg md:rounded-xl text-red-600 text-[11px] md:text-sm shadow-sm max-w-4xl mx-auto">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-2" />
                </div>
              )}
            </ScrollArea>

            {/* Area Input Chat */}
            <form onSubmit={handleSubmit} className="p-2 md:p-4 bg-white border-t border-slate-200 shrink-0 z-10">
              <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  className="flex-1 h-10 md:h-12 text-[11px] md:text-sm px-3 md:px-4 rounded-lg bg-slate-50 border-slate-200 focus-visible:ring-[#054CC7] focus-visible:bg-white transition-colors"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="h-10 md:h-12 w-10 md:w-14 lg:w-auto px-0 lg:px-6 bg-[#054CC7] hover:bg-blue-800 text-white shadow-md transition-all shrink-0 rounded-lg flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 md:w-5 md:h-5 lg:mr-2" />
                      <span className="hidden lg:inline font-semibold">Kirim</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}