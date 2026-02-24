// 'use client'

// export const dynamic = 'force-dynamic'

// import React, { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Loader2, TrendingUp, Clock, AlertTriangle, CheckCircle2, Upload, Filter, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
// import Link from 'next/link'
// import { EBarChart, ELineChart, EPieChart } from '@/components/charts/echart-components'

// interface Restaurant {
//   id: string
//   name: string
//   code: string
// }

// interface AnalyticsData {
//   totalOrders: number
//   ordersByRestaurant: { restaurant: string; count: number; sales?: number }[]
//   ordersByProduct: { product: string; count: number; sales?: number }[]
//   ordersByMonth: { month: string; count: number; sales?: number }[]
//   ordersByLocation: { location: string; count: number; sales?: number }[]
//   ordersByMethod: { method: string; count: number; sales?: number }[]
//   salesStats: { total: number; profit: number; avgOrderValue: number }
// }

// interface FilterState {
//   month: string
//   product: string
//   city: string
//   method: string
// }

// interface FilterOptions {
//   products: { id_product: number; product: string }[]
//   methods: { id_method: number; method: string }[]
//   cities: { id_city: number; city: string }[]
//   months: string[]
// }

// function formatNumber(num: number): string {
//   if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' M'
//   else if (num >= 1000000) return (num / 1000000).toFixed(1) + ' JT'
//   else if (num >= 1000) return (num / 1000).toFixed(0) + ' RB'
//   return num.toLocaleString('id-ID')
// }

// function formatCurrency(num: number): string {
//   if (num >= 1000000000) return 'Rp ' + (num / 1000000000).toFixed(1) + ' M'
//   else if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + ' JT'
//   else if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(0) + ' RB'
//   return 'Rp ' + num.toLocaleString('id-ID')
// }

