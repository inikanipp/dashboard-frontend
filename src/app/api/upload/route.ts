import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const [transactionCount, retailers, recentData] = await Promise.all([
      prisma.transaction.count(),
      prisma.retailer.findMany(),
      prisma.transaction.findMany({
        take: 5,
        orderBy: {
          invoice_date: 'desc'
        },
        include: {
          retailer: { select: { retailer_name: true } },
          product: { select: { product: true } },
          city: { select: { city: true } }
        }
      })
    ])

    return NextResponse.json({
      totalCount: transactionCount || 0,
      retailers: retailers || [],
      recentData: recentData || []
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const cleanedData = body.cleanedData || []

    if (cleanedData.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada data untuk diupload',
        data: { totalRows: 0, validRows: 0, invalidRows: 0, qualityScore: 0, errors: [] }
      }, { status: 400 })
    }

    const userId = session.user?.email || 'unknown'
    const userName = (session.user as any)?.name || session.user?.email || 'Unknown'
    const userRole = (session.user as any)?.role || (session.user as any)?.position || 'STAFF'
    const userRetailerId = (session.user as any)?.retailerId || null

    // Mengambil semua data referensi yang dibutuhkan dari Prisma
    const [retailers, products, methods, cities] = await Promise.all([
      prisma.retailer.findMany({ select: { id_retailer: true, retailer_name: true } }),
      prisma.product.findMany({ select: { id_product: true, product: true } }),
      prisma.method.findMany({ select: { id_method: true, method: true } }),
      prisma.city.findMany({ select: { id_city: true, city: true } })
    ])

    // Fungsi pembantu untuk mencocokkan ID (dengan fallback ke ID = 1 jika tidak ketemu)
    const getRetailerId = (name: string) => {
      const found = retailers.find(r => r.retailer_name?.toLowerCase() === name?.toLowerCase())
      return found?.id_retailer || 1
    }

    const getProductId = (name: string) => {
      const found = products.find(p => p.product?.toLowerCase() === name?.toLowerCase())
      return found?.id_product || 1
    }

    const getMethodId = (name: string) => {
      const found = methods.find(m => m.method?.toLowerCase() === name?.toLowerCase())
      return found?.id_method || 1
    }

    const getCityId = (name: string) => {
      const found = cities.find(c => c.city?.toLowerCase() === name?.toLowerCase())
      return found?.id_city || 1
    }

    // 1. Buat record upload_history terlebih dahulu
    const uploadRecord = await prisma.upload_history.create({
      data: {
        file_name: 'uploaded_file.xlsx',
        system_name: 'adidas_sales',
        status: 'processing',
        note: `Uploaded by ${userName} (${userRole})${userRetailerId ? ' - Retailer ID: ' + userRetailerId : ''}`,
        total_rows: cleanedData.length,
        uploaded_by: `${userName} (${userId})`,
        // uploaded_date akan otomatis diisi dengan @default(now()) dari schema
      }
    })

    const uploadId = uploadRecord.id_upload

    // 2. Siapkan data transaksi yang akan di-insert
    const transactions = cleanedData.map((row: any) => ({
      id_retailer: getRetailerId(row.retailer),
      id_product: getProductId(row.product),
      id_method: getMethodId(row.sales_method),
      id_city: getCityId(row.city),
      id_upload: uploadId,
      invoice_date: row.invoice_date ? new Date(row.invoice_date) : new Date(),
      price_per_unit: parseFloat(row.price_per_unit) || 0,
      unit_sold: parseInt(row.units_sold) || 1,
      total_sales: parseFloat(row.total_sales) || 0,
      operating_profit: parseFloat(row.operating_profit) || 0,
      operating_margin: parseFloat(row.operating_margin) || 0
    })).filter((t: any) => t.total_sales > 0)

    // 3. Insert transaksi secara massal (bulk insert)
    let successfullySaved = 0
    let failedRows = 0

    try {
      // Prisma createMany jauh lebih efisien daripada melakukan loop batch secara manual
      const result = await prisma.transaction.createMany({
        data: transactions,
        skipDuplicates: true // Opsional: mengabaikan baris yang mungkin duplikat
      })
      
      successfullySaved = result.count
      failedRows = transactions.length - successfullySaved
    } catch (insertError: any) {
      console.error('Prisma insert error:', insertError)
      failedRows = transactions.length
    }

    // 4. Update status upload_history
    await prisma.upload_history.update({
      where: { id_upload: uploadId },
      data: {
        status: failedRows > 0 && successfullySaved > 0 ? 'partial' : failedRows === transactions.length ? 'failed' : 'success',
        note: `Saved: ${successfullySaved}, Failed: ${failedRows}`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Berhasil upload ${successfullySaved} dari ${cleanedData.length} baris data`,
      data: {
        totalRows: cleanedData.length,
        validRows: successfullySaved,
        invalidRows: failedRows,
        qualityScore: successfullySaved > 0 ? 100 : 0,
        errors: []
      },
      lastUpdate: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}