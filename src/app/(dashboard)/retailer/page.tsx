// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Search, Loader2, Store, Users, ShieldAlert } from 'lucide-react'

// interface UserData {
//   id: string
//   name: string
//   email: string
//   role: string
//   position: string
//   isActive: boolean
//   retailerName: string
// }

// export default function RetailerPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [users, setUsers] = useState<UserData[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')

//   const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
//   const isGM = userRole === 'GM' || userRole === 'GENERAL_MANAGER'

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login')
//     } else if (status === 'authenticated') {
//       // Sesuai Sidebar, hanya GM yang bisa mengakses halaman ini
//       if (!isGM) {
//         router.push('/')
//       } else {
//         fetchUsers()
//       }
//     }
//   }, [status, isGM, router])

//   const fetchUsers = async () => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const res = await fetch('/api/users')
//       if (!res.ok) {
//         throw new Error('Gagal memuat data user')
//       }
      
//       const json = await res.json()
//       if (json.error) throw new Error(json.error)
      
//       setUsers(json.data || [])
//     } catch (err: any) {
//       console.error(err)
//       setError(err.message || 'Terjadi kesalahan saat memuat data')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Fitur pencarian pintar
//   const filteredUsers = users.filter(user => 
//     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.role.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   if (status === 'loading' || isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
//           <p className="text-slate-500 font-medium">Memuat data staf...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!isGM) return null

//   return (
//     <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
//       {/* Header Halaman */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
//               <Store className="w-5 h-5 text-blue-600" />
//             </div>
//             Data Staf & Department
//           </h1>
//           <p className="text-slate-500 mt-2 text-sm md:text-base">
//             Pantau semua staf dan department yang terdaftar di sistem.
//           </p>
//         </div>
//       </div>

//       {/* Konten Utama (Card) */}
//       <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        
//         {/* Header Card (Search & Counter) */}
//         <div className="border-b border-slate-100 p-4 md:p-6">
//           <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
//             <div className="relative w-full md:max-w-md">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Cari nama, email, atau role staf..."
//                 value={searchTerm}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
//                 className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
//               />
//             </div>
//             <div className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100 shrink-0">
//               <Users className="w-4 h-4" />
//               Total: {filteredUsers.length} Staf
//             </div>
//           </div>
//         </div>
        
//         {/* Body Card (Table Area) dengan Padding agar ada margin di dalam card */}
//         <div className="p-4 md:p-6">
//           {error ? (
//             <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200">
//               <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
//               <p className="text-red-500 font-medium text-center">{error}</p>
//             </div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200">
//               <Users className="w-12 h-12 text-slate-300 mb-4" />
//               <p className="text-slate-500 font-medium text-center">
//                 {searchTerm ? 'Tidak ada staf yang sesuai dengan pencarian.' : 'Belum ada data staf.'}
//               </p>
//             </div>
//           ) : (
//             /* Wrapper Table dengan border dan radius agar terlihat seperti tabel di dalam box */
//             <div className="overflow-x-auto border border-slate-200 rounded-xl custom-scrollbar">
//               <table className="w-full text-sm text-left min-w-[700px]">
//                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
//                   <tr>
//                     <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Nama Staf</th>
//                     <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Kontak</th>
//                     <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Posisi / Role</th>
//                     <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Lokasi Retailer</th>
//                     <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 bg-white">
//                   {filteredUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="font-semibold text-slate-800 whitespace-nowrap">{user.name}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-slate-500 whitespace-nowrap">{user.email}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col items-start gap-1 whitespace-nowrap">
//                           <span className="font-medium text-slate-700">{user.position}</span>
//                           <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold tracking-wide border border-slate-200">
//                             {user.role}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
//                           {user.retailerName}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         {user.isActive ? (
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-100 text-emerald-700 whitespace-nowrap">
//                             Aktif
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-slate-100 text-slate-600 whitespace-nowrap">
//                             Nonaktif
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Store, Users, ShieldAlert, Trash2, Power, PowerOff } from 'lucide-react'

