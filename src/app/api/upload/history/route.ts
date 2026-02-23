import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Mengambil data menggunakan Prisma
    const logs = await prisma.upload_history.findMany({
      orderBy: {
        uploaded_date: 'desc', // Mengurutkan dari yang terbaru
      },
      take: 50, // Batasan maksimal 50 data
    })

    // Format log untuk ditampilkan di frontend
    const formattedLogs = logs.map((log) => ({
      id: log.id_upload,
      fileName: log.file_name,
      systemName: log.system_name,
      status: log.status,
      note: log.note,
      totalRows: log.total_rows,
      uploadedBy: log.uploaded_by,
      uploadedDate: log.uploaded_date,
      formattedDate: new Date(log.uploaded_date).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
    })
  } catch (error: any) {
    console.error('Upload history error:', error)
    
    // Fallback jika terjadi error (misalnya tabel belum ada)
    return NextResponse.json({
      success: true,
      logs: [],
      message: error.message || 'No upload history available',
    })
  }
}