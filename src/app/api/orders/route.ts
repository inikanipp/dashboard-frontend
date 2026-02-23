import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurant = searchParams.get('restaurant')

    const where: any = {}
    if (restaurant && restaurant !== 'all') {
      where.id_retailer = parseInt(restaurant)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        retailer: true,
        product: true,
        method: true,
        city: { include: { state: true } }
      },
      orderBy: { invoice_date: 'desc' },
      take: 100 
    })

    const formattedOrders = transactions.map(t => ({
      id: t.id_transaction.toString(), 
      transactionId: `TRX-${t.id_transaction}`, 
      retailerId: t.id_retailer,
      retailerName: t.retailer?.retailer_name || '-',
      productId: t.id_product,
      productName: t.product?.product || '-',
      methodId: t.id_method,
      methodName: t.method?.method || '-',
      cityId: t.id_city,
      cityName: t.city?.city || '-',
      stateName: t.city?.state?.state || '-',
      invoiceDate: t.invoice_date ? t.invoice_date.toISOString().split('T')[0] : '',
      pricePerUnit: Number(t.price_per_unit || 0),
      unitSold: t.unit_sold || 0,
      totalSales: Number(t.total_sales || 0),
      operatingProfit: Number(t.operating_profit || 0),
      operatingMargin: Number(t.operating_margin || 0)
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const newTransaction = await prisma.transaction.create({
      data: {
        id_retailer: parseInt(body.retailerId),
        id_product: parseInt(body.productId),
        id_method: parseInt(body.methodId),
        id_city: parseInt(body.cityId),
        invoice_date: new Date(body.invoiceDate),
        price_per_unit: parseFloat(body.pricePerUnit),
        unit_sold: parseInt(body.unitSold),
        total_sales: parseFloat(body.totalSales),
        operating_profit: parseFloat(body.operatingProfit),
        operating_margin: parseFloat(body.operatingMargin)
      }
    })

    return NextResponse.json({ success: true, data: newTransaction })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan transaksi' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })

    const body = await req.json()
    
    // MENGGUNAKAN updateMany UNTUK MENGHINDARI ERROR COMPOSITE KEY
    await prisma.transaction.updateMany({
      where: { id_transaction: parseInt(id) },
      data: {
        id_retailer: parseInt(body.retailerId),
        id_product: parseInt(body.productId),
        id_method: parseInt(body.methodId),
        id_city: parseInt(body.cityId),
        invoice_date: new Date(body.invoiceDate),
        price_per_unit: parseFloat(body.pricePerUnit),
        unit_sold: parseInt(body.unitSold),
        total_sales: parseFloat(body.totalSales),
        operating_profit: parseFloat(body.operatingProfit),
        operating_margin: parseFloat(body.operatingMargin)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate transaksi' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })

    // MENGGUNAKAN deleteMany UNTUK MENGHINDARI ERROR COMPOSITE KEY
    await prisma.transaction.deleteMany({
      where: { id_transaction: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 })
  }
}