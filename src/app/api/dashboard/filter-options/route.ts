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

    // Ambil semua data master secara paralel menggunakan Prisma
    const [retailers, products, methods, cities, transactions] = await Promise.all([
      prisma.retailer.findMany({ select: { id_retailer: true, retailer_name: true }, orderBy: { retailer_name: 'asc' } }),
      prisma.product.findMany({ select: { id_product: true, product: true }, orderBy: { product: 'asc' } }),
      prisma.method.findMany({ select: { id_method: true, method: true }, orderBy: { method: 'asc' } }),
      prisma.city.findMany({ select: { id_city: true, city: true }, orderBy: { city: 'asc' } }),
      prisma.transaction.findMany({ select: { invoice_date: true }, orderBy: { invoice_date: 'asc' } })
    ])

    // Ekstrak bulan unik (YYYY-MM)
    const monthsSet = new Set<string>()
    transactions.forEach(t => {
      if (t.invoice_date) {
        // Format date ke YYYY-MM
        const dateStr = t.invoice_date.toISOString().substring(0, 7)
        monthsSet.add(dateStr)
      }
    })
    
    const months = Array.from(monthsSet).sort().reverse()

    return NextResponse.json({
      retailers: retailers || [],
      products: products || [],
      methods: methods || [],
      cities: cities || [],
      months
    })

  } catch (error) {
    console.error('Filter options error:', error)
    return NextResponse.json({ 
      retailers: [],
      products: [],
      methods: [],
      cities: [],
      months: []
    }, { status: 200 })
  }
}