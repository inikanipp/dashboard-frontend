// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { 
//   TrendingUp,
//   Loader2,
//   AlertCircle,
//   Info,
//   RefreshCw,
//   Settings,
//   HelpCircle,
//   Download,
//   FileSpreadsheet,
//   FileJson,
//   BarChart3,
//   TrendingDown,
//   Minus
// } from 'lucide-react'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import * as echarts from 'echarts'

// interface ChartDataPoint {
//   name: string
//   Aktual: number
//   Prediksi: number | null
//   isForecast?: boolean
// }

// function simpleFormatValue(val: number): string {
//   if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`
//   if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} JT`
//   if (val >= 1000) return `${(val / 1000).toFixed(0)} RB`
//   return val.toLocaleString('id-ID')
// }

// function ForecastChart({ chartData }: { chartData: ChartDataPoint[] }) {
//   const chartRef = useRef<HTMLDivElement>(null)
//   const chartInstance = useRef<echarts.ECharts | null>(null)

//   // Fungsi pembantu untuk memformat tanggal ISO menjadi format lokal yang rapi
//   const formatDate = (dateStr: string) => {
//     try {
//       const date = new Date(dateStr);
//       // Cek apakah tanggal valid
//       if (!isNaN(date.getTime())) {
//         return new Intl.DateTimeFormat('id-ID', { 
//           day: 'numeric', 
//           month: 'short', 
//           year: 'numeric' 
//         }).format(date);
//       }
//       return dateStr; // Fallback jika format aneh
//     } catch (e) {
//       return dateStr.split('T')[0];
//     }
//   }

//   useEffect(() => {
//     if (!chartRef.current) return
//     chartInstance.current = echarts.init(chartRef.current)
//     return () => chartInstance.current?.dispose()
//   }, [])

//   useEffect(() => {
//     if (!chartInstance.current || !chartData.length) return

//     const actualData = chartData.map(d => !d.isForecast ? d.Aktual : null)
//     const forecastData = chartData.map(d => d.isForecast ? d.Prediksi : null)
    
//     // Hubungkan garis antara titik aktual terakhir dan titik prediksi pertama
//     const lastActualIndex = actualData.findLastIndex(v => v !== null);
//     if(lastActualIndex !== -1 && lastActualIndex + 1 < forecastData.length){
//          forecastData[lastActualIndex] = actualData[lastActualIndex];
//     }

//     const option: echarts.EChartsOption = {
//       tooltip: {
//         trigger: 'axis',
//         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//         borderColor: '#e2e8f0',
//         borderWidth: 1,
//         padding: [8, 12],
//         textStyle: { color: '#334155' },
//         formatter: (params: any) => {
//           const val = params[0];
//           // Gunakan fungsi formatDate untuk judul tooltip
//           const cleanDate = formatDate(val.name);
//           return `
//             <div style="font-weight:700; margin-bottom:6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
//               ${cleanDate}
//             </div>
//             <div style="display:flex; align-items:center; gap:8px;">
//               <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${val.color};"></span>
//               <span style="color:#64748b">${val.seriesName}:</span>
//               <span style="font-weight:700">${val.value !== null && val.value !== undefined ? simpleFormatValue(val.value) : '-'}</span>
//             </div>
//           `;
//         }
//       },
//       legend: {
//         data: ['Data Aktual', 'Prediksi'],
//         bottom: 0,
//         textStyle: { color: '#64748b', fontSize: 11 },
//         itemGap: 20
//       },
//       dataZoom: [
//         {
//           type: 'inside',
//           start: chartData.length > 30 ? 70 : 0,
//           end: 100
//         },
//         {
//           start: 0,
//           end: 100,
//           bottom: 25,
//           height: 12, // Dibuat sedikit lebih tipis
//           handleSize: '80%',
//           borderColor: 'transparent',
//           backgroundColor: '#f1f5f9',
//           fillerColor: 'rgba(59, 130, 246, 0.2)'
//         }
//       ],
//       // Bottom diperbesar (95) agar label tanggal yang miring tidak terpotong slider
//       grid: { left: 55, right: 20, top: 20, bottom: 95 }, 
//       xAxis: {
//         type: 'category',
//         data: chartData.map(d => d.name),
//         boundaryGap: false,
//         axisLabel: { 
//             color: '#64748b', 
//             fontSize: 10, 
//             rotate: 45, 
//             hideOverlap: true,
//             formatter: (value: string) => formatDate(value) // Format tanggal di sumbu X
//         },
//         axisLine: { lineStyle: { color: '#cbd5e1' } }
//       },
//       yAxis: {
//         type: 'value',
//         axisLabel: { color: '#64748b', fontSize: 10, formatter: (v: number) => simpleFormatValue(v) },
//         splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
//       },
//       series: [
//         {
//           name: 'Data Aktual',
//           type: 'line',
//           data: actualData,
//           smooth: true,
//           symbol: 'circle',
//           symbolSize: 6,
//           itemStyle: { color: '#3b82f6' },
//           lineStyle: { width: 2 },
//           areaStyle: {
//             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//               { offset: 0, color: '#3b82f640' },
//               { offset: 1, color: '#3b82f605' }
//             ])
//           }
//         },
//         {
//           name: 'Prediksi',
//           type: 'line',
//           data: forecastData,
//           smooth: true,
//           symbol: 'circle',
//           symbolSize: 6,
//           itemStyle: { color: '#10b981' },
//           lineStyle: { width: 2, type: 'dashed' as any },
//           areaStyle: {
//             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//               { offset: 0, color: '#10b98140' },
//               { offset: 1, color: '#10b98105' }
//             ])
//           }
//         }
//       ],
//       animationDuration: 1000
//     }

//     chartInstance.current.setOption(option, true)
//     const handleResize = () => chartInstance.current?.resize()
//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [chartData])

//   return <div ref={chartRef} className="w-full h-[300px] md:h-[400px]" />
// }

// interface ForecastResult {
//   success?: boolean
//   historical?: { date: string; actual: number; forecast: number }[]
//   forecast?: number[]
//   method?: string
//   error?: string
//   insights?: string
//   recommendations?: string
// }

// interface DataSummary {
//   success?: boolean
//   total_orders?: number
// }

// interface ChartDataPoint {
//   name: string
//   Aktual: number
//   Prediksi: number | null
//   isForecast?: boolean
// }

// export default function ForecastingPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
  
//   const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
//   const allowedRoles = ['GM', 'ADMIN_PUSAT']
  