// Menambahkan field retailerId untuk kemudahan jika diperlukan
interface UserData {
  id: string
  name: string
  email: string
  role: string
  position: string
  isActive: boolean
  retailerName: string // Ini yang akan kita tampilkan sebagai Department
}

export default function DepartmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State untuk melacak proses loading spesifik saat menghapus/mengubah status
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const isGM = userRole === 'GM' || userRole === 'GENERAL_MANAGER'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!isGM) {
        router.push('/')
      } else {
        fetchUsers()
      }
    }
  }, [status, isGM, router])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users')
      if (!res.ok) {
        throw new Error('Gagal memuat data user')
      }
      
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      
      setUsers(json.data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  // Aksi 1: Menghapus User
  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus staf ${userName} secara permanen?`)
    if (!confirmDelete) return

    setActionLoadingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Gagal menghapus user')
      }

      // Update state lokal tanpa perlu fetch ulang
      setUsers(users.filter(user => user.id !== userId))
      alert('User berhasil dihapus.')
    } catch (err: any) {
      console.error('Delete error:', err)
      alert(err.message || 'Terjadi kesalahan saat menghapus user.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Aksi 2: Toggle Status (Aktif/Nonaktif) User
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoadingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Gagal mengubah status user')
      }

      // Update state lokal
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ))
    } catch (err: any) {
      console.error('Toggle status error:', err)
      alert(err.message || 'Terjadi kesalahan saat mengubah status user.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Fitur pencarian
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.retailerName && user.retailerName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#054CC7]" />
          <p className="text-slate-500 font-medium">Memuat data staf...</p>
        </div>
      </div>
    )
  }

  if (!isGM) return null

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#054CC7]/10 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-[#054CC7]" />
            </div>
            Data Staf & Department
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Pantau semua staf dan department yang terdaftar di sistem.
          </p>
        </div>
      </div>

      {/* Konten Utama (Card) */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        
        {/* Header Card (Search & Counter) */}
        <div className="border-b border-slate-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, email, role, atau department..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#054CC7]/30 focus:border-[#054CC7] transition-colors"
              />
            </div>
            <div className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 bg-[#054CC7]/10 text-[#054CC7] rounded-lg text-sm font-semibold border border-[#054CC7]/20 shrink-0">
              <Users className="w-4 h-4" />
              Total: {filteredUsers.length} Staf
            </div>
          </div>
        </div>
        
        {/* Body Card */}
        <div className="p-4 md:p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200">
              <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-500 font-medium text-center">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-center">
                {searchTerm ? 'Tidak ada staf yang sesuai dengan pencarian.' : 'Belum ada data staf.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Nama Staf</th>
                    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Kontak</th>
                    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Posisi / Role</th>
                    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Department</th>
                    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 font-bold tracking-wider whitespace-nowrap text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map((user) => {
                    const isProcessing = actionLoadingId === user.id;
                    
                    return (
                      <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800 whitespace-nowrap">{user.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-500 whitespace-nowrap">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                            <span className="font-medium text-slate-700">{user.position}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold tracking-wide border border-slate-200">
                              {user.role}
                            </span>
                          </div>
                        </td>
                        {/* Kolom Department */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#054CC7]/10 text-[#054CC7] border border-[#054CC7]/20 whitespace-nowrap">
                            {user.retailerName || 'Belum Set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-100 text-emerald-700 whitespace-nowrap">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-slate-100 text-slate-600 whitespace-nowrap">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        {/* Kolom Aksi */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              disabled={isProcessing || (session?.user as any)?.email === user.email}
                              title={user.isActive ? "Nonaktifkan User" : "Aktifkan User"}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive 
                                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                                  : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                user.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />
                              }
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={isProcessing || (session?.user as any)?.email === user.email}
                              title="Hapus User"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}