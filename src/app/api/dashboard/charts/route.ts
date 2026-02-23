// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export const dynamic = 'force-dynamic'

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     // 1. CEK ROLE DAN RETAILER ID DARI USER YANG LOGIN
//     const userRole = (session.user as any).role || (session.user as any).position || 'STAFF'
//     const userRetailerId = (session.user as any).retailerId || (session.user as any).restaurantId
//     const isSuperAdmin = userRole === 'GM' || userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN_PUSAT'

//     const { searchParams } = new URL(request.url)
//     const retailerId = searchParams.get('retailer')
//     const month = searchParams.get('month') // Format: YYYY-MM
//     const product = searchParams.get('product')
//     const method = searchParams.get('method')
//     const city = searchParams.get('city')

//     // 2. BANGUN FILTER DATABASE (WHERE CLAUSE)
//     const where: any = {}

//     // 🛡️ KUNCI KEAMANAN: Paksa filter retailer jika bukan GM
//     if (!isSuperAdmin) {
//       if (userRetailerId) {
//         where.id_retailer = parseInt(userRetailerId)
//       } else {
//         // Jika staf tidak terdaftar di toko manapun, jangan tampilkan data sama sekali
//         return NextResponse.json({ totalOrders: 0, totalRevenue: 0, totalProfit: 0 })
//       }
//     } else {
//       // Jika GM, bebaskan mereka menggunakan filter dropdown dari frontend
//       if (retailerId && retailerId !== 'all') {
//         where.id_retailer = parseInt(retailerId)
//       }
//     }

//     // Filter tambahan dari dropdown frontend
//     if (month && month !== 'all') {
//       const start = new Date(`${month}-01`)
//       const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
//       where.invoice_date = { gte: start, lt: end }
//     }
//     if (product && product !== 'all') {
//       where.product = { product: product }
//     }
//     if (method && method !== 'all') {
//       where.method = { method: method }
//     }
//     if (city && city !== 'all') {
//       where.city = { city: city }
//     }

//     // 3. AMBIL DATA MENGGUNAKAN PRISMA
//     const transactions = await prisma.transaction.findMany({
//       where,
//       include: {
//         retailer: true,
//         product: true,
//         method: true,
//         city: true
//       }
//     })

//     if (!transactions || transactions.length === 0) {
//       return NextResponse.json({
//         totalOrders: 0, totalRevenue: 0, totalProfit: 0, avgOrderValue: 0, avgMargin: 0,
//         deliveryPerformance: [], pizzaSizes: [], pizzaTypes: [], paymentMethods: [],
//         ordersByRestaurant: [], byCity: [], byState: [], peakHours: []
//       })
//     }

//     // 4. HITUNG STATISTIK (LOGIC SAMA SEPERTI SEBELUMNYA)
//     const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total_sales || 0), 0)
//     const totalProfit = transactions.reduce((sum, t) => sum + Number(t.operating_profit || 0), 0)
//     const totalUnits = transactions.reduce((sum, t) => sum + (t.unit_sold || 0), 0)
//     const totalTransactions = transactions.length

//     const byProduct: Record<string, { units: number; revenue: number }> = {}
//     const byRetailer: Record<string, { revenue: number }> = {}
//     const byMethod: Record<string, { units: number }> = {}
//     const byMonth: Record<string, { units: number; revenue: number }> = {}
//     const byCity: Record<string, { revenue: number }> = {}

//     for (const t of transactions) {
//       const pName = t.product?.product || 'Unknown'
//       const rName = t.retailer?.retailer_name || 'Unknown'
//       const mName = t.method?.method || 'Unknown'
//       const cName = t.city?.city || 'Unknown'
//       const mVal = t.invoice_date ? t.invoice_date.toISOString().substring(0, 7) : 'Unknown'

//       if (!byProduct[pName]) byProduct[pName] = { units: 0, revenue: 0 }
//       byProduct[pName].units += t.unit_sold || 0
//       byProduct[pName].revenue += Number(t.total_sales || 0)

//       if (!byRetailer[rName]) byRetailer[rName] = { revenue: 0 }
//       byRetailer[rName].revenue += Number(t.total_sales || 0)

//       if (!byMethod[mName]) byMethod[mName] = { units: 0 }
//       byMethod[mName].units += t.unit_sold || 0

//       if (!byMonth[mVal]) byMonth[mVal] = { units: 0, revenue: 0 }
//       byMonth[mVal].units += t.unit_sold || 0
//       byMonth[mVal].revenue += Number(t.total_sales || 0)

//       if (!byCity[cName]) byCity[cName] = { revenue: 0 }
//       byCity[cName].revenue += Number(t.total_sales || 0)
//     }