//   const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
//   const [dateColumn, setDateColumn] = useState('invoice_date')
//   const [valueColumn, setValueColumn] = useState('total_sales')
//   const [method, setMethod] = useState('exponential-smoothing')
//   const [periods, setPeriods] = useState(7)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isCalculating, setIsCalculating] = useState(false)
//   const [result, setResult] = useState<ForecastResult | null>(null)
//   const [error, setError] = useState('')
//   const [showHelp, setShowHelp] = useState(false)

//   useEffect(() => {
//     if (status === 'unauthenticated') router.push('/login')
//     else if (status === 'authenticated' && !allowedRoles.includes(userRole)) router.push('/')
//   }, [status, userRole, router])

//   useEffect(() => {
//     fetchSummary()
//   }, [])

//   const fetchSummary = async () => {
//     setIsLoading(true)
//     try {
//       const res = await fetch('/api/v1/analytics-data/summary')
//       if (!res.ok) {
//         throw new Error(`API Error: ${res.status}`)
//       }
//       const data = await res.json()
//       setDataSummary(data)
//     } catch (err: any) {
//       console.error('Fetch summary error:', err)
//       setError('Gagal memuat data: ' + (err.message || 'Unknown error'))
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const runForecast = async () => {
//     setIsCalculating(true)
//     setError('')
    
//     try {
//       const res = await fetch('/api/v1/analytics-data/summary')
//       if (!res.ok) {
//         throw new Error(`Gagal mengambil data summary: ${res.status}`)
//       }
//       const summaryData = await res.json()
//       setDataSummary(summaryData)
      
//       if (!summaryData.success || summaryData.total_orders === 0) {
//         setError('Tidak ada data di database. Silakan upload data terlebih dahulu di halaman Upload Data.')
//         setIsCalculating(false)
//         return
//       }

//       const dataRes = await fetch('/api/v1/analytics-data/all-data')
//       if (!dataRes.ok) {
//         throw new Error(`Gagal mengambil data transaksi: ${dataRes.status}`)
//       }
//       const dataJson = await dataRes.json()
      
//       if (!dataJson.data || dataJson.data.length === 0) {
//         setError('Tidak ada data transaksi di database. Silakan upload data terlebih dahulu.')
//         setIsCalculating(false)
//         return
//       }

//       const csvData = convertToCSV(dataJson.data)
      
//       const formData = new FormData()
//       formData.append('file', new Blob([csvData], { type: 'text/csv' }))
//       formData.append('date_column', dateColumn)
//       formData.append('value_column', valueColumn)
//       formData.append('periods', periods.toString())

//       const endpoint = method === 'exponential-smoothing' 
//         ? '/api/v1/forecasting/exponential-smoothing'
//         : method === 'moving-average'
//         ? '/api/v1/forecasting/moving-average'
//         : '/api/v1/forecasting/linear-trend'

//       const forecastRes = await fetch(endpoint, {
//         method: 'POST',
//         body: formData,
//       })
//       const forecastData = await forecastRes.json()
      
//       if (forecastData.historical && forecastData.forecast) {
//         const avgHistorical = forecastData.historical.reduce((a: number, b: {actual: number}) => a + b.actual, 0) / forecastData.historical.length
//         const avgForecast = forecastData.forecast.reduce((a: number, b: number) => a + b, 0) / forecastData.forecast.length
//         const change = ((avgForecast - avgHistorical) / avgHistorical) * 100
//         const lastActual = forecastData.historical[forecastData.historical.length - 1]?.actual || 0
//         const lastForecast = forecastData.forecast[forecastData.forecast.length - 1] || 0
//         const lastChange = ((lastForecast - lastActual) / lastActual) * 100
        
//         let trendStatus = ''
//         if (change > 10) trendStatus = '🚀 NAIK SIGNIFIKAN'
//         else if (change > 5) trendStatus = '📈 NAIK'
//         else if (change < -10) trendStatus = '📉 TURUN SIGNIFIKAN'
//         else if (change < -5) trendStatus = '📉 TURUN'
//         else trendStatus = '➡️ STABIL'

//         let insights = [
//           `📊 Data historis: ${forecastData.historical.length} periode dengan rata-rata ${formatValue(avgHistorical)}`,
//           `🔮 Hasil prediksi: ${forecastData.forecast.length} periode ke depan dengan rata-rata ${formatValue(avgForecast)}`,
//           `📈 Perubahan rata-rata: ${change > 0 ? '+' : ''}${change.toFixed(1)}% (${trendStatus})`,
//           `📉 Data terakhir: Dari ${formatValue(lastActual)} → Prediksi ${formatValue(lastForecast)} (${lastChange > 0 ? '+' : ''}${lastChange.toFixed(1)}%)`
//         ]

//         let recommendations = ''
//         if (valueColumn === 'total_sales') {
//           if (change > 20) {
//             recommendations = '🚀 BOOST: Prediksi menunjukkan KENAIKAN PENJUALAN signifikan! Segera:\n1. Tambah stok produk\n2. Siapkan inventory tambahan\n3. Pertimbangkan ekspansi\n4. Marketing promo lanjutan!'
//           } else if (change > 10) {
//             recommendations = '📈 Tren Bagus: Penjualan diprediksi naik. Siapkan:\n1. Inventory yang cukup\n2. Staffing yang memadai\n3. Marketing promo'
//           } else if (change < -10) {
//             recommendations = '📉 WARNING: Penjualan diprediksi TURUN tajam! Segera:\n1. Evaluasi marketing\n2. Diskon/promo darurat\n3. Survey customer\n4. Cek kompetitor'
//           } else if (change < -5) {
//             recommendations = '⚠️ Penurunan: Penjualan menurun. Evaluasi:\n1. Strategi promo\n2. Kualitas produk\n3. Service speed'
//           } else {
//             recommendations = '✅ Stabil: Jumlah penjualan stabil. Jaga:\n1. Konsistensi kualitas\n2. Service excellent\n3. Building customer loyalty'
//           }
//         } else if (valueColumn === 'unit_sold') {
//           if (change > 20) {
//             recommendations = '🚀 BOOST: Prediksi KENAIKAN unit terjual signifikan! Segera:\n1. Tambah stok\n2. Recruiting staff\n3. Siapkan extra shift\n4. Packaging tambahan'
//           } else if (change > 10) {
//             recommendations = '📈 Tren Bagus: Unit terjual diprediksi naik. Siapkan:\n1. Inventory cukup\n2. Staffing memadai'
//           } else if (change < -10) {
//             recommendations = '📉 WARNING: Unit terjual diprediksi TURUN! Segera:\n1. Evaluasi produk\n2. Promo bundle\n3. Survey customer'
//           } else {
//             recommendations = '✅ Stabil: Unit terjual stabil. Jaga:\n1. Konsistensi\n2. Kualitas produk'
//           }
//         } else if (valueColumn === 'operating_profit') {
//           if (change > 10) {
//             recommendations = '📈 Profit diprediksi NAIK! Manfaatkan untuk:\n1. Investasi bisnis\n2. Ekspansi\n3. Bonus tim'
//           } else if (change < -10) {
//             recommendations = '📉 Profit diprediksi TURUN! Evaluasi:\n1. Biaya operasional\n2. Pricing strategy\n3. Efisiensi'
//           } else {
//             recommendations = '✅ Stabil: Profit stabil. Monitor:\n1. Biaya operasional\n2. Margin keuntungan'
//           }
//         } else {
//           recommendations = '💡 Rekomendasi: Gunakan data ini untuk perencanaan staffing dan inventory di periode mendatang.'
//         }
        
//         forecastData.insights = insights
//         forecastData.recommendations = recommendations
//       }
      
//       setResult(forecastData)
//     } catch (err) {
//       setError('Gagal menghitung forecast')
//     } finally {
//       setIsCalculating(false)
//     }
//   }

//   const formatValue = (val: number) => {
//     if (valueColumn.includes('duration') || valueColumn.includes('time')) return `${val.toFixed(1)} menit`
//     if (valueColumn.includes('distance')) return `${val.toFixed(1)} km`
//     if (valueColumn.includes('delay')) return `${val.toFixed(1)} menit`
//     if (valueColumn === 'order_count') return `${Math.round(val)} pesanan`
//     if (valueColumn === 'total_sales' || valueColumn === 'operating_profit') return `Rp ${(val/1000000).toFixed(1)}Jt`
//     return val.toFixed(1)
//   }

//   const convertToCSV = (data: any[]): string => {
//     if (data.length === 0) return ''
//     const headers = Object.keys(data[0])
//     const csvRows = [headers.join(',')]
//     for (const row of data) {
//       const values = headers.map(h => {
//         const val = row[h]
//         if (val === null || val === undefined) return ''
//         if (typeof val === 'string' && val.includes(',')) return `"${val}"`
//         return val
//       })
//       csvRows.push(values.join(','))
//     }
//     return csvRows.join('\n')
//   }

//   const downloadResult = (format: 'csv' | 'json') => {
//     if (!result?.historical || !result?.forecast) return

//     if (format === 'csv') {
//       const csvContent = [
//         'date,actual,forecast',
//         ...result.historical.map((h, i) => `${h.date},${h.actual},${h.forecast}`),
//         ...result.forecast.map((f, i) => `Forecast ${i + 1},,${f}`)
//       ].join('\n')
      
//       const blob = new Blob([csvContent], { type: 'text/csv' })
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'forecast_result.csv'
//       a.click()
//     } else {
//       const jsonContent = JSON.stringify(result, null, 2)
//       const blob = new Blob([jsonContent], { type: 'application/json' })
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'forecast_result.json'
//       a.click()
//     }
//   }

//   const getMethodDescription = (m: string) => {
//     switch(m) {
//       case 'exponential-smoothing':
//         return 'Exponential Smoothing: Metode yang memberikan bobot lebih pada data terbaru. Cocok untuk data dengan tren atau pola musiman.'
//       case 'moving-average':
//         return 'Moving Average: Metode rata-rata bergerak yang menghitung rata-rata dari beberapa periode terakhir. Cocok untuk data yang stabil.'
//       case 'linear-trend':
//         return 'Holt Winter: Metode peramalan yang menggabungkan level, tren, dan seasonality. Cocok untuk data dengan pola musiman.'
//       default:
//         return ''
//     }
//   }

//   const getValueColumnDescription = (v: string) => {
//     switch(v) {
//       case 'total_sales': return 'Total Penjualan (Revenue)'
//       case 'unit_sold': return 'Unit Terjual'
//       case 'operating_profit': return 'Operating Profit'
//       case 'order_count': return 'Jumlah Transaksi'
//       default: return v.replace(/_/g, ' ')
//     }
//   }

//   const getChartData = (): ChartDataPoint[] => {
//     if (!result?.historical || !result?.forecast) return []
    
//     const data: ChartDataPoint[] = result.historical.map((h, i) => ({
//       name: h.date,
//       Aktual: h.actual,
//       Prediksi: h.forecast
//     }))
    
//     result.forecast.forEach((f, i) => {
//       data.push({
//         name: `Prediksi ${i + 1}`,
//         Aktual: 0,
//         Prediksi: f,
//         isForecast: true
//       })
//     })
    
//     return data
//   }

//   const getTrend = () => {
//     if (!result?.historical || !result?.forecast) return null
//     const lastActual = result.historical[result.historical.length - 1]?.actual || 0
//     const lastForecast = result.forecast[result.forecast.length - 1] || 0
//     const percentChange = ((lastForecast - lastActual) / lastActual) * 100
    
//     if (Math.abs(percentChange) < 5) return { status: 'stabil', color: '#64748b', icon: Minus, text: 'Stabil' }
//     if (percentChange > 0) return { status: 'naik', color: '#10b981', icon: TrendingUp, text: 'Naik' }
//     return { status: 'turun', color: '#ef4444', icon: TrendingDown, text: 'Turun' }
//   }

//   if (status === 'loading' || isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
//           <p className="text-white/80 text-lg">Memuat data...</p>
//         </div>
//       </div>
//     )
//   }

//   const chartData = getChartData()
//   const trend = getTrend()

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="text-white p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgb(72, 148, 199) 0%, rgb(70, 147, 198) 100%)' }}>
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
//             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//               <TrendingUp className="w-7 h-7" />
//             </div>
//             Forecasting (Prediksi)
//           </h1>
//           <p className="mt-3 text-lg md:text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>
//             Prediksi data masa depan berdasarkan data historis - mudah dipahami!
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
//         {dataSummary && dataSummary.total_orders && dataSummary.total_orders > 0 ? (
//           <>
//             <Card className="mb-6">
//               <CardHeader className="pb-3">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle className="text-xl flex items-center gap-2">
//                       <Settings className="w-5 h-5" />
//                       Pengaturan Prediksi
//                     </CardTitle>
//                     <CardDescription className="text-base">Pilih parameter untuk menghitung prediksi</CardDescription>
//                   </div>
//                   <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)}>
//                     <HelpCircle className="w-4 h-4 mr-2" />
//                     {showHelp ? 'Sembunyikan' : 'Bantuan'}
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 {showHelp && (
//                   <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
//                     <h4 className="font-semibold text-blue-800 mb-2">📖 Apa itu Forecasting?</h4>
//                     <p className="text-sm text-blue-700 mb-3">
//                       Forecasting adalah teknik untuk memprediksi nilai di masa depan berdasarkan data di masa lalu.
//                     </p>
//                   </div>
//                 )}
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//                   <div>
//                     <label className="text-sm font-medium text-slate-700 mb-2 block">Apa yang ingin diprediksi?</label>
//                     <Select value={valueColumn} onValueChange={setValueColumn}>
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="total_sales">💰 Total Penjualan (Revenue)</SelectItem>
//                         <SelectItem value="unit_sold">📦 Unit Terjual</SelectItem>
//                         <SelectItem value="operating_profit">📈 Operating Profit</SelectItem>
//                         <SelectItem value="order_count">📊 Jumlah Transaksi</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   <div>
//                     <label className="text-sm font-medium text-slate-700 mb-2 block">Metode Prediksi</label>
//                     <Select value={method} onValueChange={setMethod}>
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="exponential-smoothing">📈 Exponential Smoothing</SelectItem>
//                         <SelectItem value="moving-average">📊 Moving Average</SelectItem>
//                         <SelectItem value="linear-trend">📉 Holt Winter</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   <div>
//                     <label className="text-sm font-medium text-slate-700 mb-2 block">Berapa lama ke depan?</label>
//                     <Select value={periods.toString()} onValueChange={(v) => setPeriods(parseInt(v))}>
//                       <SelectTrigger><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="3">3 periode</SelectItem>
//                         <SelectItem value="7">7 periode</SelectItem>
//                         <SelectItem value="14">14 periode</SelectItem>
//                         <SelectItem value="30">30 periode</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   <div className="flex items-end">
//                     <Button onClick={runForecast} disabled={isCalculating} className="w-full bg-blue-600 hover:bg-blue-700">
//                       {isCalculating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghitung...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Hitung Prediksi</>}
//                     </Button>
//                   </div>
//                 </div>
                
//                 <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
//                   <p className="text-sm text-amber-800">
//                     <Info className="w-4 h-4 inline mr-1" />
//                     {getMethodDescription(method)}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {error && (
//               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
//                 <p className="text-red-600 flex items-center gap-2">
//                   <AlertCircle className="w-5 h-5" />
//                   {error}
//                 </p>
//               </div>
//             )}

//             {result?.historical && result?.forecast && (
//               <div className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-xl flex items-center gap-2">
//                       <BarChart3 className="w-6 h-6" />
//                       Grafik Perbandingan - {getValueColumnDescription(valueColumn)}
//                     </CardTitle>
//                     <CardDescription className="text-base">
//                       Bandingkan data aktual dengan hasil prediksi - lihat trennya langsung!
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <ForecastChart chartData={chartData} />
                    
//                     {trend && (
//                       <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg">
//                         <trend.icon className="w-5 h-5" style={{ color: trend.color }} />
//                         <span className="font-medium" style={{ color: trend.color }}>Tren: {trend.text}</span>
//                       </div>
//                     )}

//                     <div className="flex gap-2 mt-6">
//                       <Button variant="outline" onClick={() => downloadResult('csv')}><FileSpreadsheet className="w-4 h-4 mr-2" />Download CSV</Button>
//                       <Button variant="outline" onClick={() => downloadResult('json')}><FileJson className="w-4 h-4 mr-2" />Download JSON</Button>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Ringkasan Data - User Friendly */}
//                 <Card className="border-l-4 border-l-purple-500">
//                   <CardHeader>
//                     <CardTitle className="text-lg flex items-center gap-2">
//                       📊 Ringkasan Data
//                     </CardTitle>
//                     <CardDescription className="text-base">
//                       Apa yang bisa Anda ambil dari data ini?
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="bg-slate-50 p-3 rounded-lg mb-4">
//                       <p className="text-sm text-slate-600">
//                         <strong>💡 Penjelasan:</strong> Ringkasan ini menunjukkan pola data historis Anda dan prediksi ke depan. 
//                         Gunakan untuk merencanakan inventory, staffing, dan target penjualan.
//                       </p>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-3 mb-4">
//                       <div className="p-3 bg-blue-50 rounded-lg">
//                         <p className="text-xs text-blue-600 font-medium">📅 Data Historis</p>
//                         <p className="text-lg font-bold text-blue-800">{result.historical?.length || 0} periode</p>
//                         <p className="text-xs text-blue-400">Semakin banyak data, semakin akurat prediksi</p>
//                       </div>
//                       <div className="p-3 bg-green-50 rounded-lg">
//                         <p className="text-xs text-green-600 font-medium">🔮 Prediksi</p>
//                         <p className="text-lg font-bold text-green-800">{result.forecast?.length || 0} periode</p>
//                         <p className="text-xs text-green-400">Estimasi nilai ke depan</p>
//                       </div>
//                       <div className="p-3 bg-amber-50 rounded-lg">
//                         <p className="text-xs text-amber-600 font-medium">📈 Rata-rata Aktual</p>
//                         <p className="text-lg font-bold text-amber-800">{formatValue(result.historical?.reduce((a, b) => a + b.actual, 0) / (result.historical?.length || 1) || 0)}</p>
//                         <p className="text-xs text-amber-400">Nilai rata-rata historis</p>
//                       </div>
//                       <div className="p-3 bg-purple-50 rounded-lg">
//                         <p className="text-xs text-purple-600 font-medium">🎯 Rata-rata Prediksi</p>
//                         <p className="text-lg font-bold text-purple-800">{formatValue(result.forecast?.reduce((a, b) => a + b, 0) / (result.forecast?.length || 1) || 0)}</p>
//                         <p className="text-xs text-purple-400">Estimasi rata-rata</p>
//                       </div>
//                     </div>

//                     {trend && (
//                       <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <trend.icon className="w-5 h-5" style={{ color: trend.color }} />
//                           <span className="font-medium" style={{ color: trend.color }}>Tren: {trend.text}</span>
//                         </div>
//                         <span className="text-xs text-slate-500">
//                           {result.historical && result.forecast ? `${((result.forecast[result.forecast.length - 1] - result.historical[result.historical.length - 1].actual) / result.historical[result.historical.length - 1].actual * 100).toFixed(1)}%` : '-'} dari terakhir
//                         </span>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {/* Kesimpulan & Rekomendasi - Dropdown/Collapsible */}
//                 <Card className="border-l-4 border-l-green-500">
//                   <CardHeader>
//                     <CardTitle className="text-lg flex items-center gap-2">
//                       💡 Kesimpulan & Rekomendasi
//                     </CardTitle>
//                     <CardDescription className="text-base">
//                       Klik untuk lihat analisis lengkap dan langkah aksi
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       {/* Kesimpulan Utama */}
//                       <details className="group">
//                         <summary className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
//                           <span className="font-medium text-blue-800 flex items-center gap-2">📊 Kesimpulan Utama</span>
//                           <span className="text-blue-500 group-open:rotate-180 transition-transform">▼</span>
//                         </summary>
//                         <div className="mt-2 p-3 bg-white border rounded-lg">
//                           {result.insights && (
//                             <ul className="space-y-2 text-sm text-slate-700">
//                               {Array.isArray(result.insights) ? result.insights.map((line: string, i: number) => (
//                                 <li key={i} className="flex items-start gap-2"><span className="text-blue-500">•</span><span>{line}</span></li>
//                               )) : result.insights.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
//                                 <li key={i} className="flex items-start gap-2"><span className="text-blue-500">•</span><span>{line}</span></li>
//                               ))}
//                             </ul>
//                           )}
//                         </div>
//                       </details>

//                       {/* Rekomendasi Strategis */}
//                       <details className="group">
//                         <summary className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
//                           <span className="font-medium text-green-800 flex items-center gap-2">🎯 Rekomendasi Strategis</span>
//                           <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
//                         </summary>
//                         <div className="mt-2 p-3 bg-white border rounded-lg">
//                           {result.recommendations && (
//                             <ul className="space-y-2 text-sm text-slate-700">
//                               {typeof result.recommendations === 'string' ? result.recommendations.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
//                                 <li key={i} className="flex items-start gap-2"><span className="text-green-600">•</span><span>{line}</span></li>
//                               )) : <p className="text-slate-700">{result.recommendations}</p>}
//                             </ul>
//                           )}
//                         </div>
//                       </details>

//                       {/* Langkah Aksi Sekarang */}
//                       <details className="group">
//                         <summary className="flex items-center justify-between p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
//                           <span className="font-medium text-amber-800 flex items-center gap-2">⚡ Langkah Aksi Sekarang</span>
//                           <span className="text-amber-500 group-open:rotate-180 transition-transform">▼</span>
//                         </summary>
//                         <div className="mt-2 p-3 bg-white border rounded-lg">
//                           <div className="space-y-2 text-sm text-slate-700">
//                             {valueColumn === 'total_sales' && (
//                               <>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">1.</span> Review strategi pricing</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">2.</span> Siapkan campaign marketing</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">3.</span> Koordinasi tim sales</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">4.</span> Evaluasi inventory produk</li>
//                               </>
//                             )}
//                             {valueColumn === 'unit_sold' && (
//                               <>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">1.</span> Analisis produk laris</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">2.</span> Siapkan bundle promo</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">3.</span> Koordinasi warehouse</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">4.</span> Training upselling</li>
//                               </>
//                             )}
//                             {valueColumn === 'operating_profit' && (
//                               <>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">1.</span> Evaluasi biaya operasional</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">2.</span> Identifikasi area hemat biaya</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">3.</span> Review pricing strategy</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">4.</span> Siapkan contingency budget</li>
//                               </>
//                             )}
//                             {valueColumn === 'order_count' && (
//                               <>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">1.</span> Siapkan staffing</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">2.</span> Koordinasi tim operasional</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">3.</span> Persiapkan sistem backup</li>
//                                 <li className="flex items-start gap-2"><span className="text-amber-600">4.</span> Plan peak season</li>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       </details>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <AlertCircle className="w-12 h-12 text-amber-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Data</h2>
//             <p className="text-slate-500 mb-6">Silakan upload data terlebih dahulu di halaman Upload Data</p>
//             <Button onClick={() => router.push('/upload')}>Upload Data</Button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp,
  Loader2,
  AlertCircle,
  Info,
  RefreshCw,
  Settings,
  HelpCircle,
  Download,
  FileSpreadsheet,
  FileJson,
  BarChart3,
  TrendingDown,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as echarts from 'echarts'

interface ChartDataPoint {
  name: string
  Aktual: number
  Prediksi: number | null
  isForecast?: boolean
}

function simpleFormatValue(val: number): string {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} JT`
  if (val >= 1000) return `${(val / 1000).toFixed(0)} RB`
  return val.toLocaleString('id-ID')
}

function ForecastChart({ chartData }: { chartData: ChartDataPoint[] }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  // Fungsi pembantu untuk memformat tanggal ISO menjadi format lokal yang rapi
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Cek apakah tanggal valid
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('id-ID', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }).format(date);
      }
      return dateStr; // Fallback jika format aneh
    } catch (e) {
      return dateStr.split('T')[0];
    }
  }

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)
    return () => chartInstance.current?.dispose()
  }, [])

  useEffect(() => {
    if (!chartInstance.current || !chartData.length) return

    const actualData = chartData.map(d => !d.isForecast ? d.Aktual : null)
    const forecastData = chartData.map(d => d.isForecast ? d.Prediksi : null)
    
    // Hubungkan garis antara titik aktual terakhir dan titik prediksi pertama
    const lastActualIndex = actualData.findLastIndex(v => v !== null);
    if(lastActualIndex !== -1 && lastActualIndex + 1 < forecastData.length){
         forecastData[lastActualIndex] = actualData[lastActualIndex];
    }

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
          // Gunakan fungsi formatDate untuk judul tooltip
          const cleanDate = formatDate(val.name);
          return `
            <div style="font-weight:700; margin-bottom:6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              ${cleanDate}
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${val.color};"></span>
              <span style="color:#64748b">${val.seriesName}:</span>
              <span style="font-weight:700">${val.value !== null && val.value !== undefined ? simpleFormatValue(val.value) : '-'}</span>
            </div>
          `;
        }
      },
      legend: {
        data: ['Data Aktual', 'Prediksi'],
        bottom: 0,
        textStyle: { color: '#64748b', fontSize: 11 },
        itemGap: 20
      },
      dataZoom: [
        {
          type: 'inside',
          start: chartData.length > 30 ? 70 : 0,
          end: 100
        },
        {
          start: 0,
          end: 100,
          bottom: 25,
          height: 12, // Dibuat sedikit lebih tipis
          handleSize: '80%',
          borderColor: 'transparent',
          backgroundColor: '#f1f5f9',
          fillerColor: 'rgba(59, 130, 246, 0.2)'
        }
      ],
      // Bottom diperbesar (95) agar label tanggal yang miring tidak terpotong slider
      grid: { left: 55, right: 20, top: 20, bottom: 95 }, 
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        boundaryGap: false,
        axisLabel: { 
            color: '#64748b', 
            fontSize: 10, 
            rotate: 45, 
            hideOverlap: true,
            formatter: (value: string) => formatDate(value) // Format tanggal di sumbu X
        },
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (v: number) => simpleFormatValue(v) },
        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
      },
      series: [
        {
          name: 'Data Aktual',
          type: 'line',
          data: actualData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f640' },
              { offset: 1, color: '#3b82f605' }
            ])
          }
        },
        {
          name: 'Prediksi',
          type: 'line',
          data: forecastData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 2, type: 'dashed' as any },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b98140' },
              { offset: 1, color: '#10b98105' }
            ])
          }
        }
      ],
      animationDuration: 1000
    }

    chartInstance.current.setOption(option, true)
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chartData])

  return <div ref={chartRef} className="w-full h-[300px] md:h-[400px]" />
}

interface ForecastResult {
  success?: boolean
  historical?: { date: string; actual: number; forecast: number }[]
  forecast?: number[]
  method?: string
  error?: string
  insights?: string
  recommendations?: string
}

interface DataSummary {
  success?: boolean
  total_orders?: number
}

interface ChartDataPoint {
  name: string
  Aktual: number
  Prediksi: number | null
  isForecast?: boolean
}

export default function ForecastingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const allowedRoles = ['GM', 'ADMIN_PUSAT']
  
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [dateColumn, setDateColumn] = useState('invoice_date')
  const [valueColumn, setValueColumn] = useState('total_sales')
  const [method, setMethod] = useState('exponential-smoothing')
  const [periods, setPeriods] = useState(7)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<ForecastResult | null>(null)
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && !allowedRoles.includes(userRole)) router.push('/')
  }, [status, userRole, router])

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/analytics-data/summary')
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`)
      }
      const data = await res.json()
      setDataSummary(data)
    } catch (err: any) {
      console.error('Fetch summary error:', err)
      setError('Gagal memuat data: ' + (err.message || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const runForecast = async () => {
    setIsCalculating(true)
    setError('')
    
    try {
      const res = await fetch('/api/v1/analytics-data/summary')
      if (!res.ok) {
        throw new Error(`Gagal mengambil data summary: ${res.status}`)
      }
      const summaryData = await res.json()
      setDataSummary(summaryData)
      
      if (!summaryData.success || summaryData.total_orders === 0) {
        setError('Tidak ada data di database. Silakan upload data terlebih dahulu di halaman Upload Data.')
        setIsCalculating(false)
        return
      }

      const dataRes = await fetch('/api/v1/analytics-data/all-data')
      if (!dataRes.ok) {
        throw new Error(`Gagal mengambil data transaksi: ${dataRes.status}`)
      }
      const dataJson = await dataRes.json()
      
      if (!dataJson.data || dataJson.data.length === 0) {
        setError('Tidak ada data transaksi di database. Silakan upload data terlebih dahulu.')
        setIsCalculating(false)
        return
      }

      const csvData = convertToCSV(dataJson.data)
      
      const formData = new FormData()
      formData.append('file', new Blob([csvData], { type: 'text/csv' }))
      formData.append('date_column', dateColumn)
      formData.append('value_column', valueColumn)
      formData.append('periods', periods.toString())

      const endpoint = method === 'exponential-smoothing' 
        ? '/api/v1/forecasting/exponential-smoothing'
        : method === 'moving-average'
        ? '/api/v1/forecasting/moving-average'
        : '/api/v1/forecasting/linear-trend'

      const forecastRes = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      const forecastData = await forecastRes.json()
      
      if (forecastData.historical && forecastData.forecast) {
        const avgHistorical = forecastData.historical.reduce((a: number, b: {actual: number}) => a + b.actual, 0) / forecastData.historical.length
        const avgForecast = forecastData.forecast.reduce((a: number, b: number) => a + b, 0) / forecastData.forecast.length
        const change = ((avgForecast - avgHistorical) / avgHistorical) * 100
        const lastActual = forecastData.historical[forecastData.historical.length - 1]?.actual || 0
        const lastForecast = forecastData.forecast[forecastData.forecast.length - 1] || 0
        const lastChange = ((lastForecast - lastActual) / lastActual) * 100
        
        let trendStatus = ''
        if (change > 10) trendStatus = '🚀 NAIK SIGNIFIKAN'
        else if (change > 5) trendStatus = '📈 NAIK'
        else if (change < -10) trendStatus = '📉 TURUN SIGNIFIKAN'
        else if (change < -5) trendStatus = '📉 TURUN'
        else trendStatus = '➡️ STABIL'

        let insights = [
          `📊 Data historis: ${forecastData.historical.length} periode dengan rata-rata ${formatValue(avgHistorical)}`,
          `🔮 Hasil prediksi: ${forecastData.forecast.length} periode ke depan dengan rata-rata ${formatValue(avgForecast)}`,
          `📈 Perubahan rata-rata: ${change > 0 ? '+' : ''}${change.toFixed(1)}% (${trendStatus})`,
          `📉 Data terakhir: Dari ${formatValue(lastActual)} → Prediksi ${formatValue(lastForecast)} (${lastChange > 0 ? '+' : ''}${lastChange.toFixed(1)}%)`
        ]

        let recommendations = ''
        if (valueColumn === 'total_sales') {
          if (change > 20) {
            recommendations = '🚀 BOOST: Prediksi menunjukkan KENAIKAN PENJUALAN signifikan! Segera:\n1. Tambah stok produk\n2. Siapkan inventory tambahan\n3. Pertimbangkan ekspansi\n4. Marketing promo lanjutan!'
          } else if (change > 10) {
            recommendations = '📈 Tren Bagus: Penjualan diprediksi naik. Siapkan:\n1. Inventory yang cukup\n2. Staffing yang memadai\n3. Marketing promo'
          } else if (change < -10) {
            recommendations = '📉 WARNING: Penjualan diprediksi TURUN tajam! Segera:\n1. Evaluasi marketing\n2. Diskon/promo darurat\n3. Survey customer\n4. Cek kompetitor'
          } else if (change < -5) {
            recommendations = '⚠️ Penurunan: Penjualan menurun. Evaluasi:\n1. Strategi promo\n2. Kualitas produk\n3. Service speed'
          } else {
            recommendations = '✅ Stabil: Jumlah penjualan stabil. Jaga:\n1. Konsistensi kualitas\n2. Service excellent\n3. Building customer loyalty'
          }
        } else if (valueColumn === 'unit_sold') {
          if (change > 20) {
            recommendations = '🚀 BOOST: Prediksi KENAIKAN unit terjual signifikan! Segera:\n1. Tambah stok\n2. Recruiting staff\n3. Siapkan extra shift\n4. Packaging tambahan'
          } else if (change > 10) {
            recommendations = '📈 Tren Bagus: Unit terjual diprediksi naik. Siapkan:\n1. Inventory cukup\n2. Staffing memadai'
          } else if (change < -10) {
            recommendations = '📉 WARNING: Unit terjual diprediksi TURUN! Segera:\n1. Evaluasi produk\n2. Promo bundle\n3. Survey customer'
          } else {
            recommendations = '✅ Stabil: Unit terjual stabil. Jaga:\n1. Konsistensi\n2. Kualitas produk'
          }
        } else if (valueColumn === 'operating_profit') {
          if (change > 10) {
            recommendations = '📈 Profit diprediksi NAIK! Manfaatkan untuk:\n1. Investasi bisnis\n2. Ekspansi\n3. Bonus tim'
          } else if (change < -10) {
            recommendations = '📉 Profit diprediksi TURUN! Evaluasi:\n1. Biaya operasional\n2. Pricing strategy\n3. Efisiensi'
          } else {
            recommendations = '✅ Stabil: Profit stabil. Monitor:\n1. Biaya operasional\n2. Margin keuntungan'
          }
        } else {
          recommendations = '💡 Rekomendasi: Gunakan data ini untuk perencanaan staffing dan inventory di periode mendatang.'
        }
        
        forecastData.insights = insights
        forecastData.recommendations = recommendations
      }
      
      setResult(forecastData)
    } catch (err) {
      setError('Gagal menghitung forecast')
    } finally {
      setIsCalculating(false)
    }
  }

  const formatValue = (val: number) => {
    if (valueColumn.includes('duration') || valueColumn.includes('time')) return `${val.toFixed(1)} menit`
    if (valueColumn.includes('distance')) return `${val.toFixed(1)} km`
    if (valueColumn.includes('delay')) return `${val.toFixed(1)} menit`
    if (valueColumn === 'order_count') return `${Math.round(val)} pesanan`
    if (valueColumn === 'total_sales' || valueColumn === 'operating_profit') return `Rp ${(val/1000000).toFixed(1)}Jt`
    return val.toFixed(1)
  }

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`
        return val
      })
      csvRows.push(values.join(','))
    }
    return csvRows.join('\n')
  }

  const downloadResult = (format: 'csv' | 'json') => {
    if (!result?.historical || !result?.forecast) return

    if (format === 'csv') {
      const csvContent = [
        'date,actual,forecast',
        ...result.historical.map((h, i) => `${h.date},${h.actual},${h.forecast}`),
        ...result.forecast.map((f, i) => `Forecast ${i + 1},,${f}`)
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'forecast_result.csv'
      a.click()
    } else {
      const jsonContent = JSON.stringify(result, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'forecast_result.json'
      a.click()
    }
  }

  const getMethodDescription = (m: string) => {
    switch(m) {
      case 'exponential-smoothing':
        return 'Exponential Smoothing: Metode yang memberikan bobot lebih pada data terbaru. Cocok untuk data dengan tren atau pola musiman.'
      case 'moving-average':
        return 'Moving Average: Metode rata-rata bergerak yang menghitung rata-rata dari beberapa periode terakhir. Cocok untuk data yang stabil.'
      case 'linear-trend':
        return 'Holt Winter: Metode peramalan yang menggabungkan level, tren, dan seasonality. Cocok untuk data dengan pola musiman.'
      default:
        return ''
    }
  }

  const getValueColumnDescription = (v: string) => {
    switch(v) {
      case 'total_sales': return 'Total Penjualan (Revenue)'
      case 'unit_sold': return 'Unit Terjual'
      case 'operating_profit': return 'Operating Profit'
      case 'order_count': return 'Jumlah Transaksi'
      default: return v.replace(/_/g, ' ')
    }
  }

  const getChartData = (): ChartDataPoint[] => {
    if (!result?.historical || !result?.forecast) return []
    
    // Format tanggal untuk tampilan yang lebih rapi
    const formatDateStr = (dateStr: string) => {
        try {
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
            }
        } catch(e) {}
        // Fallback jika bukan format tanggal yang valid
        return dateStr.split('T')[0];
    }

    const data: ChartDataPoint[] = result.historical.map((h, i) => ({
      name: formatDateStr(h.date),
      Aktual: h.actual,
      Prediksi: h.forecast
    }))
    
    result.forecast.forEach((f, i) => {
      data.push({
        name: `Prediksi ${i + 1}`,
        Aktual: 0,
        Prediksi: f,
        isForecast: true
      })
    })
    
    return data
  }

  const getTrend = () => {
    if (!result?.historical || !result?.forecast) return null
    const lastActual = result.historical[result.historical.length - 1]?.actual || 0
    const lastForecast = result.forecast[result.forecast.length - 1] || 0
    const percentChange = ((lastForecast - lastActual) / lastActual) * 100
    
    if (Math.abs(percentChange) < 5) return { status: 'stabil', color: '#64748b', icon: Minus, text: 'Stabil' }
    if (percentChange > 0) return { status: 'naik', color: '#10b981', icon: TrendingUp, text: 'Naik' }
    return { status: 'turun', color: '#ef4444', icon: TrendingDown, text: 'Turun' }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80 text-lg">Memuat data...</p>
        </div>
      </div>
    )
  }

  const chartData = getChartData()
  const trend = getTrend()

  return (
    <div className="min-h-screen bg-slate-50 w-full overflow-hidden">
      {/* HEADER DIUBAH WARNANYA DISINI */}
      <div className="text-white p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #054CC7 0%, #17C3CC 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            Forecasting (Prediksi)
          </h1>
          <p className="mt-3 text-sm md:text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Prediksi data masa depan berdasarkan data historis - mudah dipahami!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 w-full">
        {dataSummary && dataSummary.total_orders && dataSummary.total_orders > 0 ? (
          <>
            <Card className="mb-6 w-full">
              <CardHeader className="pb-3 px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <Settings className="w-5 h-5 shrink-0" />
                      Pengaturan Prediksi
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">Pilih parameter untuk menghitung prediksi</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)} className="w-full md:w-auto">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {showHelp ? 'Sembunyikan' : 'Bantuan'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                {showHelp && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📖 Apa itu Forecasting?</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Forecasting adalah teknik untuk memprediksi nilai di masa depan berdasarkan data di masa lalu.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Apa yang ingin diprediksi?</label>
                    <Select value={valueColumn} onValueChange={setValueColumn}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total_sales">💰 Total Penjualan</SelectItem>
                        <SelectItem value="unit_sold">📦 Unit Terjual</SelectItem>
                        <SelectItem value="operating_profit">📈 Operating Profit</SelectItem>
                        <SelectItem value="order_count">📊 Jumlah Transaksi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Metode Prediksi</label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exponential-smoothing">📈 Exp Smoothing</SelectItem>
                        <SelectItem value="moving-average">📊 Moving Average</SelectItem>
                        <SelectItem value="linear-trend">📉 Holt Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Berapa lama ke depan?</label>
                    <Select value={periods.toString()} onValueChange={(v) => setPeriods(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 periode</SelectItem>
                        <SelectItem value="7">7 periode</SelectItem>
                        <SelectItem value="14">14 periode</SelectItem>
                        <SelectItem value="30">30 periode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end mt-2 lg:mt-0">
                    <Button onClick={runForecast} disabled={isCalculating} className="w-full bg-[#054CC7] hover:bg-blue-800 text-white transition-colors">
                      {isCalculating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Hitung...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Hitung Prediksi</>}
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    <span>{getMethodDescription(method)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 flex items-center gap-2 text-sm md:text-base">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </p>
              </div>
            )}

            {result?.historical && result?.forecast && (
              <div className="space-y-6 w-full">
                <Card className="w-full overflow-hidden border-t-4 border-t-[#054CC7]">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-[#054CC7]" />
                      <span className="truncate">Grafik Perbandingan</span>
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Bandingkan data aktual dengan hasil prediksi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 md:px-6">
                    <div className="w-full overflow-hidden">
                      <ForecastChart chartData={chartData} />
                    </div>
                    
                    {trend && (
                      <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg mx-2 md:mx-0">
                        <trend.icon className="w-5 h-5" style={{ color: trend.color }} />
                        <span className="font-medium text-sm md:text-base" style={{ color: trend.color }}>Tren: {trend.text}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 mt-6 px-2 md:px-0">
                      <Button variant="outline" className="w-full border-slate-300 text-slate-700" onClick={() => downloadResult('csv')}><FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />Download CSV</Button>
                      <Button variant="outline" className="w-full border-slate-300 text-slate-700" onClick={() => downloadResult('json')}><FileJson className="w-4 h-4 mr-2 text-amber-500" />Download JSON</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Ringkasan Data */}
                <Card className="border-l-4 border-l-[#17C3CC] w-full">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📊 Ringkasan Data
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Apa yang bisa Anda ambil dari data ini?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <div className="bg-slate-50 p-3 rounded-lg mb-4">
                      <p className="text-xs md:text-sm text-slate-600">
                        <strong>💡 Penjelasan:</strong> Ringkasan ini menunjukkan pola data historis Anda dan prediksi ke depan. 
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-[10px] md:text-xs text-[#054CC7] font-medium truncate">📅 Data Historis</p>
                        <p className="text-base md:text-lg font-bold text-slate-800 mt-1">{result.historical?.length || 0} periode</p>
                      </div>
                      <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-lg">
                        <p className="text-[10px] md:text-xs text-[#17C3CC] font-medium truncate">🔮 Prediksi</p>
                        <p className="text-base md:text-lg font-bold text-slate-800 mt-1">{result.forecast?.length || 0} periode</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-[10px] md:text-xs text-[#054CC7] font-medium truncate">📈 Rata-rata Aktual</p>
                        <p className="text-base md:text-lg font-bold text-slate-800 mt-1">{formatValue(result.historical?.reduce((a, b) => a + b.actual, 0) / (result.historical?.length || 1) || 0)}</p>
                      </div>
                      <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-lg">
                        <p className="text-[10px] md:text-xs text-[#17C3CC] font-medium truncate">🎯 Rata-rata Prediksi</p>
                        <p className="text-base md:text-lg font-bold text-slate-800 mt-1">{formatValue(result.forecast?.reduce((a, b) => a + b, 0) / (result.forecast?.length || 1) || 0)}</p>
                      </div>
                    </div>

                    {trend && (
                      <div className="p-3 bg-slate-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <trend.icon className="w-5 h-5" style={{ color: trend.color }} />
                          <span className="font-medium text-sm" style={{ color: trend.color }}>Tren: {trend.text}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {result.historical && result.forecast ? `${((result.forecast[result.forecast.length - 1] - result.historical[result.historical.length - 1].actual) / result.historical[result.historical.length - 1].actual * 100).toFixed(1)}%` : '-'} dari terakhir
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Kesimpulan & Rekomendasi */}
                <Card className="border-l-4 border-l-amber-500 w-full mb-8">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                      💡 Kesimpulan & Rekomendasi
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Klik untuk lihat analisis lengkap
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <div className="space-y-3">
                      <details className="group">
                        <summary className="flex items-center justify-between p-3 bg-[#054CC7]/5 rounded-lg cursor-pointer hover:bg-[#054CC7]/10 transition-colors border border-[#054CC7]/20">
                          <span className="font-medium text-sm md:text-base text-[#054CC7] flex items-center gap-2">📊 Kesimpulan Utama</span>
                          <span className="text-[#054CC7] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg overflow-x-auto">
                          {result.insights && (
                            <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                              {Array.isArray(result.insights) ? result.insights.map((line: string, i: number) => (
                                <li key={i} className="flex items-start gap-2"><span className="text-[#054CC7] shrink-0">•</span><span>{line}</span></li>
                              )) : result.insights.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                <li key={i} className="flex items-start gap-2"><span className="text-[#054CC7] shrink-0">•</span><span>{line}</span></li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </details>

                      <details className="group">
                        <summary className="flex items-center justify-between p-3 bg-[#17C3CC]/10 rounded-lg cursor-pointer hover:bg-[#17C3CC]/20 transition-colors border border-[#17C3CC]/30">
                          <span className="font-medium text-sm md:text-base text-teal-800 flex items-center gap-2">🎯 Rekomendasi Strategis</span>
                          <span className="text-teal-600 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg">
                          {result.recommendations && (
                            <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                              {typeof result.recommendations === 'string' ? result.recommendations.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                <li key={i} className="flex items-start gap-2"><span className="text-teal-600 shrink-0">•</span><span>{line}</span></li>
                              )) : <p className="text-slate-700">{result.recommendations}</p>}
                            </ul>
                          )}
                        </div>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-amber-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Belum Ada Data</h2>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-md mx-auto">Silakan upload data terlebih dahulu di halaman Upload Data</p>
            <Button onClick={() => router.push('/upload')} className="w-full md:w-auto bg-[#054CC7] hover:bg-blue-800 text-white">Upload Data</Button>
          </div>
        )}
      </div>
    </div>
  )
}