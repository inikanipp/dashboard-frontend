import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeInsights = searchParams.get('includeInsights') === 'true'

    // Ambil semua data yang diperlukan secara paralel
    const [transactions, retailers, products, methods, cities] = await Promise.all([
      prisma.transaction.findMany({
        take: 10000,
        include: {
          retailer: true,
          product: true,
          method: true,
          city: {
            include: { state: true }
          }
        },
        orderBy: { invoice_date: 'desc' }
      }),
      prisma.retailer.findMany({ orderBy: { retailer_name: 'asc' } }),
      prisma.product.findMany({ orderBy: { product: 'asc' } }),
      prisma.method.findMany({ orderBy: { method: 'asc' } }),
      prisma.city.findMany({ 
        include: { state: true },
        orderBy: { city: 'asc' } 
      })
    ])

    const analytics = generateAnalyticsData(transactions)
    
    const response: any = {
      success: true,
      totalTransactions: transactions.length,
      retailers: retailers.length,
      products: products.length,
      cities: cities.length,
      methods: methods.length,
      analytics
    }

    if (includeInsights) {
      response.insights = generateVisualizationInsights(analytics)
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// Fungsi helper untuk memproses data (Logic bisnis tetap sama)
function generateAnalyticsData(transactions: any[]) {
  const byProduct: Record<string, { units: number; revenue: number; profit: number }> = {}
  const byRetailer: Record<string, { units: number; revenue: number; profit: number }> = {}
  const byMethod: Record<string, { units: number; revenue: number; profit: number }> = {}
  const byCity: Record<string, { units: number; revenue: number; profit: number }> = {}
  const byMonth: Record<string, { units: number; revenue: number; profit: number }> = {}
  const byState: Record<string, { units: number; revenue: number }> = {}

  let totalRevenue = 0
  let totalProfit = 0
  let totalUnits = 0

  for (const t of transactions) {
    // Handling Data Prisma (Null checking & Type Conversion)
    const productName = t.product?.product || 'Unknown'
    const retailerName = t.retailer?.retailer_name || 'Unknown'
    const methodName = t.method?.method || 'Unknown'
    const cityName = t.city?.city || 'Unknown'
    const stateName = t.city?.state?.state || 'Unknown'
    
    // Prisma Date Object ke String YYYY-MM
    const month = t.invoice_date 
      ? t.invoice_date.toISOString().substring(0, 7) 
      : 'Unknown'

    // Prisma Decimal ke Number
    const sales = Number(t.total_sales || 0)
    const profit = Number(t.operating_profit || 0)
    const units = t.unit_sold || 0

    totalRevenue += sales
    totalProfit += profit
    totalUnits += units

    // Grouping Product
    if (!byProduct[productName]) byProduct[productName] = { units: 0, revenue: 0, profit: 0 }
    byProduct[productName].units += units
    byProduct[productName].revenue += sales
    byProduct[productName].profit += profit

    // Grouping Retailer
    if (!byRetailer[retailerName]) byRetailer[retailerName] = { units: 0, revenue: 0, profit: 0 }
    byRetailer[retailerName].units += units
    byRetailer[retailerName].revenue += sales
    byRetailer[retailerName].profit += profit

    // Grouping Method
    if (!byMethod[methodName]) byMethod[methodName] = { units: 0, revenue: 0, profit: 0 }
    byMethod[methodName].units += units
    byMethod[methodName].revenue += sales
    byMethod[methodName].profit += profit

    // Grouping City
    if (!byCity[cityName]) byCity[cityName] = { units: 0, revenue: 0, profit: 0 }
    byCity[cityName].units += units
    byCity[cityName].revenue += sales
    byCity[cityName].profit += profit

    // Grouping Month
    if (!byMonth[month]) byMonth[month] = { units: 0, revenue: 0, profit: 0 }
    byMonth[month].units += units
    byMonth[month].revenue += sales
    byMonth[month].profit += profit

    // Grouping State
    if (!byState[stateName]) byState[stateName] = { units: 0, revenue: 0 }
    byState[stateName].units += units
    byState[stateName].revenue += sales
  }

  const topProducts = Object.entries(byProduct)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const topRetailers = Object.entries(byRetailer)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const topMethods = Object.entries(byMethod)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const topCities = Object.entries(byCity)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const topStates = Object.entries(byState)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const monthlyData = Object.entries(byMonth)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const bestMonth = monthlyData.length > 0 
    ? monthlyData.reduce((best, current) => current.revenue > best.revenue ? current : best)
    : null

  return {
    totalRevenue,
    totalProfit,
    totalUnits,
    avgOrderValue: totalRevenue / (transactions.length || 1),
    avgMargin: (totalProfit / (totalRevenue || 1)) * 100,
    topProducts,
    topRetailers,
    topMethods,
    topCities,
    topStates,
    monthlyData,
    bestMonth
  }
}

function generateVisualizationInsights(analytics: any) {
  const insights: Array<{
    chartType: string
    title: string
    insight: string
    recommendation: string
  }> = []

  if (analytics.bestMonth) {
    insights.push({
      chartType: 'line',
      title: 'Tren Penjualan per Bulan',
      insight: `Bulan dengan penjualan tertinggi: ${analytics.bestMonth.label} dengan revenue ${formatCurrency(analytics.bestMonth.revenue)}`,
      recommendation: 'Pastikan stock barang mencukupi pada bulan-bulan dengan penjualan tinggi. Pertimbangkan promo pada bulan dengan penjualan rendah.'
    })
  }

  if (analytics.topRetailers?.length > 0) {
    const top = analytics.topRetailers[0]
    insights.push({
      chartType: 'bar',
      title: 'Performa Retailer',
      insight: `Retailer terbaik: ${top.label} dengan total revenue ${formatCurrency(top.revenue)} dan ${top.units} unit terjual`,
      recommendation: 'Evaluasi retailer dengan transaksi rendah dan tiru strategi dari retailer terbaik.'
    })
  }

  if (analytics.topProducts?.length > 0) {
    const top = analytics.topProducts[0]
    insights.push({
      chartType: 'pie',
      title: 'Distribusi Produk',
      insight: `Produk paling banyak terjual: ${top.label} dengan ${top.units.toLocaleString()} unit terjual dan revenue ${formatCurrency(top.revenue)}`,
      recommendation: 'Pastikan stock untuk produk terlaris selalu tersedia. Fokuskan marketing pada produk dengan revenue tinggi.'
    })
  }

  if (analytics.topCities?.length > 0) {
    const top = analytics.topCities[0]
    insights.push({
      chartType: 'bar',
      title: 'Top 5 Kota',
      insight: `Kota dengan penjualan tertinggi: ${top.label} dengan total ${formatCurrency(top.revenue)}`,
      recommendation: 'Fokuskan ekspansi dan marketing di kota-kota dengan potensi tinggi.'
    })
  }

  if (analytics.topMethods?.length > 0) {
    const top = analytics.topMethods[0]
    insights.push({
      chartType: 'pie',
      title: 'Metode Penjualan',
      insight: `Metode penjualan paling banyak: ${top.label} dengan ${top.units} transaksi dan revenue ${formatCurrency(top.revenue)}`,
      recommendation: 'Pastikan sistem penjualan utama selalu berjalan lancer. Eksplorasi metode alternatif.'
    })
  }

  if (analytics.monthlyData?.length > 1) {
    const firstMonth = analytics.monthlyData[0]
    const lastMonth = analytics.monthlyData[analytics.monthlyData.length - 1]
    const growth = ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 100
    
    insights.push({
      chartType: 'line',
      title: 'Tren Pertumbuhan',
      insight: `Pertumbuhan dari ${firstMonth.label} ke ${lastMonth.label}: ${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
      recommendation: growth > 0 
        ? 'Tren positif! Pertahankan dengan terus meningkatkan kualitas dan pelayanan.'
        : 'Tren menurun. Segera evaluasi strategi marketing, harga, dan kualitas produk.'
    })
  }

  if (analytics.avgMargin) {
    insights.push({
      chartType: 'summary',
      title: 'Ringkasan Keuangan',
      insight: `Total Penjualan: ${formatCurrency(analytics.totalRevenue)} | Total Profit: ${formatCurrency(analytics.totalProfit)} | Rata-rata per transaksi: ${formatCurrency(analytics.avgOrderValue)} | Margin: ${analytics.avgMargin.toFixed(1)}%`,
      recommendation: 'Pantau terus performa keuangan dan pastikan profit margin sehat. Evaluasi biaya operasional jika margin terlalu rendah.'
    })
  }

  return insights
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return 'Rp ' + (num / 1000000000).toFixed(1) + 'M'
  if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt'
  if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(0) + 'Rb'
  return 'Rp ' + num.toLocaleString('id-ID')
}