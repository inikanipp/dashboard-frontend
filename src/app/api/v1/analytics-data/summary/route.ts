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

    const userRole = (session.user as any).role || (session.user as any).position || 'STAFF'
    // Asumsi: field retailerId ada di User, jika belum ada sesuaikan logika ini
    // Di kode register sebelumnya kita belum save retailerId, 
    // jadi logic ini hanya jalan jika kamu sudah update schema User.
    const userRetailerId = (session.user as any)?.retailerId || (session.user as any)?.restaurantId
    
    const isSuperAdmin = userRole === 'GM' || userRole === 'ADMIN_PUSAT'

    // Buat filter WHERE
    const where: any = {}
    if (!isSuperAdmin && userRetailerId) {
      where.id_retailer = parseInt(userRetailerId)
    }

    // Menggunakan Prisma Aggregate untuk performa maksimal
    // Tidak perlu load semua data ke memori server
    const aggregations = await prisma.transaction.aggregate({
      where,
      _sum: {
        total_sales: true,
        operating_profit: true,
      },
      _count: {
        id_transaction: true
      }
    })

    const totalOrders = aggregations._count.id_transaction || 0
    const totalRevenue = Number(aggregations._sum.total_sales || 0)
    const totalProfit = Number(aggregations._sum.operating_profit || 0)

    return NextResponse.json({
      success: true,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
    })

  } catch (error: any) {
    console.error('Summary error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}