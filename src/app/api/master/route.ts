import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [retailers, products, methods] = await Promise.all([
      prisma.retailer.findMany({ orderBy: { retailer_name: 'asc' } }),
      prisma.product.findMany({ orderBy: { product: 'asc' } }),
      prisma.method.findMany({ orderBy: { method: 'asc' } })
    ])

    // Mapping agar sesuai dengan interface MasterData di frontend kamu
    return NextResponse.json({
      retailers: retailers.map(r => ({
        id: r.id_retailer,
        retailer_name: r.retailer_name,
        code: r.retailer_name?.substring(0, 3).toUpperCase() || 'XXX'
      })),
      products: products.map(p => ({
        id: p.id_product,
        product: p.product
      })),
      methods: methods.map(m => ({
        id: m.id_method,
        method: m.method
      }))
    })
  } catch (error) {
    console.error('Master data error:', error)
    return NextResponse.json({ error: 'Gagal memuat data master' }, { status: 500 })
  }
}