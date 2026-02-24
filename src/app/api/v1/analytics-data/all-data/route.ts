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

    // Jika ada retailerId (STAFF login), filter datanya. Jika tidak (GM login), ambil semua.
    const whereClause = retailerId ? { id_retailer: parseInt(retailerId) } : {}

    // 1. Hitung Total Transaksi
    const totalTransactions = await prisma.transaction.count({
      where: whereClause,
    })

    // 2. Hitung Total Retailer/Department
    let totalRetailers = 0
    if (retailerId) {
      // Jika Staff, departemennya pasti hanya 1 (miliknya sendiri)
      totalRetailers = 1 
    } else {
      // Jika GM, hitung berapa banyak departemen unik yang ada transaksinya
      const uniqueRetailers = await prisma.transaction.groupBy({
        by: ['id_retailer'],
      })
      totalRetailers = uniqueRetailers.length
    }

    // 3. Hitung Total Produk Unik
    const uniqueProducts = await prisma.transaction.groupBy({
      by: ['id_product'],
      where: whereClause,
    })
    const totalProducts = uniqueProducts.length

    // 4. Hitung Total Kota Unik
    const uniqueCities = await prisma.transaction.groupBy({
      by: ['id_city'],
      where: whereClause,
    })
    const totalCities = uniqueCities.length

    return NextResponse.json({
      success: true,
      stats: {
        transactions: totalTransactions,
        retailers: totalRetailers,
        products: totalProducts,
        cities: totalCities,
      }
    })
  } catch (error) {
    console.error("Error fetching db stats:", error)
    return NextResponse.json(
      { success: false, error: "Gagal mengambil statistik database" }, 
      { status: 500 }
    )
  }
}