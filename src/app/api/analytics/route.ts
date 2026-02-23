import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma' // GUNAKAN PRISMA, BUKAN SUPABASE

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const getFilterOptions = searchParams.get('getFilterOptions') === 'true'
    
    // Parameter bersih sesuai schema kita
    const retailerId = searchParams.get('retailerId')
    const filterMonth = searchParams.get('month')
    const filterProduct = searchParams.get('product')
    const filterCity = searchParams.get('city')
    const filterMethod = searchParams.get('method')

    // 1. Build Prisma Where Clause
    const whereClause: any = {}

    if (retailerId && retailerId !== 'all' && !isNaN(parseInt(retailerId))) {
      whereClause.id_retailer = parseInt(retailerId)
    }

    if (filterProduct && filterProduct !== 'all') {
      whereClause.product = { product: filterProduct }
    }

    if (filterCity && filterCity !== 'all') {
      whereClause.city = { city: filterCity }
    }

    if (filterMethod && filterMethod !== 'all') {
      whereClause.method = { method: filterMethod }
    }

    if (filterMonth && filterMonth !== 'all') {
      // Format filterMonth biasanya "YYYY-MM" (contoh: "2023-10")
      const [year, month] = filterMonth.split('-')
      if (year && month) {
        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1))
        whereClause.invoice_date = {
          gte: startDate,
          lt: endDate
        }
      }
    }

    // 2. Fetch Data with Prisma
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        retailer: true,
        product: true,
        method: true,
        city: true
      }
    })

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        totalOrders: 0,
        ordersByRestaurant: [],
        ordersByProduct: [],
        ordersByLocation: [],
        ordersByMethod: [],
        ordersByMonth: [],
        salesStats: { total: 0, profit: 0 }
      })
    }

    // 3. Grouping Data (Menggunakan Map agar cepat)
    const retailerMap = new Map()
    const productMap = new Map()
    const methodMap = new Map()
    const cityMap = new Map()
    const monthMap = new Map()

    let totalUnits = 0
    let totalSales = 0
    let totalProfit = 0

    transactions.forEach(t => {
      // Pastikan konversi Decimal ke Number
      const unitSold = t.unit_sold || 0
      const sales = Number(t.total_sales) || 0
      const profit = Number(t.operating_profit) || 0

      totalUnits += unitSold
      totalSales += sales
      totalProfit += profit

      // Group Retailer
      const retailerName = t.retailer?.retailer_name || 'Unknown'
      if (!retailerMap.has(retailerName)) retailerMap.set(retailerName, { count: 0, sales: 0 })
      retailerMap.get(retailerName).count += unitSold
      retailerMap.get(retailerName).sales += sales

      // Group Product
      const productName = t.product?.product || 'Unknown'
      if (!productMap.has(productName)) productMap.set(productName, { count: 0, sales: 0 })
      productMap.get(productName).count += unitSold
      productMap.get(productName).sales += sales

      // Group Method
      const methodName = t.method?.method || 'Unknown'
      if (!methodMap.has(methodName)) methodMap.set(methodName, { count: 0, sales: 0 })
      methodMap.get(methodName).count += unitSold
      methodMap.get(methodName).sales += sales

      // Group City
      const cityName = t.city?.city || 'Unknown'
      if (!cityMap.has(cityName)) cityMap.set(cityName, { count: 0, sales: 0 })
      cityMap.get(cityName).count += unitSold
      cityMap.get(cityName).sales += sales

      // Group Month
      const monthStr = t.invoice_date ? t.invoice_date.toISOString().substring(0, 7) : 'Unknown'
      if (!monthMap.has(monthStr)) monthMap.set(monthStr, { count: 0, sales: 0 })
      monthMap.get(monthStr).count += unitSold
      monthMap.get(monthStr).sales += sales
    })

    // 4. Return Data untuk Filter Options (jika diminta)
    if (getFilterOptions) {
      return NextResponse.json({
        filterOptions: {
          months: [...monthMap.keys()].sort(),
          products: [...productMap.keys()].sort(),
          cities: [...cityMap.keys()].sort(),
          methods: [...methodMap.keys()].sort()
        }
      })
    }

    // 5. Return Data Utama untuk Chart
    return NextResponse.json({
      totalOrders: totalUnits,
      ordersByRestaurant: Array.from(retailerMap.entries()).map(([name, data]: any) => ({
        restaurant: name, count: data.count, sales: data.sales
      })),
      ordersByProduct: Array.from(productMap.entries()).map(([name, data]: any) => ({
        product: name, count: data.count, sales: data.sales
      })).sort((a, b) => b.sales - a.sales), // Urutkan dari revenue tertinggi
      ordersByMethod: Array.from(methodMap.entries()).map(([name, data]: any) => ({
        method: name, count: data.count, sales: data.sales
      })),
      ordersByMonth: Array.from(monthMap.entries()).map(([month, data]: any) => ({
        month, count: data.count, sales: data.sales
      })).sort((a, b) => a.month.localeCompare(b.month)), // Urutkan berdasarkan waktu
      ordersByLocation: Array.from(cityMap.entries()).map(([city, data]: any) => ({
        location: city, count: data.count, sales: data.sales
      })).sort((a, b) => b.sales - a.sales),
      salesStats: {
        total: totalSales,
        profit: totalProfit,
        avgOrderValue: totalUnits > 0 ? totalSales / totalUnits : 0
      }
    })

  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}