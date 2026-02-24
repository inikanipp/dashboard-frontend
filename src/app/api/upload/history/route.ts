// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET(req: NextRequest) {
//   try {
//     // Mengambil data menggunakan Prisma
//     const logs = await prisma.upload_history.findMany({
//       orderBy: {
//         uploaded_date: 'desc', // Mengurutkan dari yang terbaru
//       },
//       take: 50, // Batasan maksimal 50 data
//     })

//     // Format log untuk ditampilkan di frontend
//     const formattedLogs = logs.map((log) => ({
//       id: log.id_upload,
//       fileName: log.file_name,
//       systemName: log.system_name,
//       status: log.status,
//       note: log.note,
//       totalRows: log.total_rows,
//       uploadedBy: log.uploaded_by,
//       uploadedDate: log.uploaded_date,
//       formattedDate: new Date(log.uploaded_date).toLocaleString('id-ID', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//     }))

//     return NextResponse.json({
//       success: true,
//       logs: formattedLogs,
//     })
//   } catch (error: any) {
//     console.error('Upload history error:', error)
    
//     // Fallback jika terjadi error (misalnya tabel belum ada)
//     return NextResponse.json({
//       success: true,
//       logs: [],
//       message: error.message || 'No upload history available',
//     })
//   }
// }

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fungsi GET untuk mengambil data (yang tadi sudah kita buat)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const retailerId = searchParams.get('retailerId')

    let whereClause: any = {}

    if (retailerId) {
      const departmentStaffs = await prisma.user.findMany({
        where: { retailerId: parseInt(retailerId) },
        select: { name: true }
      })
      
      const staffNames = departmentStaffs.map(staff => staff.name)

      if (staffNames.length > 0) {
        whereClause = {
          uploaded_by: {
            in: staffNames
          }
        }
      } else {
        whereClause = { uploaded_by: 'NOT_FOUND' }
      }
    }

    const logs = await prisma.upload_history.findMany({
      where: whereClause,
      orderBy: { uploaded_date: 'desc' },
      take: 50 
    })

    return NextResponse.json({ success: true, logs: logs })
  } catch (error) {
    console.error("Error fetching upload history:", error)
    return NextResponse.json(
      { success: false, error: "Gagal mengambil riwayat upload" }, 
      { status: 500 }
    )
  }
}

// FUNGSI BARU: Fungsi POST untuk menyimpan riwayat baru ke database
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { file_name, system_name, status, total_rows, uploaded_by, note } = body

    const newLog = await prisma.upload_history.create({
      data: {
        file_name,
        system_name,
        status,
        total_rows,
        uploaded_by,
        note
      }
    })

    return NextResponse.json({ success: true, log: newLog })
  } catch (error) {
    console.error("Error creating upload log:", error)
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan log" }, 
      { status: 500 }
    )
  }
}