//     const pizzaSizes = Object.entries(byProduct).map(([l, d]) => ({ label: l, value: d.units })).sort((a,b) => b.value - a.value).slice(0, 5)
//     const pizzaTypes = Object.entries(byProduct).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value)
//     const deliveryPerformance = Object.entries(byMonth).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => a.label.localeCompare(b.label))
//     const ordersByRestaurant = Object.entries(byRetailer).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value)
//     const paymentMethods = Object.entries(byMethod).map(([l, d]) => ({ label: l, value: d.units })).sort((a,b) => b.value - a.value)
//     const cityData = Object.entries(byCity).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value).slice(0, 10)

//     return NextResponse.json({
//       totalOrders: totalUnits,
//       totalRevenue,
//       totalProfit,
//       avgOrderValue: totalRevenue / (totalTransactions || 1),
//       avgMargin: (totalProfit / (totalRevenue || 1)) * 100,
//       peakHours: Object.entries(byMonth).map(([l, d]) => ({ label: l, value: d.units })),
//       pizzaSizes,
//       pizzaTypes,
//       deliveryPerformance,
//       paymentMethods,
//       ordersByRestaurant,
//       byCity: cityData,
//       byState: cityData,
//       trafficImpact: cityData,
//     })

//   } catch (error) {
//     console.error('Dashboard charts error:', error)
//     return NextResponse.json({ totalOrders: 0, totalRevenue: 0, deliveryPerformance: [], pizzaSizes: [] }, { status: 200 })
//   }
// }

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export const dynamic = 'force-dynamic'

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     // Ambil data user dari session
//     const userRole = (session.user as any).role || 'STAFF'
//     const userRetailerId = (session.user as any).retailerId
//     const isSuperAdmin = ['GM', 'GENERAL_MANAGER', 'ADMIN_PUSAT'].includes(userRole)

//     const { searchParams } = new URL(request.url)
//     const retailerParam = searchParams.get('retailer')
//     const month = searchParams.get('month')

//     const where: any = {}

//     // --- LOGIKA FILTER KEAMANAN ---
//     if (!isSuperAdmin) {
//       if (userRetailerId) {
//         where.id_retailer = Number(userRetailerId)
//         console.log(`[DASHBOARD] Filter Aktif: User ${session.user?.email} melihat Retailer ID: ${userRetailerId}`)
//       } else {
//         console.log(`[DASHBOARD] Warning: User ${session.user?.email} tidak punya retailerId di profile-nya.`)
//         return NextResponse.json({ totalOrders: 0, totalRevenue: 0, deliveryPerformance: [] })
//       }
//     } else {
//       // Jika GM, gunakan filter dropdown
//       if (retailerParam && retailerParam !== 'all') {
//         where.id_retailer = parseInt(retailerParam)
//       }
//     }

//     // Filter tambahan
//     if (month && month !== 'all') {
//       const start = new Date(`${month}-01`)
//       const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
//       where.invoice_date = { gte: start, lt: end }
//     }

//     // Ambil data dari Prisma
//     const transactions = await prisma.transaction.findMany({
//       where,
//       include: {
//         retailer: true,
//         product: true,
//         method: true,
//         city: true
//       }
//     })

//     if (!transactions || transactions.length === 0) {
//       return NextResponse.json({ totalOrders: 0, totalRevenue: 0, totalProfit: 0, deliveryPerformance: [] })
//     }

//     // HITUNG STATISTIK
//     const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total_sales || 0), 0)
//     const totalProfit = transactions.reduce((sum, t) => sum + Number(t.operating_profit || 0), 0)
//     const totalUnits = transactions.reduce((sum, t) => sum + (t.unit_sold || 0), 0)

//     const byProduct: Record<string, { units: number; revenue: number }> = {}
//     const byMonth: Record<string, { revenue: number }> = {}
//     const byMethod: Record<string, { units: number }> = {}
//     const byCity: Record<string, { revenue: number }> = {}

//     for (const t of transactions) {
//       const pName = t.product?.product || 'Unknown'
//       const mName = t.method?.method || 'Unknown'
//       const cName = t.city?.city || 'Unknown'
//       const mVal = t.invoice_date ? t.invoice_date.toISOString().substring(0, 7) : 'Unknown'

//       if (!byProduct[pName]) byProduct[pName] = { units: 0, revenue: 0 }
//       byProduct[pName].units += t.unit_sold || 0
//       byProduct[pName].revenue += Number(t.total_sales || 0)

//       if (!byMonth[mVal]) byMonth[mVal] = { revenue: 0 }
//       byMonth[mVal].revenue += Number(t.total_sales || 0)

//       if (!byMethod[mName]) byMethod[mName] = { units: 0 }
//       byMethod[mName].units += t.unit_sold || 0

//       if (!byCity[cName]) byCity[cName] = { revenue: 0 }
//       byCity[cName].revenue += Number(t.total_sales || 0)
//     }

