'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ShoppingCart, 
  TrendingUp,
  MapPin,
  Calendar,
  ArrowUpRight,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as echarts from 'echarts'
import { EBarChart, EPieChart } from '@/components/charts/echart-components'

interface FilterState {
  retailer: string
  month: string
  product: string
  method: string
  city: string
}

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  avgOrderValue: number
  avgMargin: number
  pizzaSizes: { label: string; value: number }[]
  pizzaTypes: { label: string; value: number }[]
  deliveryPerformance: { label: string; value: number }[]
  trafficImpact: { label: string; value: number }[]
  paymentMethods: { label: string; value: number }[]
  ordersByRestaurant: { label: string; value: number }[]
  byCity: { label: string; value: number }[]
}

interface FilterOptions {
  retailers: { id_retailer: number; retailer_name: string }[]
  products: { id_product: number; product: string }[]
  methods: { id_method: number; method: string }[]
  cities: { id_city: number; city: string }[]
  months: string[]
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  cyan: '#06b6d4'
}

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)} JT`
  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)} RB`
  return `Rp ${value.toFixed(0)}`
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)} RB`
  return value.toLocaleString('id-ID')
}

function formatCurrencyFull(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`
}

// KOMPONEN LINE CHART BARU (Diadaptasi dari Forecasting)
function DashboardLineChart({ data, color = '#3b82f6', isCurrency = true, height = 320 }: { data: {label: string, value: number}[], color?: string, isCurrency?: boolean, height?: number }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const formatMonthLabel = (dateStr: string) => {
    try {
      if (dateStr.includes('-')) {
        const [year, month] = dateStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} ${year.length === 4 ? year.substring(2) : year}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)
    return () => chartInstance.current?.dispose()
  }, [])

  useEffect(() => {
    if (!chartInstance.current || !data.length) return

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: '#334155' },
        formatter: (params: any) => {
          const val = params[0];
          const cleanDate = formatMonthLabel(val.name);
          return `
            <div style="font-weight:700; margin-bottom:6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              ${cleanDate}
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${val.color};"></span>
              <span style="color:#64748b">Revenue:</span>
              <span style="font-weight:700">${isCurrency ? formatCurrency(val.value) : formatNumber(val.value)}</span>
            </div>
          `;
        }
      },
      dataZoom: [
        { 
          type: 'inside', 
          start: data.length > 12 ? 60 : 0, 
          end: 100 
        },
        { 
          start: 0, 
          end: 100, 
          bottom: 10, 
          height: 12, 
          handleSize: '80%', 
          borderColor: 'transparent', 
          backgroundColor: '#f1f5f9', 
          fillerColor: 'rgba(59, 130, 246, 0.2)' 
        }
      ],
      // Bottom diperbesar (75) agar label x-axis yang miring dan slider dataZoom tidak tabrakan
      grid: { left: 55, right: 20, top: 20, bottom: 75 }, 
      xAxis: {
        type: 'category',
        data: data.map(d => d.label),
        boundaryGap: false,
        axisLabel: { 
            color: '#64748b', 
            fontSize: 10, 
            rotate: 45, 
            hideOverlap: true,
            formatter: (value: string) => formatMonthLabel(value)
        },
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (v: number) => isCurrency ? formatCurrency(v) : formatNumber(v) },
        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
      },
      series: [
        {
          type: 'line',
          data: data.map(d => d.value),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '05' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => isCurrency ? formatCurrency(params.value) : formatNumber(params.value),
            color: '#475569',
            fontSize: 10,
            fontWeight: 'bold'
          }
        }
      ],
      animationDuration: 1000
    }

    chartInstance.current.setOption(option, true)
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data, color, isCurrency])

  return <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />
}
// BATAS KOMPONEN BARU

