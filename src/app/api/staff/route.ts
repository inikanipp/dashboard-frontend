// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import crypto from 'crypto'
// import { Prisma } from '@prisma/client'

// // GET: Mengambil daftar Staff
// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const userRole = (session.user as any).role || (session.user as any).position || 'STAFF'
//     // Catatan: Pastikan field ini ada di model User Prisma kamu nantinya
//     const userRetailerId = (session.user as any)?.retailerId 
    
//     const isManager = userRole === 'MANAGER' || userRole === 'REGIONAL_MANAGER'
//     const isSuperAdmin = userRole === 'GM' || userRole === 'ADMIN_PUSAT'

//     // Membangun filter Prisma
//     const where: any = {}

//     // Manager hanya bisa melihat Staff di retailer/restoran mereka sendiri
//     if (isManager && !isSuperAdmin && userRetailerId) {
//       where.retailerId = userRetailerId
//     }

//     const staff = await prisma.user.findMany({
//       where,
//       include: {
//         retailer: {
//       select: {
//         retailer_name: true, // Kita hanya ambil namanya saja
//       }
//     }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//     const formattedStaff = staff.map(s => ({
//       id: s.id,
//       name: s.name,
//       email: s.email,
//       position: s.position,
//       isActive: s.isActive,
//       createdAt: s.createdAt,
//       // restaurantName: (s as any).retailer?.retailer_name,
//       // restaurantCode: (s as any).retailer?.retailer_name?.substring(0, 3).toUpperCase()
//     }))

//     return NextResponse.json(formattedStaff)
//   } catch (error) {
//     console.error('Get staff error:', error)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }

// // POST: Membuat Staff Baru
// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const userRole = (session.user as any).role || (session.user as any).position
//     const isManager = userRole === 'MANAGER' || userRole === 'REGIONAL_MANAGER' || userRole === 'GM' || userRole === 'ADMIN_PUSAT'

//     if (!isManager) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
//     }

//     const body = await req.json()
//     const { name, email, password, position, retailerId } = body

//     if (!name || !email || !password) {
//       return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 })
//     }

//     const hashedPassword = crypto.createHash('md5').update(password).digest('hex')

//     const newStaff = await prisma.user.create({
//       data: {
//         id: crypto.randomUUID(),
//         name,
//         email,
//         password: hashedPassword,
//         role: 'STAFF',
//         position: position || 'STAFF',
//         isActive: true,
//         // retailerId: retailerId ? parseInt(retailerId) : null
//       }
//     })

//     return NextResponse.json(newStaff)
//   } catch (error: any) {
//     console.error('Create staff error:', error)
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
//       return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
//     }
//     return NextResponse.json({ error: 'Gagal membuat staff' }, { status: 500 })
//   }
// }

// // PUT: Update Staff atau Toggle Status Aktif
// export async function PUT(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')
//     const toggle = searchParams.get('toggle')

//     if (!id) {
//       return NextResponse.json({ error: 'Staff ID diperlukan' }, { status: 400 })
//     }

//     const userRole = (session.user as any).role || (session.user as any).position
//     const isManager = userRole === 'MANAGER' || userRole === 'REGIONAL_MANAGER' || userRole === 'GM' || userRole === 'ADMIN_PUSAT'

//     if (!isManager) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
//     }

//     if (toggle === 'true') {
//       const existingStaff = await prisma.user.findUnique({ where: { id } })
//       if (!existingStaff) {
//         return NextResponse.json({ error: 'Staff tidak ditemukan' }, { status: 404 })
//       }

//       const updated = await prisma.user.update({
//         where: { id },
//         data: { isActive: !existingStaff.isActive }
//       })

//       return NextResponse.json(updated)
//     }

//     // Update Details
//     const body = await req.json()
//     const { name, email, password, position } = body

//     const updateData: any = {}
//     if (name) updateData.name = name
//     if (email) updateData.email = email
//     if (password) {
//       updateData.password = crypto.createHash('md5').update(password).digest('hex')
//     }
//     if (position) updateData.position = position

//     const updatedStaff = await prisma.user.update({
//       where: { id },
//       data: updateData
//     })

//     return NextResponse.json(updatedStaff)
//   } catch (error: any) {
//     console.error('Update staff error:', error)
//     return NextResponse.json({ error: 'Gagal memperbarui staff' }, { status: 500 })
//   }
// }

// // DELETE: Menghapus Staff
// export async function DELETE(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json({ error: 'Staff ID diperlukan' }, { status: 400 })
//     }

//     // Proteksi: Tidak bisa menghapus diri sendiri
//     if (id === (session.user as any).id) {
//       return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
//     }

//     await prisma.user.delete({
//       where: { id }
//     })

//     return NextResponse.json({ message: 'Staff dihapus' })
//   } catch (error: any) {
//     console.error('Delete staff error:', error)
//     return NextResponse.json({ error: 'Gagal menghapus staff' }, { status: 500 })
//   }
// }