//     return NextResponse.json({
//       totalOrders: totalUnits,
//       totalRevenue,
//       totalProfit,
//       avgOrderValue: totalRevenue / transactions.length,
//       avgMargin: (totalProfit / totalRevenue) * 100,
//       deliveryPerformance: Object.entries(byMonth).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => a.label.localeCompare(b.label)),
//       pizzaSizes: Object.entries(byProduct).map(([l, d]) => ({ label: l, value: d.units })).sort((a,b) => b.value - a.value).slice(0, 6),
//       pizzaTypes: Object.entries(byProduct).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value).slice(0, 6),
//       paymentMethods: Object.entries(byMethod).map(([l, d]) => ({ label: l, value: d.units })),
//       byCity: Object.entries(byCity).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value).slice(0, 10),
//       ordersByRestaurant: [] // Kosongkan karena staff hanya lihat tokonya sendiri
//     })

//   } catch (error) {
//     console.error('Dashboard error:', error)
//     return NextResponse.json({ totalOrders: 0, totalRevenue: 0 }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role || (session.user as any).position || 'STAFF'
    const userRetailerId = (session.user as any).retailerId
    const isSuperAdmin = ['GM', 'GENERAL_MANAGER', 'ADMIN_PUSAT'].includes(userRole)

    const { searchParams } = new URL(request.url)
    const retailerParam = searchParams.get('retailer')
    const month = searchParams.get('month')

    const where: any = {}

    // Filter Keamanan
    if (!isSuperAdmin) {
      if (userRetailerId) {
        where.id_retailer = Number(userRetailerId)
      } else {
        return NextResponse.json({ totalOrders: 0, totalRevenue: 0, deliveryPerformance: [] })
      }
    } else if (retailerParam && retailerParam !== 'all') {
      where.id_retailer = parseInt(retailerParam)
    }

    if (month && month !== 'all') {
      const start = new Date(`${month}-01`)
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
      where.invoice_date = { gte: start, lt: end }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        retailer: true,
        product: true,
        method: true,
        city: true
      }
    })

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ totalOrders: 0, totalRevenue: 0, ordersByRestaurant: [] })
    }

    // Penampung data untuk agregasi
    const byProduct: Record<string, { units: number; revenue: number }> = {}
    const byMonth: Record<string, { revenue: number }> = {}
    const byRetailer: Record<string, { revenue: number }> = {} // Tambahkan ini
    const byMethod: Record<string, { units: number }> = {}
    const byCity: Record<string, { revenue: number }> = {}

    transactions.forEach(t => {
      const pName = t.product?.product || 'Unknown'
      const rName = t.retailer?.retailer_name || 'Unknown' // Nama Retailer
      const mName = t.method?.method || 'Unknown'
      const cName = t.city?.city || 'Unknown'
      const mVal = t.invoice_date ? t.invoice_date.toISOString().substring(0, 7) : 'Unknown'

      if (!byProduct[pName]) byProduct[pName] = { units: 0, revenue: 0 }
      byProduct[pName].units += t.unit_sold || 0
      byProduct[pName].revenue += Number(t.total_sales || 0)

      if (!byMonth[mVal]) byMonth[mVal] = { revenue: 0 }
      byMonth[mVal].revenue += Number(t.total_sales || 0)

      // Hitung Revenue per Retailer agar muncul di dashboard GM
      if (!byRetailer[rName]) byRetailer[rName] = { revenue: 0 }
      byRetailer[rName].revenue += Number(t.total_sales || 0)

      if (!byMethod[mName]) byMethod[mName] = { units: 0 }
      byMethod[mName].units += t.unit_sold || 0

      if (!byCity[cName]) byCity[cName] = { revenue: 0 }
      byCity[cName].revenue += Number(t.total_sales || 0)
    })

    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total_sales || 0), 0)
    const totalProfit = transactions.reduce((sum, t) => sum + Number(t.operating_profit || 0), 0)

    return NextResponse.json({
      totalOrders: transactions.reduce((sum, t) => sum + (t.unit_sold || 0), 0),
      totalRevenue,
      totalProfit,
      avgOrderValue: totalRevenue / transactions.length,
      avgMargin: (totalProfit / totalRevenue) * 100,
      deliveryPerformance: Object.entries(byMonth).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => a.label.localeCompare(b.label)),
      pizzaSizes: Object.entries(byProduct).map(([l, d]) => ({ label: l, value: d.units })).sort((a,b) => b.value - a.value).slice(0, 6),
      pizzaTypes: Object.entries(byProduct).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value).slice(0, 6),
      paymentMethods: Object.entries(byMethod).map(([l, d]) => ({ label: l, value: d.units })),
      byCity: Object.entries(byCity).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value).slice(0, 10),
      // Sekarang data retailer akan muncul sesuai hasil filter
      ordersByRestaurant: Object.entries(byRetailer).map(([l, d]) => ({ label: l, value: d.revenue })).sort((a,b) => b.value - a.value)
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ totalOrders: 0, totalRevenue: 0 }, { status: 500 })
  }
}