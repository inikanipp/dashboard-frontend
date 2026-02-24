import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Sesuaikan import prisma Anda
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, newPassword } = body

    if (!email || !name || !newPassword) {
      return NextResponse.json({ error: "Email, Nama, dan Password Baru harus diisi" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    // 1. Cari user di database berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    // 2. Validasi: Apakah user ditemukan DAN namanya cocok persis
    if (!user || user.name !== name) {
      return NextResponse.json({ error: "Data tidak cocok. Pastikan Email dan Nama Lengkap sesuai dengan akun yang terdaftar." }, { status: 404 })
    }

    // 3. KUNCI PERBAIKAN: Hash password baru menggunakan MD5 (Sama seperti Register & Login)
    const hashedPassword = crypto.createHash('md5').update(newPassword).digest('hex')

    // 4. Update password user di database
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true, message: "Password berhasil direset." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server saat menyimpan password." }, { status: 500 })
  }
}