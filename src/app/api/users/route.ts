import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Mengambil semua user dan MENG-INCLUDE relasi tabel retailer
    const users = await prisma.user.findMany({
      include: {
        retailer: true // <- INI KUNCINYA: Memerintahkan Prisma untuk mengambil data department
      },
      orderBy: {
        createdAt: 'desc' // Urutkan dari yang terbaru
      }
    })

    // 2. Memformat data agar rapi saat diterima oleh Frontend
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      isActive: user.isActive,
      // 3. Mengambil 'retailer_name' dari relasi. Jika kosong (misal Admin), tulis 'Pusat'
      retailerName: user.retailer?.retailer_name || 'Admin' 
    }))

    return NextResponse.json({ data: formattedUsers }, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data user dari database' }, 
      { status: 500 }
    )
  }
}