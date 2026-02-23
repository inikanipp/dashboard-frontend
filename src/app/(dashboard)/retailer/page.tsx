'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Store, Users, ShieldAlert } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  position: string
  isActive: boolean
  retailerName: string
}

export default function RetailerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const isGM = userRole === 'GM' || userRole === 'GENERAL_MANAGER'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Sesuai Sidebar, hanya GM yang bisa mengakses halaman ini
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

  // Fitur pencarian pintar
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Memuat data staf...</p>
        </div>
      </div>
    )
  }

  if (!isGM) return null

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            Data Staf & Retailer
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Pantau semua staf dan manajer yang terdaftar di sistem.
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              {/* Diperbaiki: Penambahan React.ChangeEvent agar Typescript tidak error */}
              <input
                type="text"
                placeholder="Cari nama, email, atau role staf..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
              <Users className="w-4 h-4" />
              Total: {filteredUsers.length} Staf
            </div>
          </div>
        </div>
        
        <div className="p-0">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-500 font-medium text-center">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Users className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-center">
                {searchTerm ? 'Tidak ada staf yang sesuai dengan pencarian.' : 'Belum ada data staf.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Nama Staf</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Kontak</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Posisi / Role</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Lokasi Retailer</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium text-slate-700">{user.position}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-semibold">
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {user.retailerName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Diperbaiki: Menggunakan HTML Badge biasa, menghindari missing module ui/badge */}
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}