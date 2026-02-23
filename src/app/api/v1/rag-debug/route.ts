import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const transactionCount = await prisma.transaction.count()
    const retailerCount = await prisma.retailer.count()

    const transactions = await prisma.transaction.findMany({
      take: 100,
      select: { total_sales: true, operating_profit: true, operating_margin: true }
    })

    const avgSales = transactions.length 
      ? transactions.reduce((sum, t) => sum + Number(t.total_sales || 0), 0) / transactions.length 
      : 0

    const sampleTransactions = await prisma.transaction.findMany({
      take: 5,
      include: { retailer: true, product: true },
      orderBy: { invoice_date: 'desc' }
    })

    return NextResponse.json({ 
      message: 'RAG Database Debug',
      database: 'Prisma PostgreSQL',
      totalTransactions: transactionCount,
      totalRetailers: retailerCount,
      avgSales,
      sampleTransactions: sampleTransactions.map(t => ({
        id: t.id_transaction,
        retailer: t.retailer?.retailer_name,
        product: t.product?.product,
        totalSales: Number(t.total_sales || 0)
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Debug failed',
      message: error.message
    }, { status: 500 })
  }
}