// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import crypto from 'crypto'
// import { Prisma } from '@prisma/client'

// export async function POST(request: Request) {
//   try {
//     const body = await request.json()
//     // 1. Tambahkan retailerId ke destructuring
//     const { name, email, password, position, retailerId } = body

//     if (!name || !email || !password) {
//       return NextResponse.json(
//         { error: 'Nama, email, dan password wajib diisi' },
//         { status: 400 }
//       )
//     }

//     const validPositions = ['MANAGER', 'REGIONAL_MANAGER', 'STAFF']
//     const userPosition = validPositions.includes(position) ? position : 'STAFF'
//     const userRole = (position === 'MANAGER' || position === 'REGIONAL_MANAGER') 
//       ? 'REGIONAL_MANAGER' 
//       : 'STAFF'

//     const hashedPassword = crypto.createHash('md5').update(password).digest('hex')

//     // 2. Simpan ke database dengan retailerId
//     const user = await prisma.user.create({
//       data: {
//         id: crypto.randomUUID(),
//         name,
//         email,
//         password: hashedPassword,
//         role: userRole,
//         position: userPosition,
//         isActive: true,
//         // Konversi ke Number agar sesuai tipe data Integer di DB
//         retailerId: retailerId ? Number(retailerId) : null, 
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         retailerId: true,
//       }
//     })

//     return NextResponse.json({
//       message: 'Registrasi berhasil',
//       user: user
//     })

//   } catch (error: any) {
//     console.error('Register error:', error)
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === 'P2002') {
//         return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
//       }
//     }
//     return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
//   }
// }

// app/api/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Kita tangkap retailerId dari form pendaftaran
    const { name, email, password, position, retailerId } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    // Cek apakah email sudah dipakai
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Hash password menggunakan MD5 (menyesuaikan dengan authOptions Anda)
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')

    // PENTING: Ubah retailerId dari String (dari form HTML) menjadi Integer
    const parsedRetailerId = retailerId ? parseInt(retailerId, 10) : null

    // Buat User Baru di Database
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(), // Buat ID unik karena di schema String @id
        name,
        email: normalizedEmail,
        password: hashedPassword,
        position: position || 'STAFF',
        role: 'STAFF',
        retailerId: parsedRetailerId, // Masukkan ID Retailer berupa angka (Int)
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email } 
    }, { status: 201 })

  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}