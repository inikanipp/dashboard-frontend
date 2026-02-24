// 'use client'

// import { useState } from 'react'
// import { signIn } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import LogoArtavista from '../../../public/logo-artavista.png'
// import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

// // Data Retailer yang di-hardcode
// const RETAILERS = [
//   { id: 1, name: 'Department A' },
//   { id: 2, name: 'Department B' },
//   { id: 3, name: 'Department C' },
//   { id: 4, name: 'Department D' },
//   { id: 5, name: 'Department E' },
//   { id: 6, name: 'Department F' }
// ]

// export function LoginForm() {
//   const router = useRouter()
//   const [isLogin, setIsLogin] = useState(true)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [name, setName] = useState('')
//   const [selectedRetailer, setSelectedRetailer] = useState('')
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     // Reset pesan error dan success setiap kali tombol ditekan
//     setError('')
//     setSuccess('')
//     setIsLoading(true)

//     if (isLogin) {
//       try {
//         const result = await signIn('credentials', { email, password, redirect: false })
        
//         if (result?.error) {
//           // JIKA SANDI / EMAIL SALAH
//           setError("Email dan password salah.")
//           setIsLoading(false)
//         } else {
//           // JIKA SANDI BENAR
//           setSuccess("Login berhasil! Mengalihkan ke dashboard...")
          
//           // Beri jeda 1.5 detik (1500ms) agar pesan sukses sempat terbaca sebelum pindah halaman
//           setTimeout(async () => {
//             const sessionRes = await fetch('/api/auth/session')
//             const session = await sessionRes.json()
//             const userRole = session?.user?.role || session?.user?.position
//             const managerRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT']
            
//             router.push(managerRoles.includes(userRole) ? '/' : '/upload')
//             router.refresh()
//           }, 1500) 
//         }
//       } catch (err) {
//         setError('Terjadi kesalahan koneksi')
//         setIsLoading(false)
//       }
//     } else {
//       // LOGIKA REGISTER
//       if (!selectedRetailer) {
//         setError('Silakan pilih Department terlebih dahulu.')
//         setIsLoading(false)
//         return
//       }
//       try {
//         const registerData = { name, email, password, position: 'STAFF', retailerId: selectedRetailer }
//         const res = await fetch('/api/register', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(registerData)
//         })
//         const data = await res.json()
        
//         if (!res.ok) {
//           setError(data.error || 'Registrasi gagal')
//         } else {
//           setSuccess('Registrasi berhasil! Mengalihkan...')
//           const loginResult = await signIn('credentials', { email, password, redirect: false })
//           if (loginResult?.error) {
//             setError("Registrasi berhasil! Silakan login secara manual.")
//             setIsLogin(true)
//           } else {
//             setTimeout(() => {
//               router.push('/upload')
//               router.refresh()
//             }, 1500) // Beri jeda juga di register agar pesan terbaca
//           }
//         }
//       } catch (err) {
//         setError('Terjadi kesalahan koneksi.')
//       } finally {
//         setIsLoading(false)
//       }
//     }
//   }

//   return (
//     <div className="fixed inset-0 overflow-y-auto bg-[#F4F7FF] font-sans text-slate-900">
//       <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        
//         <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white rounded-[24px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] p-2 md:h-[600px] relative z-10">
          
//           <div className="hidden md:flex flex-col w-[45%] relative rounded-[20px] overflow-hidden p-8 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 justify-between h-full">
//             <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
//             <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            
//             <div className="relative z-10">
//               <img src={LogoArtavista.src} alt="Logo" className="w-32 h-auto drop-shadow-lg brightness-0 invert" />
//             </div>

//             <div className="relative z-10 mt-auto text-white">
//               <p className="text-[10px] font-bold mb-1.5 opacity-80 tracking-widest uppercase">Sales Monitoring Dashboard</p>
//               <h2 className="text-2xl font-bold leading-[1.2] tracking-tight">Akses pusat data personal Anda untuk kejelasan.</h2>
//             </div>
//           </div>

//           <div className="w-full md:w-[55%] flex flex-col justify-center bg-white rounded-[20px] py-6 md:py-0">
//             <div className="max-w-[380px] w-full mx-auto px-4 sm:px-6 md:px-6 py-2">
              
//               <div className="md:hidden flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
//                   <img src={LogoArtavista.src} alt="Logo" className="w-6 h-auto brightness-0 invert object-contain" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">Artavista</h2>
//                   <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Dashboard</p>
//                 </div>
//               </div>

//               <div className="mb-2">
//                 <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
//                   {isLogin ? 'Masuk ke akun' : 'Buat akun baru'}
//                 </h1>
//                 <p className="text-[12px] text-slate-500 leading-snug">
//                   {isLogin 
//                     ? 'Akses data penjualan dan insight Anda dalam satu tempat.' 
//                     : 'Daftarkan diri Anda untuk memantau penjualan dengan mudah.'}
//                 </p>
//               </div>

//               {/* AREA NOTIFIKASI ERROR / SUCCESS */}
//               <div className="min-h-[28px] mb-1.5 flex flex-col justify-end">
//                 {error && (
//                   <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg animate-in fade-in zoom-in duration-300">
//                     <AlertCircle size={14} className="shrink-0" /> {error}
//                   </div>
//                 )}
//                 {success && (
//                   <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg animate-in fade-in zoom-in duration-300">
//                     <CheckCircle size={14} className="shrink-0" /> {success}
//                   </div>
//                 )}
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-2.5" suppressHydrationWarning>
//                 {!isLogin && (
//                   <>
//                     <div className="space-y-1">
//                       <label className="text-[11px] font-bold text-slate-700">Nama lengkap</label>
//                       <Input
//                         type="text"
//                         placeholder="Masukkan nama Anda"
//                         required={!isLogin}
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         className="h-10 md:h-9 px-3 bg-white border-slate-200 rounded-lg text-[13px]"
//                         suppressHydrationWarning
//                       />
//                     </div>