function DataSlicer({ 
  filters, 
  setFilters, 
  filterOptions,
  activeFiltersCount,
  onClearFilters
}: {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  filterOptions: FilterOptions
  activeFiltersCount: number
  onClearFilters: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div 
        className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Filter Data</h3>
            <p className="text-xs text-slate-500">Filter data untuk analisis yang lebih spesifik</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeFiltersCount} filter aktif
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClearFilters()
            }}
            disabled={activeFiltersCount === 0}
          >
            Reset
          </Button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Retailer</label>
              <Select value={filters.retailer} onValueChange={(value) => setFilters(prev => ({ ...prev, retailer: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Retailer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Retailer</SelectItem>
                  {filterOptions.retailers?.map(r => <SelectItem key={r.id_retailer} value={String(r.id_retailer)}>{r.retailer_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Bulan</label>
              <Select value={filters.month} onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Bulan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {filterOptions.months?.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Produk</label>
              <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Produk" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Produk</SelectItem>
                  {filterOptions.products?.map(p => <SelectItem key={p.id_product} value={p.product}>{p.product}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Metode</label>
              <Select value={filters.method} onValueChange={(value) => setFilters(prev => ({ ...prev, method: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Metode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  {filterOptions.methods?.map(m => <SelectItem key={m.id_method} value={m.method}>{m.method}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Kota</label>
              <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Kota" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kota</SelectItem>
                  {filterOptions.cities?.map(c => <SelectItem key={c.id_city} value={c.city}>{c.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ 
  title, 
  value, 
  unit,
  icon, 
  color,
  bgColor = 'bg-slate-50',
  subtext,
  isGradient = false,
  insight
}: { 
  title: string
  value: string
  unit?: string
  icon: React.ReactNode
  color?: string
  bgColor?: string
  subtext?: string
  isGradient?: boolean
  insight?: string
}) {
  return (
    <Card className={`h-full transition-all hover:shadow-md ${isGradient ? 'border-0' : ''}`} style={isGradient ? { background: 'linear-gradient(135deg, #054CC7 0%, #17C3CC 100%)' } : {}}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-xs font-bold ${isGradient ? 'text-blue-100' : 'text-slate-600'}`}>{title}</p>
            <p className={`text-3xl font-bold mt-1 ${isGradient ? 'text-white' : color || 'text-slate-800'}`}>
              {value} 
              {unit && <span className="text-lg font-normal ml-1"> {unit}</span>}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isGradient ? 'bg-white/20' : bgColor}`}>
            {icon}
          </div>
        </div>
        
        {subtext && (
          <p className={`text-xs mt-2 ${isGradient ? 'text-blue-100' : 'text-slate-400'}`}>{subtext}</p>
        )}

        {insight && (
          <div className={`mt-3 p-3 rounded-lg text-xs ${isGradient ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-800 border-l-2 border-amber-400'}`}>
            <span className="font-semibold">{insight}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, description, children, insight, recommendation }: {
  title: string
  description: string
  children: React.ReactNode
  insight?: string
  recommendation?: string
}) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const hasContent = insight || recommendation

  return (
    <Card className="h-full flex flex-col overflow-hidden relative">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">{description}</CardDescription>
          </div>
          {hasContent && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-medium">Insight</span>
                {showDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-4">
                  {insight && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Insight</p>
                      <p className="text-sm text-slate-700">{insight}</p>
                    </div>
                  )}
                  {recommendation && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Rekomendasi</p>
                      <p className="text-sm text-slate-700">{recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] p-4 flex flex-col justify-center">
        {children}
      </CardContent>
    </Card>
  )
}

function EmptyChart({ message = "Belum ada data" }: { message?: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
        <ShoppingCart className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-400 text-xs">{message}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ retailers: [], products: [], methods: [], cities: [], months: [] })
  const [isLoading, setIsLoading] = useState(true)
  
  const [filters, setFilters] = useState<FilterState>({
    retailer: 'all',
    month: 'all',
    product: 'all',
    method: 'all',
    city: 'all'
  })

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const userName = session?.user?.name || ''
  const allowedRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT', 'ASMAN', 'ASISTEN_MANAGER', 'STAFF']
  const isStaff = userRole === 'STAFF'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && !allowedRoles.includes(userRole)) router.push('/upload')
  }, [status, userRole, router])

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    loadStats()
  }, [filters])

  const loadFilterOptions = async () => {
    try {
      const res = await fetch('/api/dashboard/filter-options')
      const data = await res.json()
      setFilterOptions(data)
    } catch (err) {
      console.error('Error loading filter options:', err)
    }
  }

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.retailer !== 'all') params.set('retailer', filters.retailer)
      if (filters.month !== 'all') params.set('month', filters.month)
      if (filters.product !== 'all') params.set('product', filters.product)
      if (filters.method !== 'all') params.set('method', filters.method)
      if (filters.city !== 'all') params.set('city', filters.city)
      
      const res = await fetch(`/api/dashboard/charts?${params.toString()}`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length
  const clearFilters = () => setFilters({ retailer: 'all', month: 'all', product: 'all', method: 'all', city: 'all' })

  if (status === 'loading' || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80 text-lg">Memuat Dashboard...</p>
        </div>
      </div>
    )
  }

  const hasData = stats && stats.totalOrders > 0

  if (!hasData && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="text-white p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #054CC7 0%, #17C3CC 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold">Artavista Sales Dashboard</h1>
            <p className="mt-2 text-xs md:text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Selamat datang, <span className="font-semibold text-white">{userName}</span> - {userRole}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Belum Ada Data</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Data penjualan Artavista belum tersedia. Silakan upload data penjualan terlebih dahulu.</p>
            <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors">
              Upload Data
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="text-white p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #054CC7 0%, #17C3CC 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                Artavista Dashboard
              </h1>
              <p className="mt-2 text-xs md:text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Selamat datang, <span className="font-semibold text-white">{userName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/20 px-4 py-2 rounded-full" style={{ color: 'white' }}>
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* KPI Cards (Berlaku untuk semua Role) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard 
                title="Total Revenue" 
                value={formatCurrency(stats?.totalRevenue || 0)}
                icon={<DollarSign className="w-6 h-6 text-white" />}
                isGradient={true}
                subtext="Total pendapatan"
                insight={`Total revenue ${formatCurrencyFull(stats?.totalRevenue || 0)} dalam periode ini.`}
              />

              <KPICard 
                title="Total Units Terjual" 
                value={formatNumber(stats?.totalOrders || 0)}
                icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
                color="text-blue-600"
                bgColor="bg-blue-50"
                subtext="Total unit terjual"
                insight={`${(stats?.totalOrders || 0).toLocaleString()} unit terjual dalam periode ini.`}
              />

              <KPICard 
                title="Operating Profit" 
                value={formatCurrency(stats?.totalProfit || 0)}
                icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                color="text-green-600"
                bgColor="bg-green-50"
                subtext="Total keuntungan operasi"
                insight={`Total profit ${formatCurrencyFull(stats?.totalProfit || 0)} dengan margin ${(stats?.avgMargin || 0).toFixed(1)}%.`}
              />

              <KPICard 
                title="Rata-rata Order" 
                value={formatCurrency(stats?.avgOrderValue || 0)}
                icon={<MapPin className="w-6 h-6 text-amber-600" />}
                color="text-amber-600"
                bgColor="bg-amber-50"
                subtext="Nilai rata-rata per transaksi"
                insight={`Rata-rata setiap transaksi bernilai ${formatCurrencyFull(stats?.avgOrderValue || 0)}.`}
              />
            </div>

            {/* CONDITIONAL LAYOUT BERDASARKAN ROLE */}
            {isStaff ? (
              /* ===== LAYOUT KHUSUS STAFF ===== */
              <>
                {/* Charts Grid - Row 1 (Staff): Full Width Line Chart */}
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <ChartCard
                    title="Tren Penjualan per Bulan"
                    description="Visualisasi total penjualan Artavista per bulan"
                    insight={stats?.deliveryPerformance && stats.deliveryPerformance.length > 0 ? `Total revenue periode ini: ${formatCurrency(stats.deliveryPerformance.reduce((s: number, d: {value: number}) => s + d.value, 0))}` : undefined}
                    recommendation="Pastikan stock mencukupi pada bulan dengan penjualan tinggi. Pertimbangkan promo pada bulan dengan penjualan rendah."
                  >
                    {stats?.deliveryPerformance?.length ? (
                      <DashboardLineChart data={stats.deliveryPerformance} color={COLORS.primary} isCurrency={true} height={320} />
                    ) : <EmptyChart message="Belum ada data penjualan" />}
                  </ChartCard>
                </div>

                {/* Charts Grid - Row 2 (Staff): 3 Kolom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <ChartCard
                    title="Revenue per Produk"
                    description="Revenue berdasarkan produk (Top 6)"
                    insight={stats?.pizzaTypes && stats.pizzaTypes.length > 0 ? `Total revenue produk: ${formatCurrency(stats.pizzaTypes.slice(0,6).reduce((s: number, d: {value: number}) => s + d.value, 0))}` : undefined}
                    recommendation="Fokuskan pada produk dengan revenue tertinggi untuk maximize profit."
                  >
                    {stats?.pizzaTypes?.length ? (
                      <EPieChart data={stats.pizzaTypes.slice(0, 6)} colors={[COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.danger, COLORS.cyan]} height={300} isCurrency={true} />
                    ) : <EmptyChart message="Belum ada data produk" />}
                  </ChartCard>

                  <ChartCard
                    title="Metode Penjualan"
                    description="Distribusi metode penjualan yang digunakan"
                    insight={stats?.paymentMethods && stats.paymentMethods.length > 0 ? `Metode paling banyak: ${stats.paymentMethods[0]?.label || '-'}` : undefined}
                    recommendation="Pastikan sistem penjualan utama berjalan lancer. Eksplorasi metode alternatif."
                  >
                    {stats?.paymentMethods?.length ? (
                      <EPieChart data={stats.paymentMethods} colors={[COLORS.accent, COLORS.primary, COLORS.warning, COLORS.danger, COLORS.cyan]} height={300} />
                    ) : <EmptyChart message="Belum ada data metode" />}
                  </ChartCard>

                  <ChartCard
                    title="Produk Terlaris"
                    description="Produk dengan jumlah unit terjual tertinggi"
                    insight={stats?.pizzaSizes && stats.pizzaSizes.length > 0 ? `Produk paling laris: ${stats.pizzaSizes[0]?.label || '-'} dengan ${stats.pizzaSizes[0]?.value?.toLocaleString() || 0} unit` : undefined}
                    recommendation="Pastikan stock produk terlaris selalu tersedia. Fokuskan marketing pada produk dengan potensi tinggi."
                  >
                    {stats?.pizzaSizes?.length ? (
                      <EPieChart data={stats.pizzaSizes} height={300} />
                    ) : <EmptyChart message="Belum ada data produk" />}
                  </ChartCard>
                </div>

                {/* Charts Grid - Row 3 (Staff): 2 Kolom (Revenue per Kota & Top 5 Produk) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title="Revenue per Kota"
                    description="Distribusi revenue berdasarkan kota (Top 10)"
                    insight={stats?.byCity && stats.byCity.length > 0 ? `Kota dengan revenue tertinggi: ${stats.byCity[0]?.label || '-'}` : undefined}
                    recommendation="Fokuskan ekspansi dan marketing di kota-kota dengan potensi tinggi."
                  >
                    {stats?.byCity?.length ? (
                      <EBarChart data={stats.byCity.slice(0, 10)} color={COLORS.warning} isCurrency={true} height={300} />
                    ) : <EmptyChart message="Belum ada data kota" />}
                  </ChartCard>

                  <ChartCard
                    title="Top 5 Produk"
                    description="Produk dengan volume penjualan tertinggi"
                    insight={stats?.pizzaSizes && stats.pizzaSizes.length > 0 ? `Top 5 produk berkontribusi besar terhadap total penjualan.` : undefined}
                    recommendation="Jaga ketersediaan stock untuk produk top 5. Pertimbangkan bundle promo."
                  >
                    {stats?.pizzaSizes?.length ? (
                      <EBarChart data={stats.pizzaSizes.slice(0, 5)} color={COLORS.secondary} height={300} />
                    ) : <EmptyChart message="Belum ada data produk" />}
                  </ChartCard>
                </div>
              </>
            ) : (
              /* ===== LAYOUT GM / MANAGER DLL (Selain Staff) ===== */
              <>
                {/* Charts Grid - Row 1: Line Chart Full Width (1 Tahun Terakhir / 12 Data) */}
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <ChartCard
                    title="Tren Penjualan per Bulan (1 Tahun Terakhir)"
                    description="Visualisasi total penjualan Artavista per bulan"
                    insight={stats?.deliveryPerformance && stats.deliveryPerformance.length > 0 ? `Total revenue 1 tahun terakhir: ${formatCurrency(stats.deliveryPerformance.slice(-12).reduce((s: number, d: {value: number}) => s + d.value, 0))}` : undefined}
                    recommendation="Pastikan stock mencukupi pada bulan dengan penjualan tinggi. Pertimbangkan promo pada bulan dengan penjualan rendah."
                  >
                    {stats?.deliveryPerformance?.length ? (
                      <DashboardLineChart data={stats.deliveryPerformance.slice(-12)} color={COLORS.primary} isCurrency={true} height={320} />
                    ) : <EmptyChart message="Belum ada data penjualan" />}
                  </ChartCard>
                </div>

                {/* Charts Grid - Row 2: 3 Kolom untuk Pie Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <ChartCard
                    title="Produk Terlaris"
                    description="Produk dengan jumlah unit terjual tertinggi"
                    insight={stats?.pizzaSizes && stats.pizzaSizes.length > 0 ? `Produk paling laris: ${stats.pizzaSizes[0]?.label || '-'} dengan ${stats.pizzaSizes[0]?.value?.toLocaleString() || 0} unit` : undefined}
                    recommendation="Pastikan stock produk terlaris selalu tersedia. Fokuskan marketing pada produk dengan potensi tinggi."
                  >
                    {stats?.pizzaSizes?.length ? (
                      <EPieChart data={stats.pizzaSizes} height={300} />
                    ) : <EmptyChart message="Belum ada data produk" />}
                  </ChartCard>

                  <ChartCard
                    title="Revenue per Produk"
                    description="Revenue berdasarkan produk (Top 6)"
                    insight={stats?.pizzaTypes && stats.pizzaTypes.length > 0 ? `Total revenue produk: ${formatCurrency(stats.pizzaTypes.slice(0,6).reduce((s: number, d: {value: number}) => s + d.value, 0))}` : undefined}
                    recommendation="Fokuskan pada produk dengan revenue tertinggi untuk maximize profit."
                  >
                    {stats?.pizzaTypes?.length ? (
                      <EPieChart data={stats.pizzaTypes.slice(0, 6)} colors={[COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.danger, COLORS.cyan]} height={300} isCurrency={true} />
                    ) : <EmptyChart message="Belum ada data produk" />}
                  </ChartCard>

                  <ChartCard
                    title="Metode Penjualan"
                    description="Distribusi metode penjualan yang digunakan"
                    insight={stats?.paymentMethods && stats.paymentMethods.length > 0 ? `Metode paling banyak: ${stats.paymentMethods[0]?.label || '-'}` : undefined}
                    recommendation="Pastikan sistem penjualan utama berjalan lancer. Eksplorasi metode alternatif."
                  >
                    {stats?.paymentMethods?.length ? (
                      <EPieChart data={stats.paymentMethods} colors={[COLORS.accent, COLORS.primary, COLORS.warning, COLORS.danger, COLORS.cyan]} height={300} />
                    ) : <EmptyChart message="Belum ada data metode" />}
                  </ChartCard>
                </div>

                {/* Charts Grid - Row 3: 2 Kolom (Top 5 Produk & Revenue per Department) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <ChartCard
                    title="Top 3 Produk"
                    description="Produk dengan volume penjualan tertinggi"
                    insight={stats?.pizzaSizes && stats.pizzaSizes.length > 0 ? `Top 3 produk berkontribusi besar terhadap total penjualan.` : undefined}
                    recommendation="Jaga ketersediaan stock untuk produk top 5. Pertimbangkan bundle promo."
                  >
                    {stats?.pizzaSizes?.length ? (
                      <EBarChart data={stats.pizzaSizes.slice(0, 5)} color={COLORS.secondary} height={300} />
                    ) : <EmptyChart message="Belum ada data produk" />}
                  </ChartCard>

                  <ChartCard
                    title="Revenue per Department"
                    description="Revenue per Department"
                    insight={stats?.ordersByRestaurant && stats.ordersByRestaurant.length > 0 ? `Retailer dengan revenue tertinggi: ${stats.ordersByRestaurant[0]?.label || '-'}` : undefined}
                    recommendation="Evaluasi retailer dengan transaksi rendah dan tiru strategi dari retailer terbaik."
                  >
                    {stats?.ordersByRestaurant?.length ? (
                      <EBarChart data={stats.ordersByRestaurant.slice(0, 10)} color={COLORS.accent} isCurrency={true} height={300} />
                    ) : <EmptyChart message="Belum ada data retailer" />}
                  </ChartCard>
                </div>

                {/* Charts Grid - Row 4: Full Width (Revenue per Kota) */}
                <div className="grid grid-cols-1 gap-6">
                  <ChartCard
                    title="Revenue per Kota"
                    description="Distribusi revenue berdasarkan kota (Top 10)"
                    insight={stats?.byCity && stats.byCity.length > 0 ? `Kota dengan revenue tertinggi: ${stats.byCity[0]?.label || '-'}` : undefined}
                    recommendation="Fokuskan ekspansi dan marketing di kota-kota dengan potensi tinggi."
                  >
                    {stats?.byCity?.length ? (
                      <EBarChart data={stats.byCity.slice(0, 10)} color={COLORS.warning} isCurrency={true} height={300} />
                    ) : <EmptyChart message="Belum ada data kota" />}
                  </ChartCard>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}