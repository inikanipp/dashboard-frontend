import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Untuk sementara kita kembalikan array kosong agar frontend tidak error
    return NextResponse.json({
      success: true,
      notifications: [],
      unreadCount: 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat notifikasi' }, { status: 500 })
  }
}