//                     <div className="space-y-1">
//                       <label className="text-[11px] font-bold text-slate-700">Department</label>
//                       <div className="relative">
//                         <select
//                           required={!isLogin}
//                           value={selectedRetailer}
//                           onChange={(e) => setSelectedRetailer(e.target.value)}
//                           className="w-full h-10 md:h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] appearance-none outline-none focus:ring-2 focus:ring-blue-500/20"
//                           suppressHydrationWarning
//                         >
//                           <option value="" disabled>Pilih Department</option>
//                           {RETAILERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
//                         </select>
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <div className="space-y-1">
//                   <label className="text-[11px] font-bold text-slate-700">Email Anda</label>
//                   <Input
//                     type="email"
//                     placeholder="nama@email.com"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="h-10 md:h-9 px-3 border-slate-200 rounded-lg text-[13px]"
//                     suppressHydrationWarning
//                   />
//                 </div>

//                 <div className="space-y-1">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[11px] font-bold text-slate-700">Password</label>
//                     {isLogin && (
//                       <button 
//                         type="button" 
//                         className="text-[10px] font-semibold text-blue-600 hover:underline"
//                         suppressHydrationWarning
//                       >
//                         Lupa password?
//                       </button>
//                     )}
//                   </div>
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••••"
//                       required
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="h-10 md:h-9 pl-3 pr-10 border-slate-200 rounded-lg text-[13px]"
//                       suppressHydrationWarning
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       suppressHydrationWarning
//                     >
//                       {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="pt-2">
//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full h-11 md:h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
//                     suppressHydrationWarning
//                   >
//                     {isLoading ? <Loader2 className="animate-spin size-4" /> : (isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang')}
//                   </Button>
//                 </div>
//               </form>

//               <div className="relative my-4 md:my-3">
//                 <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
//                 <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Atau</span></div>
//               </div>

//               <div className="text-center pb-2">
//                 <span className="text-[11px] text-slate-500">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}</span>
//                 <button 
//                   type="button"
//                   onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
//                   className="ml-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
//                   suppressHydrationWarning
//                 >
//                   {isLogin ? 'Buat akun' : 'Masuk di sini'}
//                 </button>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LogoArtavista from '../../../public/logo-artavista.png'
import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [selectedRetailer, setSelectedRetailer] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Reset pesan error dan success setiap kali tombol ditekan
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (isLogin) {
      try {
        const result = await signIn('credentials', { email, password, redirect: false })
        
        if (result?.error) {
          // JIKA SANDI / EMAIL SALAH
          setError("Email dan password salah.")
          setIsLoading(false)
        } else {
          // JIKA SANDI BENAR
          setSuccess("Login berhasil! Mengalihkan ke dashboard...")
          
          // Beri jeda 1.5 detik (1500ms) agar pesan sukses sempat terbaca sebelum pindah halaman
          setTimeout(async () => {
            const sessionRes = await fetch('/api/auth/session')
            const session = await sessionRes.json()
            const userRole = session?.user?.role || session?.user?.position
            const managerRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT']
            
            router.push(managerRoles.includes(userRole) ? '/' : '/upload')
            router.refresh()
          }, 1500) 
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi')
        setIsLoading(false)
      }
    } else {
      // LOGIKA REGISTER
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
        } else {
          setSuccess('Registrasi berhasil! Mengalihkan...')
          const loginResult = await signIn('credentials', { email, password, redirect: false })
          if (loginResult?.error) {
            setError("Registrasi berhasil! Silakan login secara manual.")
            setIsLogin(true)
          } else {
            setTimeout(() => {
              router.push('/upload')
              router.refresh()
            }, 1500) // Beri jeda juga di register agar pesan terbaca
          }
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#F4F7FF] font-sans text-slate-900">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        
        <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white rounded-[24px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] p-2 md:h-[600px] relative z-10">
          
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

            <div className="relative z-10 mt-auto text-white">
              <p className="text-[10px] font-bold mb-1.5 opacity-80 tracking-widest uppercase">Sales Monitoring Dashboard</p>
              <h2 className="text-2xl font-bold leading-[1.2] tracking-tight">Akses pusat data personal Anda untuk kejelasan.</h2>
            </div>
          </div>

          {/* PANEL KANAN (Formulir) */}
          <div className="w-full md:w-[55%] flex flex-col justify-center bg-white rounded-[20px] py-6 md:py-0">
            <div className="max-w-[380px] w-full mx-auto px-4 sm:px-6 md:px-6 py-2">
              
              <div className="md:hidden flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 bg-gradient-to-br from-[#054CC7] to-[#17C3CC] rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <img src={LogoArtavista.src} alt="Logo" className="w-6 h-auto brightness-0 invert object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">Artavista</h2>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Dashboard</p>
                </div>
              </div>

              <div className="mb-4">
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
              <div className="min-h-[28px] mb-3 flex flex-col justify-end">
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
                        // Tambahan placeholder:text-slate-400
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
                    // Tambahan placeholder:text-slate-400
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
                      // Tambahan placeholder:text-slate-400 dan tracking agar ketikan asli berjarak lebar
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
      </div>
    </div>
  )
}