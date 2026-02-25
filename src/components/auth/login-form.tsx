'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react' // getSession ditambahkan di sini
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LogoArtavista from '../../../public/logo-artavista.png'
import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff, X } from 'lucide-react'

// Data Retailer yang di-hardcode
const RETAILERS = [
  { id: 1, name: 'Department A' },
  { id: 2, name: 'Department B' },
  { id: 3, name: 'Department C' },
  { id: 4, name: 'Department D' },
  { id: 5, name: 'Department E' },
  { id: 6, name: 'Department F' }
]

export function LoginForm() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  
  // State untuk form utama
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [selectedRetailer, setSelectedRetailer] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // State khusus untuk Pop-up Lupa Password
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetName, setResetName] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  // Membersihkan tulisan ?callbackUrl=... dari address bar browser secara instan
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('callbackUrl')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // ==========================================
    // LOGIKA LOGIN (CEPAT / TANPA DELAY)
    // ==========================================
    if (isLogin) {
      try {
        const result = await signIn('credentials', { email, password, redirect: false })
        
        if (result?.error) {
          setError("Email dan password salah.")
          setIsLoading(false)
        } else {
          setSuccess("Login berhasil! Mengalihkan...")
          
          // Proses validasi Role instan tanpa setTimeout
          const sessionObj = await getSession()
          const userRole = sessionObj?.user?.role || (sessionObj?.user as any)?.position
          const managerRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT']
          
          router.push(managerRoles.includes(userRole) ? '/' : '/upload')
          router.refresh()
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi')
        setIsLoading(false)
      }
    } 
    // ==========================================
    // LOGIKA REGISTER (CEPAT / TANPA DELAY)
    // ==========================================
    else {
      if (!selectedRetailer) {
        setError('Silakan pilih Department terlebih dahulu.')
        setIsLoading(false)
        return
      }
      try {
        const registerData = { name, email, password, position: 'STAFF', retailerId: selectedRetailer }
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData)
        })
        const data = await res.json()
        
        if (!res.ok) {
          setError(data.error || 'Registrasi gagal')
          setIsLoading(false)
        } else {
          setSuccess('Registrasi berhasil! Mengalihkan...')
          const loginResult = await signIn('credentials', { email, password, redirect: false })
          
          if (loginResult?.error) {
            setError("Registrasi berhasil! Silakan login secara manual.")
            setIsLogin(true)
            setIsLoading(false)
          } else {
            // Langsung diarahkan tanpa setTimeout
            router.push('/upload')
            router.refresh()
          }
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi.')
        setIsLoading(false)
      }
    }
  }

  // Fungsi Submit untuk Pop-up Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess('')
    setIsResetting(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, name: resetName, newPassword: resetPassword })
      })
      const data = await res.json()

      if (!res.ok) {
        setResetError(data.error || 'Gagal mereset password. Pastikan Email dan Nama sesuai.')
      } else {
        setResetSuccess('Password berhasil diubah! Silakan login.')
        setTimeout(() => {
          setShowResetModal(false) 
          setResetEmail('')
          setResetName('')
          setResetPassword('')
          setResetSuccess('')
          setEmail(resetEmail) 
        }, 1500) // Untuk pop-up reset, kita tetap butuh jeda agar user tahu proses berhasil sebelum popup tertutup otomatis
      }
    } catch (err) {
      setResetError('Terjadi kesalahan koneksi.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F7FF] font-sans text-slate-900 flex items-center justify-center p-4">
        
      {/* Container utama form */}
      <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white rounded-[24px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] p-2 md:h-[680px] relative z-10">
        
        {/* PANEL KIRI (Gradient Visual) */}
        <div 
          className="hidden md:flex flex-col w-[45%] relative rounded-[20px] overflow-hidden p-8 justify-between h-full"
          style={{ background: 'linear-gradient(135deg, #054CC7 0%, #17C3CC 100%)' }}
        >
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-[80px] opacity-20"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-black rounded-full mix-blend-overlay filter blur-[80px] opacity-20"></div>
          
          <div className="relative z-10 mt-4">
            <img src={LogoArtavista.src} alt="Logo" className="w-48 h-auto drop-shadow-md brightness-0 invert" />
          </div>

          <div className="relative z-10 text-white pb-4">
            <p className="text-[10px] font-bold mb-1.5 opacity-80 tracking-widest uppercase">Sales Monitoring Dashboard</p>
            <h2 className="text-2xl font-bold leading-[1.2] tracking-tight">Akses pusat data personal Anda untuk kejelasan.</h2>
          </div>
        </div>

        {/* PANEL KANAN (Formulir Login / Register) */}
        <div className="w-full md:w-[55%] flex flex-col justify-center h-full py-8 md:py-0">
          <div className="max-w-[380px] w-full mx-auto px-4 sm:px-6 md:px-2">
            
            <div className="md:hidden flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-gradient-to-br from-[#054CC7] to-[#17C3CC] rounded-xl flex items-center justify-center shadow-md shrink-0">
                <img src={LogoArtavista.src} alt="Logo" className="w-6 h-auto brightness-0 invert object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">Artavista</h2>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Dashboard</p>
              </div>
            </div>

            <div className="mb-4 mt-2">
              <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight mb-1">
                {isLogin ? 'Masuk ke akun' : 'Buat akun baru'}
              </h1>
              <p className="text-[13px] text-slate-500 leading-snug">
                {isLogin 
                  ? 'Akses data penjualan dan insight Anda dalam satu tempat.' 
                  : 'Daftarkan diri Anda untuk memantau penjualan dengan mudah.'}
              </p>
            </div>

            {/* AREA NOTIFIKASI ERROR / SUCCESS */}
            <div className="min-h-[28px] mb-4 flex flex-col justify-end">
              {error && (
                <div className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-xl animate-in fade-in zoom-in duration-300">
                  <CheckCircle size={14} className="shrink-0" /> {success}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Nama lengkap</label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama Anda"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 md:h-12 px-4 bg-white border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 focus-visible:ring-[#054CC7]/30 placeholder:text-slate-400 placeholder:font-normal"
                      suppressHydrationWarning
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Department</label>
                    <div className="relative">
                      <select
                        required={!isLogin}
                        value={selectedRetailer}
                        onChange={(e) => setSelectedRetailer(e.target.value)}
                        className={`w-full h-11 md:h-12 px-4 bg-white border border-slate-200 rounded-2xl text-[14px] appearance-none outline-none focus:ring-2 focus:ring-[#054CC7]/30 ${!selectedRetailer ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'}`}
                        suppressHydrationWarning
                      >
                        <option value="" disabled>Pilih Department</option>
                        {RETAILERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Email Anda</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 md:h-12 px-4 bg-white border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 focus-visible:ring-[#054CC7]/30 placeholder:text-slate-400 placeholder:font-normal"
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-700">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowResetModal(true);
                        setResetError('');
                        setResetSuccess('');
                        setResetEmail(email); 
                      }}
                      className="text-[11px] font-bold text-[#054CC7] hover:text-[#043d9e] hover:underline"
                      suppressHydrationWarning
                    >
                      Lupa password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 md:h-12 pl-4 pr-11 bg-white border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 focus-visible:ring-[#054CC7]/30 tracking-widest placeholder:text-slate-400 placeholder:tracking-widest"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    suppressHydrationWarning
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#054CC7] hover:bg-[#043d9e] text-white text-[14px] font-bold rounded-full shadow-lg shadow-[#054CC7]/20 transition-all active:scale-[0.98]"
                  suppressHydrationWarning
                >
                  {isLoading ? <Loader2 className="animate-spin size-5" /> : (isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang')}
                </Button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-slate-400 font-bold tracking-widest">Atau</span></div>
            </div>

            <div className="text-center pb-2">
              <span className="text-[12px] text-slate-500">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}</span>
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                className="ml-1.5 text-[12px] font-bold text-[#054CC7] hover:text-[#043d9e]"
                suppressHydrationWarning
              >
                {isLogin ? 'Buat akun' : 'Masuk di sini'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL / POP-UP LUPA PASSWORD */}
      {/* ======================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Lupa Password</h3>
              <button 
                onClick={() => setShowResetModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Form Reset) */}
            <div className="p-6">
              <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
                Silakan masukkan Email dan Nama Lengkap yang terdaftar untuk membuat password baru.
              </p>

              {/* AREA NOTIFIKASI MODAL */}
              <div className="min-h-[28px] mb-4 flex flex-col justify-end">
                {resetError && (
                  <div className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle size={14} className="shrink-0" /> {resetError}
                  </div>
                )}
                {resetSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-xl">
                    <CheckCircle size={14} className="shrink-0" /> {resetSuccess}
                  </div>
                )}
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Email Anda</label>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border-slate-200 rounded-xl text-[14px] font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Nama Lengkap</label>
                  <Input
                    type="text"
                    placeholder="Sesuai yang terdaftar"
                    required
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border-slate-200 rounded-xl text-[14px] font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Password Baru</label>
                  <div className="relative">
                    <Input
                      type={showResetPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      required
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className="h-11 pl-4 pr-11 bg-slate-50 border-slate-200 rounded-xl text-[14px] font-medium tracking-widest placeholder:tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isResetting}
                  className="w-full h-11 mt-2 bg-[#054CC7] hover:bg-[#043d9e] text-white text-[14px] font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  {isResetting ? <Loader2 className="animate-spin size-5" /> : 'Simpan Password Baru'}
                </Button>
              </form>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}