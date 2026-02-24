import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==========================================
// 1. DELETE: Menghapus User Permanen
// ==========================================
export async function DELETE(
  request: Request,
  // context: { params: Promise<{ id: string }> | { id: string } }
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Mendukung Next.js lama maupun versi 15+
    const params = await context.params;
    const userId = params?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID User tidak ditemukan di URL' }, 
        { status: 400 }
      )
    }

    // Menghapus user berdasarkan ID
    await prisma.user.delete({
      where: { 
        id: userId 
      }
    })

    return NextResponse.json(
      { message: 'User berhasil dihapus secara permanen' }, 
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error saat menghapus user:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus user. Pastikan user ini tidak terikat dengan data transaksi.' }, 
      { status: 500 }
    )
  }
}

// ==========================================
// 2. PATCH: Mengubah Data Spesifik (Toggle Status)
// ==========================================
export async function PATCH(
  request: Request,
  // context: { params: Promise<{ id: string }> | { id: string } }
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Mendukung Next.js lama maupun versi 15+
    const params = await context.params;
    const userId = params?.id;
    
    // Mengambil data yang dikirim dari frontend (isActive)
    const body = await request.json()
    const { isActive } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'ID User tidak ditemukan di URL' }, 
        { status: 400 }
      )
    }

    if (isActive === undefined) {
      return NextResponse.json(
        { error: 'Data status (isActive) harus disertakan' }, 
        { status: 400 }
      )
    }

    // Memperbarui status isActive user
    const updatedUser = await prisma.user.update({
      where: { 
        id: userId 
      },
      data: { 
        isActive: isActive 
      },
      // Kita kembalikan data yang aman tanpa password
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Status user berhasil diperbarui',
        data: updatedUser
      }, 
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error saat update status user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal saat memperbarui status user.' }, 
      { status: 500 }
    )
  }
}