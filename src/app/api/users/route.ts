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

    const userRole = (session.user as any)?.role || (session.user as any)?.position || 'STAFF'
    const isGM = userRole === 'GM' || userRole === 'GENERAL_MANAGER'

    // Pastikan hanya GM yang bisa melihat data ini
    if (!isGM) {
      return NextResponse.json({ error: 'Forbidden - Akses hanya untuk GM' }, { status: 403 })
    }

    // Mengambil data user selain role GM menggunakan Prisma
    // Bagian relasi 'retailer' dihilangkan agar tidak memicu error 'never'
    const users = await prisma.user.findMany({
      where: {
        role: {
          notIn: ['GM', 'GENERAL_MANAGER']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Memformat data agar mudah dibaca oleh frontend
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      isActive: user.isActive,
      retailerName: 'Pusat / Belum Set' // Fallback karena relasi database belum ada
    }))

    return NextResponse.json({ success: true, data: formattedUsers })
  } catch (error: any) {
    console.error('Fetch users error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 })
  }
}