// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export const dynamic = 'force-dynamic'

// export async function GET(req: NextRequest) {
//   try {
//     // Hanya perlu mengambil data dari tabel transaksi
//     const transactions = await prisma.transaction.findMany({
//       take: 10000, // Limit 10,000 baris
//       include: {
//         retailer: true,
//         product: true,
//         city: true,
//         method: true
//       },
//       orderBy: {
//         invoice_date: 'desc'
//       }
//     })

//     // Mapping data agar struktur JSON sesuai dengan kebutuhan tabel frontend
//     const data = transactions.map((t) => ({
//       id_transaction: t.id_transaction,
//       id_retailer: t.id_retailer,
//       retailer_name: t.retailer?.retailer_name || '',
//       product: t.product?.product || '',
//       method: t.method?.method || '',
//       city: t.city?.city || '',
//       invoice_date: t.invoice_date,
//       price_per_unit: Number(t.price_per_unit || 0),
//       unit_sold: t.unit_sold,
//       total_sales: Number(t.total_sales || 0),
//       operating_profit: Number(t.operating_profit || 0),
//       operating_margin: Number(t.operating_margin || 0),
//       order_count: 1
//     }))

//     // MENGHITUNG DATA UNIK HANYA DARI TRANSAKSI YANG ADA
//     // Set() secara otomatis akan membuang duplikat ID
//     const uniqueRetailers = new Set(transactions.map(t => t.id_retailer)).size
//     const uniqueProducts = new Set(transactions.map(t => t.id_product)).size
//     const uniqueCities = new Set(transactions.map(t => t.id_city)).size

//     return NextResponse.json({
//       success: true,
//       data: data,
//       stats: {
//         transactions: transactions.length,
//         retailers: uniqueRetailers, // Sekarang hanya menghitung retailer yang ada transaksinya
//         products: uniqueProducts,   // Hanya menghitung produk yang terjual
//         cities: uniqueCities        // Hanya menghitung kota yang ada transaksinya
//       }
//     })
//   } catch (error: any) {
//     console.error('All-data error:', error)
//     return NextResponse.json({ 
//       success: true,
//       data: [],
//       stats: { transactions: 0, retailers: 0, products: 0, cities: 0 },
//       message: 'Database connection failed or table does not exist'
//     })
//   }
// }


import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const retailerId = searchParams.get('retailerId')

    const whereClause = retailerId ? { id_retailer: parseInt(retailerId) } : {}

    // 1. Hitung Statistik (Untuk halaman Upload)
    const totalTransactions = await prisma.transaction.count({ where: whereClause })
    
    let totalRetailers = 0
    if (retailerId) {
      totalRetailers = 1 
    } else {
      const uniqueRetailers = await prisma.transaction.groupBy({ by: ['id_retailer'] })
      totalRetailers = uniqueRetailers.length
    }

    const uniqueProducts = await prisma.transaction.groupBy({ by: ['id_product'], where: whereClause })
    const totalProducts = uniqueProducts.length

    const uniqueCities = await prisma.transaction.groupBy({ by: ['id_city'], where: whereClause })
    const totalCities = uniqueCities.length

    // 2. Ambil Raw Data (Sangat DIBUTUHKAN untuk halaman Forecasting)
    const rawTransactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        retailer: true,
        product: true,
        city: true,
        method: true
      },
      orderBy: { invoice_date: 'asc' }
    });

    const formattedData = rawTransactions.map((t: any) => ({
      retailer_name: t.retailer?.retailer_name,
      product: t.product?.product,
      method: t.method?.method,
      city: t.city?.city,
      invoice_date: t.invoice_date ? new Date(t.invoice_date).toISOString().split('T')[0] : null,
      price_per_unit: Number(t.price_per_unit || 0),
      unit_sold: Number(t.unit_sold || 0),
      total_sales: Number(t.total_sales || 0),
      operating_profit: Number(t.operating_profit || 0),
      operating_margin: Number(t.operating_margin || 0)
    }));

    return NextResponse.json({
      success: true,
      stats: {
        transactions: totalTransactions,
        retailers: totalRetailers,
        products: totalProducts,
        cities: totalCities,
      },
      data: formattedData // <--- INI KUNCI AGAR FORECASTING BISA BERJALAN LAGI
    })
  } catch (error) {
    console.error("Error fetching db data:", error)
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" }, 
      { status: 500 }
    )
  }
}