// function DataSlicer({ 
//   filters, 
//   setFilters, 
//   filterOptions,
//   activeFiltersCount,
//   onClearFilters
// }: {
//   filters: FilterState
//   setFilters: React.Dispatch<React.SetStateAction<FilterState>>
//   filterOptions: FilterOptions
//   activeFiltersCount: number
//   onClearFilters: () => void
// }) {
//   const [isExpanded, setIsExpanded] = useState(true)

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
//       <div 
//         className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
//         onClick={() => setIsExpanded(!isExpanded)}
//       >
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
//             <Filter className="w-5 h-5 text-blue-600" />
//           </div>
//           <div>
//             <h3 className="font-semibold text-slate-800">Filter Data</h3>
//             <p className="text-xs text-slate-500">Filter data untuk analisis yang lebih spesifik</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           {activeFiltersCount > 0 && (
//             <Badge variant="secondary" className="bg-blue-100 text-blue-700">
//               {activeFiltersCount} filter aktif
//             </Badge>
//           )}
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={(e) => {
//               e.stopPropagation()
//               onClearFilters()
//             }}
//             disabled={activeFiltersCount === 0}
//           >
//             Reset
//           </Button>
//           {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
//         </div>
//       </div>

//       {isExpanded && (
//         <div className="p-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Bulan Transaksi</label>
//               <Select value={filters.month} onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}>
//                 <SelectTrigger className="w-full"><SelectValue placeholder="Semua Bulan" /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Semua Bulan</SelectItem>
//                   {filterOptions.months?.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Produk</label>
//               <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}>
//                 <SelectTrigger className="w-full"><SelectValue placeholder="Semua Produk" /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Semua Produk</SelectItem>
//                   {filterOptions.products?.map(p => <SelectItem key={p.id_product} value={p.product}>{p.product}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Kota</label>
//               <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
//                 <SelectTrigger className="w-full"><SelectValue placeholder="Semua Kota" /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Semua Kota</SelectItem>
//                   {filterOptions.cities?.map(c => <SelectItem key={c.id_city} value={c.city}>{c.city}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Metode Penjualan</label>
//               <Select value={filters.method} onValueChange={(value) => setFilters(prev => ({ ...prev, method: value }))}>
//                 <SelectTrigger className="w-full"><SelectValue placeholder="Semua Metode" /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Semua Metode</SelectItem>
//                   {filterOptions.methods?.map(m => <SelectItem key={m.id_method} value={m.method}>{m.method}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// function ChartCard({ title, description, children, insight, recommendation }: {
//   title: string
//   description: string
//   children: React.ReactNode
//   insight?: string
//   recommendation?: string
// }) {
//   const [showDropdown, setShowDropdown] = React.useState(false)
//   const hasContent = insight || recommendation

//   return (
//     <Card className="h-full flex flex-col overflow-hidden relative">
//       <CardHeader className="pb-2 border-b">
//         <div className="flex items-start justify-between">
//           <div>
//             <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
//             <CardDescription className="text-sm text-slate-500 mt-1">{description}</CardDescription>
//           </div>
//           {hasContent && (
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//               >
//                 <Lightbulb className="w-4 h-4" />
//                 <span className="text-xs font-medium">Insight</span>
//                 {showDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
//               </Button>
//               {showDropdown && (
//                 <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-4">
//                   {insight && (
//                     <div className="mb-3">
//                       <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Insight</p>
//                       <p className="text-sm text-slate-700">{insight}</p>
//                     </div>
//                   )}
//                   {recommendation && (
//                     <div>
//                       <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Rekomendasi</p>
//                       <p className="text-sm text-slate-700">{recommendation}</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </CardHeader>
//       <CardContent className="flex-1 min-h-[320px] p-4 flex flex-col justify-center">
//         {children}
//       </CardContent>
//     </Card>
//   )
// }

// function EmptyChart({ message = "Belum ada data" }: { message?: string }) {
//   return (
//     <div className="h-full w-full flex flex-col items-center justify-center py-10">
//       <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
//         <TrendingUp className="w-8 h-8 text-slate-300" />
//       </div>
//       <p className="text-slate-400 text-xs">{message}</p>
//     </div>
//   )
// }

// export default function AnalyticsPage() {
//   const { data: session, status } = useSession()
//   const [restaurants, setRestaurants] = useState<Restaurant[]>([])
//   const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all')
//   const [filteredData, setFilteredData] = useState<AnalyticsData | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
  
//   const [filterOptions, setFilterOptions] = useState<FilterOptions>({ products: [], methods: [], cities: [], months: [] })
//   const [filters, setFilters] = useState<FilterState>({
//     month: 'all',
//     product: 'all',
//     city: 'all',
//     method: 'all'
//   })

//   const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
//   const isSuperAdmin = userRole === 'GM' || userRole === 'ADMIN_PUSAT'
//   const isManager = userRole === 'MANAGER'
//   const canAccess = isSuperAdmin || isManager

//   useEffect(() => {
//     if (status === 'authenticated' && canAccess) {
//       loadInitialData()
//     }
//   }, [status, canAccess])

//   useEffect(() => {
//     if (canAccess && selectedRestaurant) {
//       loadAnalytics()
//     }
//   }, [selectedRestaurant, filters])

//   const loadInitialData = async () => {
//     try {
//       const [restaurantsRes, filterRes] = await Promise.all([
//         fetch('/api/retailers'), // Memanggil daftar retailer murni
//         fetch('/api/analytics?getFilterOptions=true') // Memanggil endpoint analytics untuk opsi filter
//       ])
      
//       if (restaurantsRes.ok) {
//         const data = await restaurantsRes.json()
//         const formattedRestaurants = data.map((r: any) => ({
//           id: r.id_retailer,
//           name: r.retailer_name,
//           code: r.retailer_name?.substring(0, 3).toUpperCase()
//         }))
//         setRestaurants(formattedRestaurants)
//         if (formattedRestaurants.length > 0) {
//           setSelectedRestaurant('all')
//         }
//       }

//       if (filterRes.ok) {
//         const filterData = await filterRes.json()
//         if (filterData.filterOptions) {
//           setFilterOptions({
//             months: filterData.filterOptions.months || [],
//             products: filterData.filterOptions.products?.map((p: string, i: number) => ({ id_product: i, product: p })) || [],
//             cities: filterData.filterOptions.cities?.map((c: string, i: number) => ({ id_city: i, city: c })) || [],
//             methods: filterData.filterOptions.methods?.map((m: string, i: number) => ({ id_method: i, method: m })) || []
//           })
//         }
//       }
//     } catch (err) {
//       console.error('Error loading initial data:', err)
//     }
//   }

//   const loadAnalytics = async () => {
//     if (!selectedRestaurant) return
//     setIsLoading(true)
//     setError(null)
//     try {
//       const params = new URLSearchParams()
//       if (selectedRestaurant !== 'all') params.set('retailerId', selectedRestaurant)
//       if (filters.month !== 'all') params.set('month', filters.month)
//       if (filters.product !== 'all') params.set('product', filters.product)
//       if (filters.city !== 'all') params.set('city', filters.city)
//       if (filters.method !== 'all') params.set('method', filters.method)
      
//       const res = await fetch(`/api/analytics?${params.toString()}`)
//       const data = await res.json()
      
//       if (data.totalOrders > 0) {
//         setFilteredData(data)
//       } else {
//         setFilteredData(null)
//       }
//     } catch (err) {
//       console.error('Error loading analytics:', err)
//       setError('Terjadi kesalahan')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length
//   const clearFilters = () => setFilters({ month: 'all', product: 'all', city: 'all', method: 'all' })

//   if (status === 'loading' || (canAccess && isLoading && !filteredData)) {
//     return (
//       <div className="p-6 space-y-6">
//         <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
//         <Card>
//           <CardContent className="flex items-center justify-center py-16">
//             <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (!canAccess) {
//     return (
//       <div className="p-6 space-y-6">
//         <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
//         <Card>
//           <CardContent className="p-8 text-center">
//             <p className="text-slate-500">Anda tidak memiliki akses ke halaman Analytics.</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   const hasData = filteredData && filteredData.totalOrders > 0

//   if (!hasData) {
//     return (
//       <div className="p-6 space-y-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
//             <p className="text-slate-500">Analisis data penjualan dengan insights actionable</p>
//           </div>
//           {isSuperAdmin && restaurants.length > 0 && (
//             <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
//               <SelectTrigger className="w-64"><SelectValue placeholder="Pilih retailer" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Semua Retail</SelectItem>
//                 {restaurants?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           )}
//         </div>
        
//         <DataSlicer
//           filters={filters}
//           setFilters={setFilters}
//           filterOptions={filterOptions}
//           activeFiltersCount={activeFiltersCount}
//           onClearFilters={clearFilters}
//         />
        
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-16">
//             <TrendingUp className="h-16 w-16 mb-4 opacity-30 text-slate-400" />
//             <h3 className="text-lg font-semibold mb-2 text-slate-800">Belum Ada Data</h3>
//             <p className="text-center mb-6 max-w-md text-slate-500">Data penjualan belum tersedia untuk filter yang dipilih. Silakan pilih filter lain atau upload data transaksi terlebih dahulu.</p>
//             <Link href="/upload" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
//               <Upload className="w-5 h-5" />
//               Upload Data
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   const data = filteredData

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
//           <p className="text-slate-500">Analisis mendalam data penjualan</p>
//         </div>
//         <div className="flex items-center gap-3">
//           {isSuperAdmin && restaurants.length > 0 && (
//             <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
//               <SelectTrigger className="w-64"><SelectValue placeholder="Pilih retailer" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Semua Retail</SelectItem>
//                 {restaurants?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           )}
//         </div>
//       </div>

//       <DataSlicer
//         filters={filters}
//         setFilters={setFilters}
//         filterOptions={filterOptions}
//         activeFiltersCount={activeFiltersCount}
//         onClearFilters={clearFilters}
//       />

//       {/* Summary Stats - KPI Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <CardHeader className="pb-2">
//             <CardDescription className="flex items-center gap-2 font-semibold text-blue-700">
//               <TrendingUp className="w-4 h-4" /> Total Unit Terjual
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold text-blue-800">{formatNumber(data.totalOrders)}</p>
//             <p className="text-xs text-blue-600/70 mt-1">Total Unit</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
//           <CardHeader className="pb-2">
//             <CardDescription className="flex items-center gap-2 font-semibold text-emerald-700">
//               <CheckCircle2 className="w-4 h-4" /> Total Revenue
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold text-emerald-800">{formatCurrency(data.salesStats?.total || 0)}</p>
//             <p className="text-xs text-emerald-600/70 mt-1">Total Penjualan</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
//           <CardHeader className="pb-2">
//             <CardDescription className="flex items-center gap-2 font-semibold text-rose-700">
//               <AlertTriangle className="w-4 h-4" /> Total Profit
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold text-rose-800">{formatCurrency(data.salesStats?.profit || 0)}</p>
//             <p className="text-xs text-rose-600/70 mt-1">Estimasi Keuntungan</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
//           <CardHeader className="pb-2">
//             <CardDescription className="flex items-center gap-2 font-semibold text-violet-700">
//               <Clock className="w-4 h-4" /> Rata-rata Order
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-3xl font-bold text-violet-800">{formatCurrency(data.salesStats?.avgOrderValue || 0)}</p>
//             <p className="text-xs text-violet-600/70 mt-1">Per Unit Terjual</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Row 1: Line Chart (Full Width) */}
//       <div className="grid grid-cols-1 gap-6">
//         <ChartCard 
//           title="Tren Penjualan per Bulan"
//           description="Visualisasi total penjualan berdasarkan waktu"
//           insight={data.ordersByMonth && data.ordersByMonth.length > 0 ? `Total revenue: ${formatCurrency(data.salesStats?.total)}` : undefined}
//         >
//           {data.ordersByMonth && data.ordersByMonth.length > 0 ? (
//             <ELineChart 
//               data={data.ordersByMonth.map(d => ({ label: d.month.slice(0, 7), value: d.sales || 0 }))} 
//               color="#f97316"
//               isCurrency={true}
//               height={320}
//             />
//           ) : <EmptyChart message="Belum ada data bulanan" />}
//         </ChartCard>
//       </div>

//       {/* Row 2: 2 Pie Charts (2 columns) */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <ChartCard 
//           title="Unit Terjual (Produk)"
//           description="Komposisi penjualan unit berdasarkan produk"
//           insight={data.ordersByProduct && data.ordersByProduct.length > 0 ? `Produk unit terbanyak: ${data.ordersByProduct.sort((a,b) => b.count - a.count)[0]?.product || '-'}` : undefined}
//         >
//           {data.ordersByProduct && data.ordersByProduct.length > 0 ? (
//             <EPieChart data={data.ordersByProduct.map(d => ({ label: d.product, value: d.count }))} height={320} />
//           ) : <EmptyChart message="Belum ada data produk" />}
//         </ChartCard>

//         <ChartCard 
//           title="Top 5 Produk (Revenue)"
//           description="Produk yang menghasilkan nilai penjualan tertinggi"
//           insight={data.ordersByProduct && data.ordersByProduct.length > 0 ? `Revenue tertinggi: ${data.ordersByProduct[0]?.product || '-'}` : undefined}
//         >
//           {data.ordersByProduct && data.ordersByProduct.length > 0 ? (
//             <EPieChart 
//               data={data.ordersByProduct.slice(0, 5).map(d => ({ label: d.product, value: d.sales || 0 }))} 
//               colors={['#2563eb', '#7c3aed', '#059669', '#dc2626', '#f59e0b', '#06b6d4']}
//               height={320}
//               isCurrency={true}
//             />
//           ) : <EmptyChart message="Belum ada data" />}
//         </ChartCard>
//       </div>

//       {/* Row 3: Bar Chart Top 5 Kota & Performa Department (2 Columns) */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ChartCard 
//           title="Top 5 Kota (Revenue)"
//           description="Kota dengan nilai penjualan tertinggi"
//           insight={data.ordersByLocation && data.ordersByLocation.length > 0 ? `Kota tertinggi: ${data.ordersByLocation[0]?.location || '-'}` : undefined}
//         >
//           {data.ordersByLocation && data.ordersByLocation.length > 0 ? (
//             <EBarChart 
//               data={data.ordersByLocation.slice(0, 5).map(d => ({ 
//                 label: d.location?.length > 15 ? d.location.substring(0, 15) + '...' : d.location, 
//                 value: d.sales || 0
//               }))} 
//               color="#6366f1" // Warna Indigo
//               isCurrency={true}
//               height={320}
//             />
//           ) : <EmptyChart message="Belum ada data lokasi" />}
//         </ChartCard>

//         {data.ordersByRestaurant && data.ordersByRestaurant.length > 0 && (
//           <ChartCard 
//             title="Performa Department"
//             description="Perbandingan nilai penjualan antar department"
//             insight={`Retailer tertinggi: ${data.ordersByRestaurant.sort((a,b) => (b.sales||0) - (a.sales||0))[0]?.restaurant || '-'}`}
//           >
//             <EBarChart 
//               data={data.ordersByRestaurant.map(d => ({ label: d.restaurant, value: d.sales || 0 })).sort((a,b) => b.value - a.value)} 
//               color="#3b82f6" // Warna Standard Blue
//               isCurrency={true}
//               height={320}
//             />
//           </ChartCard>
//         )}
//       </div>

//       {/* Row 4: Pie Chart Metode Penjualan & Bar Chart 10 Kota (Selang-Seling Kiri-Kanan) */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Pie Chart di Kiri */}
//         {data.ordersByMethod && data.ordersByMethod.length > 0 && (
//           <ChartCard 
//             title="Metode Penjualan"
//             description="Distribusi pendapatan berdasarkan metode"
//           >
//             <EPieChart 
//               data={data.ordersByMethod.map(d => ({ label: d.method, value: d.sales || 0 })).sort((a,b) => b.value - a.value)} 
//               colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']}
//               height={320}
//               isCurrency={true}
//             />
//           </ChartCard>
//         )}

//         {/* Bar Chart di Kanan */}
//         {data.ordersByLocation && data.ordersByLocation.length > 0 && (
//           <ChartCard 
//             title="Volume Transaksi per Kota"
//             description="Jumlah unit yang terjual berdasarkan lokasi (Top 10)"
//           >
//             <EBarChart 
//               data={data.ordersByLocation.slice(0, 10).map(d => ({ 
//                 label: d.location?.length > 15 ? d.location.substring(0, 15) + '...' : d.location, 
//                 value: d.count 
//               })).sort((a,b) => b.value - a.value)} 
//               color="#0ea5e9" // Warna Sky Blue (Biru Muda Cerah)
//               height={320}
//             />
//           </ChartCard>
//         )}
//       </div>
//     </div>
//   )
// }


'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Clock, AlertTriangle, CheckCircle2, Upload, Filter, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import * as echarts from 'echarts'
import { EBarChart, EPieChart } from '@/components/charts/echart-components'

interface Restaurant {
  id: string
  name: string
  code: string
}

interface AnalyticsData {
  totalOrders: number
  ordersByRestaurant: { restaurant: string; count: number; sales?: number }[]
  ordersByProduct: { product: string; count: number; sales?: number }[]
  ordersByMonth: { month: string; count: number; sales?: number }[]
  ordersByLocation: { location: string; count: number; sales?: number }[]
  ordersByMethod: { method: string; count: number; sales?: number }[]
  salesStats: { total: number; profit: number; avgOrderValue: number }
}

interface FilterState {
  month: string
  product: string
  city: string
  method: string
}

interface FilterOptions {
  products: { id_product: number; product: string }[]
  methods: { id_method: number; method: string }[]
  cities: { id_city: number; city: string }[]
  months: string[]
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' M'
  else if (num >= 1000000) return (num / 1000000).toFixed(1) + ' JT'
  else if (num >= 1000) return (num / 1000).toFixed(0) + ' RB'
  return num.toLocaleString('id-ID')
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return 'Rp ' + (num / 1000000000).toFixed(1) + ' M'
  else if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + ' JT'
  else if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(0) + ' RB'
  return 'Rp ' + num.toLocaleString('id-ID')
}

// KOMPONEN LINE CHART BARU KHUSUS ANALYTICS (Diadaptasi dari Forecasting)
function AnalyticsLineChart({ data, color = '#f97316', isCurrency = true, height = 320 }: { data: {label: string, value: number}[], color?: string, isCurrency?: boolean, height?: number }) {
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
          start: data.length > 12 ? 60 : 0, // Zoom otomatis ke bulan terbaru jika datanya banyak
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
          fillerColor: 'rgba(249, 115, 22, 0.2)' 
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
            hideOverlap: true, // INI KUNCI AGAR TIDAK TUMPUK DI HP
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Bulan Transaksi</label>
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
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Kota</label>
              <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Kota" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kota</SelectItem>
                  {filterOptions.cities?.map(c => <SelectItem key={c.id_city} value={c.city}>{c.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Metode Penjualan</label>
              <Select value={filters.method} onValueChange={(value) => setFilters(prev => ({ ...prev, method: value }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Semua Metode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  {filterOptions.methods?.map(m => <SelectItem key={m.id_method} value={m.method}>{m.method}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
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
      <CardContent className="flex-1 min-h-[320px] p-4 flex flex-col justify-center">
        {children}
      </CardContent>
    </Card>
  )
}

function EmptyChart({ message = "Belum ada data" }: { message?: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center py-10">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
        <TrendingUp className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-400 text-xs">{message}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all')
  const [filteredData, setFilteredData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ products: [], methods: [], cities: [], months: [] })
  const [filters, setFilters] = useState<FilterState>({
    month: 'all',
    product: 'all',
    city: 'all',
    method: 'all'
  })

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const isSuperAdmin = userRole === 'GM' || userRole === 'ADMIN_PUSAT'
  const isManager = userRole === 'MANAGER'
  const canAccess = isSuperAdmin || isManager

  useEffect(() => {
    if (status === 'authenticated' && canAccess) {
      loadInitialData()
    }
  }, [status, canAccess])

  useEffect(() => {
    if (canAccess && selectedRestaurant) {
      loadAnalytics()
    }
  }, [selectedRestaurant, filters])

  const loadInitialData = async () => {
    try {
      const [restaurantsRes, filterRes] = await Promise.all([
        fetch('/api/retailers'), // Memanggil daftar retailer murni
        fetch('/api/analytics?getFilterOptions=true') // Memanggil endpoint analytics untuk opsi filter
      ])
      
      if (restaurantsRes.ok) {
        const data = await restaurantsRes.json()
        const formattedRestaurants = data.map((r: any) => ({
          id: r.id_retailer,
          name: r.retailer_name,
          code: r.retailer_name?.substring(0, 3).toUpperCase()
        }))
        setRestaurants(formattedRestaurants)
        if (formattedRestaurants.length > 0) {
          setSelectedRestaurant('all')
        }
      }

      if (filterRes.ok) {
        const filterData = await filterRes.json()
        if (filterData.filterOptions) {
          setFilterOptions({
            months: filterData.filterOptions.months || [],
            products: filterData.filterOptions.products?.map((p: string, i: number) => ({ id_product: i, product: p })) || [],
            cities: filterData.filterOptions.cities?.map((c: string, i: number) => ({ id_city: i, city: c })) || [],
            methods: filterData.filterOptions.methods?.map((m: string, i: number) => ({ id_method: i, method: m })) || []
          })
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const loadAnalytics = async () => {
    if (!selectedRestaurant) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedRestaurant !== 'all') params.set('retailerId', selectedRestaurant)
      if (filters.month !== 'all') params.set('month', filters.month)
      if (filters.product !== 'all') params.set('product', filters.product)
      if (filters.city !== 'all') params.set('city', filters.city)
      if (filters.method !== 'all') params.set('method', filters.method)
      
      const res = await fetch(`/api/analytics?${params.toString()}`)
      const data = await res.json()
      
      if (data.totalOrders > 0) {
        setFilteredData(data)
      } else {
        setFilteredData(null)
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length
  const clearFilters = () => setFilters({ month: 'all', product: 'all', city: 'all', method: 'all' })

  if (status === 'loading' || (canAccess && isLoading && !filteredData)) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Anda tidak memiliki akses ke halaman Analytics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = filteredData && filteredData.totalOrders > 0

  if (!hasData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
            <p className="text-slate-500">Analisis data penjualan dengan insights actionable</p>
          </div>
          {isSuperAdmin && restaurants.length > 0 && (
            <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Pilih retailer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Retail</SelectItem>
                {restaurants?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <DataSlicer
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={clearFilters}
        />
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 mb-4 opacity-30 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-slate-800">Belum Ada Data</h3>
            <p className="text-center mb-6 max-w-md text-slate-500">Data penjualan belum tersedia untuk filter yang dipilih. Silakan pilih filter lain atau upload data transaksi terlebih dahulu.</p>
            <Link href="/upload" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <Upload className="w-5 h-5" />
              Upload Data
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const data = filteredData

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
          <p className="text-slate-500">Analisis mendalam data penjualan</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && restaurants.length > 0 && (
            <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
              <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Pilih retailer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Retail</SelectItem>
                {restaurants?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <DataSlicer
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
      />

      {/* Summary Stats - KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2 px-4 md:px-6 pt-4">
            <CardDescription className="flex items-center gap-2 font-semibold text-blue-700 text-xs md:text-sm">
              <TrendingUp className="w-4 h-4" /> Total Unit Terjual
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4">
            <p className="text-xl md:text-3xl font-bold text-blue-800">{formatNumber(data.totalOrders)}</p>
            <p className="text-[10px] md:text-xs text-blue-600/70 mt-1">Total Unit</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="pb-2 px-4 md:px-6 pt-4">
            <CardDescription className="flex items-center gap-2 font-semibold text-emerald-700 text-xs md:text-sm">
              <CheckCircle2 className="w-4 h-4" /> Total Revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4">
            <p className="text-xl md:text-3xl font-bold text-emerald-800">{formatCurrency(data.salesStats?.total || 0)}</p>
            <p className="text-[10px] md:text-xs text-emerald-600/70 mt-1">Total Penjualan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardHeader className="pb-2 px-4 md:px-6 pt-4">
            <CardDescription className="flex items-center gap-2 font-semibold text-rose-700 text-xs md:text-sm">
              <AlertTriangle className="w-4 h-4" /> Total Profit
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4">
            <p className="text-xl md:text-3xl font-bold text-rose-800">{formatCurrency(data.salesStats?.profit || 0)}</p>
            <p className="text-[10px] md:text-xs text-rose-600/70 mt-1">Estimasi Keuntungan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardHeader className="pb-2 px-4 md:px-6 pt-4">
            <CardDescription className="flex items-center gap-2 font-semibold text-violet-700 text-xs md:text-sm">
              <Clock className="w-4 h-4" /> Rata-rata Order
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4">
            <p className="text-xl md:text-3xl font-bold text-violet-800">{formatCurrency(data.salesStats?.avgOrderValue || 0)}</p>
            <p className="text-[10px] md:text-xs text-violet-600/70 mt-1">Per Unit Terjual</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Line Chart (Full Width) */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard 
          title="Tren Penjualan per Bulan"
          description="Visualisasi total penjualan berdasarkan waktu"
          insight={data.ordersByMonth && data.ordersByMonth.length > 0 ? `Total revenue: ${formatCurrency(data.salesStats?.total)}` : undefined}
        >
          {data.ordersByMonth && data.ordersByMonth.length > 0 ? (
            <AnalyticsLineChart 
              data={data.ordersByMonth.map(d => ({ label: d.month.slice(0, 7), value: d.sales || 0 }))} 
              color="#f97316"
              isCurrency={true}
              height={320}
            />
          ) : <EmptyChart message="Belum ada data bulanan" />}
        </ChartCard>
      </div>

      {/* Row 2: 2 Pie Charts (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Unit Terjual (Produk)"
          description="Komposisi penjualan unit berdasarkan produk"
          insight={data.ordersByProduct && data.ordersByProduct.length > 0 ? `Produk unit terbanyak: ${data.ordersByProduct.sort((a,b) => b.count - a.count)[0]?.product || '-'}` : undefined}
        >
          {data.ordersByProduct && data.ordersByProduct.length > 0 ? (
            <EPieChart data={data.ordersByProduct.map(d => ({ label: d.product, value: d.count }))} height={320} />
          ) : <EmptyChart message="Belum ada data produk" />}
        </ChartCard>

        <ChartCard 
          title="Top 5 Produk (Revenue)"
          description="Produk yang menghasilkan nilai penjualan tertinggi"
          insight={data.ordersByProduct && data.ordersByProduct.length > 0 ? `Revenue tertinggi: ${data.ordersByProduct[0]?.product || '-'}` : undefined}
        >
          {data.ordersByProduct && data.ordersByProduct.length > 0 ? (
            <EPieChart 
              data={data.ordersByProduct.slice(0, 5).map(d => ({ label: d.product, value: d.sales || 0 }))} 
              colors={['#2563eb', '#7c3aed', '#059669', '#dc2626', '#f59e0b', '#06b6d4']}
              height={320}
              isCurrency={true}
            />
          ) : <EmptyChart message="Belum ada data" />}
        </ChartCard>
      </div>

      {/* Row 3: Bar Chart Top 5 Kota & Performa Department (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Top 5 Kota (Revenue)"
          description="Kota dengan nilai penjualan tertinggi"
          insight={data.ordersByLocation && data.ordersByLocation.length > 0 ? `Kota tertinggi: ${data.ordersByLocation[0]?.location || '-'}` : undefined}
        >
          {data.ordersByLocation && data.ordersByLocation.length > 0 ? (
            <EBarChart 
              data={data.ordersByLocation.slice(0, 5).map(d => ({ 
                label: d.location?.length > 15 ? d.location.substring(0, 15) + '...' : d.location, 
                value: d.sales || 0
              }))} 
              color="#6366f1" // Warna Indigo
              isCurrency={true}
              height={320}
            />
          ) : <EmptyChart message="Belum ada data lokasi" />}
        </ChartCard>

        {data.ordersByRestaurant && data.ordersByRestaurant.length > 0 && (
          <ChartCard 
            title="Performa Department"
            description="Perbandingan nilai penjualan antar department"
            insight={`Retailer tertinggi: ${data.ordersByRestaurant.sort((a,b) => (b.sales||0) - (a.sales||0))[0]?.restaurant || '-'}`}
          >
            <EBarChart 
              data={data.ordersByRestaurant.map(d => ({ label: d.restaurant, value: d.sales || 0 })).sort((a,b) => b.value - a.value)} 
              color="#3b82f6" // Warna Standard Blue
              isCurrency={true}
              height={320}
            />
          </ChartCard>
        )}
      </div>

      {/* Row 4: Pie Chart Metode Penjualan & Bar Chart 10 Kota (Selang-Seling Kiri-Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart di Kiri */}
        {data.ordersByMethod && data.ordersByMethod.length > 0 && (
          <ChartCard 
            title="Metode Penjualan"
            description="Distribusi pendapatan berdasarkan metode"
          >
            <EPieChart 
              data={data.ordersByMethod.map(d => ({ label: d.method, value: d.sales || 0 })).sort((a,b) => b.value - a.value)} 
              colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']}
              height={320}
              isCurrency={true}
            />
          </ChartCard>
        )}

        {/* Bar Chart di Kanan */}
        {data.ordersByLocation && data.ordersByLocation.length > 0 && (
          <ChartCard 
            title="Volume Transaksi per Kota"
            description="Jumlah unit yang terjual berdasarkan lokasi (Top 10)"
          >
            <EBarChart 
              data={data.ordersByLocation.slice(0, 10).map(d => ({ 
                label: d.location?.length > 15 ? d.location.substring(0, 15) + '...' : d.location, 
                value: d.count 
              })).sort((a,b) => b.value - a.value)} 
              color="#0ea5e9" // Warna Sky Blue (Biru Muda Cerah)
              height={320}
            />
          </ChartCard>
        )}
      </div>
    </div>
  )
}