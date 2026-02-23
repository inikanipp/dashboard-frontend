


// 'use client'

// import { useState } from 'react'
// import { signIn } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import LogoArtavista from '../../../public/logo-artavista.png'
// import { AlertCircle, Loader2, Lock, User, Mail, CheckCircle, Eye, EyeOff, Store } from 'lucide-react'

// // Data Retailer yang di-hardcode sesuai database Anda
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
  
//   // State untuk menyimpan ID retailer yang dipilih
//   const [selectedRetailer, setSelectedRetailer] = useState('')

//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     setIsLoading(true)

//     if (isLogin) {
//       try {
//         const result = await signIn('credentials', {
//           email,
//           password,
//           redirect: false
//         })

//         if (result?.error) {
//           setError("Email atau password salah.")
//         } else {
//           setTimeout(async () => {
//             const sessionRes = await fetch('/api/auth/session')
//             const session = await sessionRes.json()
//             const userRole = session?.user?.role || session?.user?.position
            
//             const managerRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT']
//             if (managerRoles.includes(userRole)) {
//               router.push('/')
//             } else {
//               router.push('/upload')
//             }
//             router.refresh()
//           }, 100)
//         }
//       } catch (err) {
//         setError('Terjadi kesalahan koneksi')
//       } finally {
//         setIsLoading(false)
//       }
//     } else {
//       // Validasi: Pastikan retailer dipilih saat daftar
//       if (!selectedRetailer) {
//         setError('Silakan pilih Retailer terlebih dahulu.')
//         setIsLoading(false)
//         return
//       }

//       try {
//         const registerData = { 
//           name, 
//           email, 
//           password, 
//           position: 'STAFF',
//           // Kirim ID Retailer ke backend
//           retailerId: selectedRetailer 
//         }
        
//         const res = await fetch('/api/register', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(registerData)
//         })

//         const data = await res.json()

//         if (!res.ok) {
//           setError(data.error || 'Registrasi gagal')
//         } else {
//           setSuccess('Registrasi berhasil! Mengalihkan ke dashboard...')
//           setName('')
//           setSelectedRetailer('')
          
//           const loginResult = await signIn('credentials', {
//             email,
//             password,
//             redirect: false
//           })
          
//           if (loginResult?.error) {
//             setSuccess('')
//             setEmail('')
//             setPassword('')
//             setError("Registrasi berhasil! Silakan login dengan akun baru.")
//             setIsLogin(true)
//           } else {
//             setTimeout(() => {
//               router.push('/upload')
//               router.refresh()
//             }, 100)
//           }
//         }
//       } catch (err) {
//         console.error('Daftar error:', err)
//         setError('Terjadi kesalahan. Silakan coba lagi.')
//       } finally {
//         setIsLoading(false)
//       }
//     }
//   }

//   return (
//     <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 font-sans">
//       <div className="flex w-full max-w-[940px] min-h-[600px] bg-white rounded-[30px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden m-4">
        
//         <div className="hidden md:flex flex-col w-[45%] relative">
//           <img 
//             src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2070&auto=format&fit=crop" 
//             alt="Artavista" 
//             className="absolute inset-0 w-full h-full object-cover opacity-10"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/70" />
          
//           <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-10 text-center">
//             <div className="flex flex-col items-center justify-center">
//                <img 
//                 src={LogoArtavista.src} 
//                 alt="Artavista Logo" 
//                 className="w-60 h-auto mb-6 object-contain"
//               />
//                <h1 className="text-5xl font-black mb-6 tracking-tight">ARTAVISTA</h1>
//                <p className="text-sm font-medium tracking-widest opacity-90">Sales Monitoring Dashboard</p>
//             </div>
//           </div>
//         </div>

//         <div className="w-full md:w-[55%] relative flex flex-col p-8 md:p-12 justify-center bg-white">
          
//           <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-80" />
//           <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-blue-300 to-blue-400 rounded-full opacity-80" />

//           <div className="relative z-10">
//             <div className="flex gap-6 mb-4 text-xs font-black uppercase tracking-widest">
//               <button 
//                 type="button"
//                 onClick={() => { setIsLogin(true); setError(''); setSuccess(''); setName(''); setSelectedRetailer(''); }}
//                 className={`pb-1 cursor-pointer transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
//               >
//                 Masuk
//               </button>
//               <button 
//                 type="button"
//                 onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
//                 className={`pb-1 cursor-pointer transition-colors ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
//               >
//                 Daftar
//               </button>
//             </div>

//             <h1 className="text-3xl font-black text-blue-600 mb-4 tracking-tight">
//               {isLogin ? 'Masuk' : 'Daftar'}
//             </h1>

//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div className="min-h-[40px]">
//                 {error && (
//                   <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-500 bg-red-50 rounded-lg">
//                     <AlertCircle size={14} />
//                     {error}
//                   </div>
//                 )}
//                 {success && (
//                   <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-green-600 bg-green-50 rounded-lg">
//                     <CheckCircle size={14} />
//                     {success}
//                   </div>
//                 )}
//               </div>

//               {!isLogin && (
//                 <>
//                   <div className="relative">
//                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 z-10">
//                       <User size={18} />
//                     </div>
//                     <Input
//                       type="text"
//                       placeholder="nama lengkap"
//                       required={!isLogin}
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       className="pl-12 h-12 bg-[#F3F4F6] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 placeholder:text-gray-400 text-gray-700 font-medium text-sm"
//                     />
//                   </div>

//                   {/* Dropdown Retailer Hardcoded */}
//                   <div className="relative">
//                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 z-10">
//                       <Store size={18} />
//                     </div>
//                     <select
//                       required={!isLogin}
//                       value={selectedRetailer}
//                       onChange={(e) => setSelectedRetailer(e.target.value)}
//                       className="w-full pl-12 h-12 bg-[#F3F4F6] border-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 text-gray-700 font-medium text-sm appearance-none cursor-pointer"
//                     >
//                       <option value="" disabled className="text-gray-400">Pilih Department</option>
//                       {RETAILERS.map((retailer) => (
//                         <option key={retailer.id} value={retailer.id}>
//                           {retailer.name}
//                         </option>
//                       ))}
//                     </select>
//                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
//                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
//                     </div>
//                   </div>

//                   <p className="text-xs text-gray-500 text-center py-2">
//                     Pendaftaran hanya untuk Staff. Manager dan Asisten Manager ditambahkan melalui dashboard.
//                   </p>
//                 </>
//               )}

//               <div className="relative">
//                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 z-10">
//                   <Mail size={18} />
//                 </div>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-12 h-12 bg-[#F3F4F6] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 placeholder:text-gray-400 text-gray-700 font-medium text-sm"
//                 />
//               </div>

//               <div className="relative">
//                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 z-10">
//                   <Lock size={18} />
//                 </div>
//                 <Input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-12 pr-12 h-12 bg-[#F3F4F6] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 placeholder:text-gray-400 text-gray-700 font-medium text-sm"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>

//               <div className="pt-2 flex flex-col items-center">
//                 <Button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full h-12 bg-gradient-to-r from-blue-400 to-blue-600 hover:brightness-110 text-white font-semibold rounded-full shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-all active:scale-95 uppercase tracking-wider"
//                 >
//                   {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Masuk' : 'Daftar')}
//                 </Button>
                
//                 {isLogin && (
//                   <button type="button" className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors">
//                     Lupa password?
//                   </button>
//                 )}
//               </div>
//             </form>

//             <div className="mt-6 text-center">
//                <button 
//                 type="button"
//                 onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
//                 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
//                >
//                   {isLogin ? 'Buat Akun Anda' : 'Sudah punya akun?'} <span className="ml-1">→</span>
//                </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



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
//     setError('')
//     setSuccess('')
//     setIsLoading(true)

//     if (isLogin) {
//       try {
//         const result = await signIn('credentials', { email, password, redirect: false })
//         if (result?.error) {
//           setError("Email atau password salah.")
//         } else {
//           setTimeout(async () => {
//             const sessionRes = await fetch('/api/auth/session')
//             const session = await sessionRes.json()
//             const userRole = session?.user?.role || session?.user?.position
//             const managerRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT']
//             router.push(managerRoles.includes(userRole) ? '/' : '/upload')
//             router.refresh()
//           }, 100)
//         }
//       } catch (err) {
//         setError('Terjadi kesalahan koneksi')
//       } finally {
//         setIsLoading(false)
//       }
//     } else {
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
//             setError("Registrasi berhasil! Silakan login.")
//             setIsLogin(true)
//           } else {
//             router.push('/upload')
//             router.refresh()
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
//     // PERUBAHAN UTAMA: Menggunakan 'fixed inset-0' mengunci container ke pojok layar, 
//     // memastikan tidak ada scrollbar dari body atau parent elemen manapun.
//     <div className="fixed inset-0 flex items-center justify-center bg-[#F4F7FF] p-4 font-sans text-slate-900 overflow-hidden">
      
//       {/* Container Card */}
//       <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white rounded-[24px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] p-2 md:h-[600px] overflow-hidden relative z-10">
        
//         {/* PANEL KIRI (Gradient Visual) */}
//         <div className="hidden md:flex flex-col w-[45%] relative rounded-[20px] overflow-hidden p-8 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 justify-between h-full">
//           <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
//           <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
          
//           <div className="relative z-10">
//             <img src={LogoArtavista.src} alt="Logo" className="w-32 h-auto drop-shadow-lg brightness-0 invert" />
//           </div>

//           <div className="relative z-10 mt-auto text-white">
//             <p className="text-[10px] font-bold mb-1.5 opacity-80 tracking-widest uppercase">Sales Monitoring Dashboard</p>
//             <h2 className="text-2xl font-bold leading-[1.2] tracking-tight">Akses pusat data personal Anda untuk kejelasan.</h2>
//           </div>
//         </div>

//         {/* PANEL KANAN (Formulir) */}
//         <div className="w-full md:w-[55%] flex flex-col justify-center bg-white rounded-[20px] overflow-hidden">
//           <div className="max-w-[380px] w-full mx-auto px-6 py-4 md:py-0">
            
//             <div className="mb-2">
//               <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
//                 {isLogin ? 'Masuk ke akun' : 'Buat akun baru'}
//               </h1>
//               <p className="text-[12px] text-slate-500 leading-snug">
//                 {isLogin 
//                   ? 'Akses data penjualan dan insight Anda dalam satu tempat.' 
//                   : 'Daftarkan diri Anda untuk memantau penjualan dengan mudah.'}
//               </p>
//             </div>

//             <div className="min-h-[28px] mb-1.5 flex flex-col justify-end">
//               {error && (
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
//                   <AlertCircle size={14} /> {error}
//                 </div>
//               )}
//               {success && (
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg">
//                   <CheckCircle size={14} /> {success}
//                 </div>
//               )}
//             </div>

//             {/* FORM */}
//             <form onSubmit={handleSubmit} className="space-y-2.5">
//               {!isLogin && (
//                 <>
//                   <div className="space-y-1">
//                     <label className="text-[11px] font-bold text-slate-700">Nama lengkap</label>
//                     <Input
//                       type="text"
//                       placeholder="Masukkan nama Anda"
//                       required={!isLogin}
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       className="h-9 px-3 bg-white border-slate-200 rounded-lg text-[13px]"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-[11px] font-bold text-slate-700">Department</label>
//                     <div className="relative">
//                       <select
//                         required={!isLogin}
//                         value={selectedRetailer}
//                         onChange={(e) => setSelectedRetailer(e.target.value)}
//                         className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] appearance-none outline-none focus:ring-2 focus:ring-blue-500/20"
//                       >
//                         <option value="" disabled>Pilih Department</option>
//                         {RETAILERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
//                       </select>
//                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}

//               <div className="space-y-1">
//                 <label className="text-[11px] font-bold text-slate-700">Email Anda</label>
//                 <Input
//                   type="email"
//                   placeholder="nama@email.com"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="h-9 px-3 border-slate-200 rounded-lg text-[13px]"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <div className="flex items-center justify-between">
//                   <label className="text-[11px] font-bold text-slate-700">Password</label>
//                   {isLogin && (
//                     <button type="button" className="text-[10px] font-semibold text-blue-600 hover:underline">Lupa password?</button>
//                   )}
//                 </div>
//                 <div className="relative">
//                   <Input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••••"
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="h-9 pl-3 pr-10 border-slate-200 rounded-lg text-[13px]"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   >
//                     {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="pt-2">
//                 <Button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
//                 >
//                   {isLoading ? <Loader2 className="animate-spin size-4" /> : (isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang')}
//                 </Button>
//               </div>
//             </form>

//             <div className="relative my-3">
//               <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
//               <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Atau</span></div>
//             </div>

//             <div className="text-center pb-2">
//               <span className="text-[11px] text-slate-500">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}</span>
//               <button 
//                 type="button"
//                 onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
//                 className="ml-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
//               >
//                 {isLogin ? 'Buat akun' : 'Masuk di sini'}
//               </button>
//             </div>

//           </div>
//         </div>
//       </div>
      
//       {/* Jika masih butuh custom scrollbar untuk inner card di layar hp, biarkan ini */}
//       <style dangerouslySetInnerHTML={{__html: `
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//       `}} />
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
          
          <div className="hidden md:flex flex-col w-[45%] relative rounded-[20px] overflow-hidden p-8 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 justify-between h-full">
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            
            <div className="relative z-10">
              <img src={LogoArtavista.src} alt="Logo" className="w-32 h-auto drop-shadow-lg brightness-0 invert" />
            </div>

            <div className="relative z-10 mt-auto text-white">
              <p className="text-[10px] font-bold mb-1.5 opacity-80 tracking-widest uppercase">Sales Monitoring Dashboard</p>
              <h2 className="text-2xl font-bold leading-[1.2] tracking-tight">Akses pusat data personal Anda untuk kejelasan.</h2>
            </div>
          </div>

          <div className="w-full md:w-[55%] flex flex-col justify-center bg-white rounded-[20px] py-6 md:py-0">
            <div className="max-w-[380px] w-full mx-auto px-4 sm:px-6 md:px-6 py-2">
              
              <div className="md:hidden flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <img src={LogoArtavista.src} alt="Logo" className="w-6 h-auto brightness-0 invert object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">Artavista</h2>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Dashboard</p>
                </div>
              </div>

              <div className="mb-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {isLogin ? 'Masuk ke akun' : 'Buat akun baru'}
                </h1>
                <p className="text-[12px] text-slate-500 leading-snug">
                  {isLogin 
                    ? 'Akses data penjualan dan insight Anda dalam satu tempat.' 
                    : 'Daftarkan diri Anda untuk memantau penjualan dengan mudah.'}
                </p>
              </div>

              {/* AREA NOTIFIKASI ERROR / SUCCESS */}
              <div className="min-h-[28px] mb-1.5 flex flex-col justify-end">
                {error && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={14} className="shrink-0" /> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={14} className="shrink-0" /> {success}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5" suppressHydrationWarning>
                {!isLogin && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Nama lengkap</label>
                      <Input
                        type="text"
                        placeholder="Masukkan nama Anda"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 md:h-9 px-3 bg-white border-slate-200 rounded-lg text-[13px]"
                        suppressHydrationWarning
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Department</label>
                      <div className="relative">
                        <select
                          required={!isLogin}
                          value={selectedRetailer}
                          onChange={(e) => setSelectedRetailer(e.target.value)}
                          className="w-full h-10 md:h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] appearance-none outline-none focus:ring-2 focus:ring-blue-500/20"
                          suppressHydrationWarning
                        >
                          <option value="" disabled>Pilih Department</option>
                          {RETAILERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Anda</label>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 md:h-9 px-3 border-slate-200 rounded-lg text-[13px]"
                    suppressHydrationWarning
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Password</label>
                    {isLogin && (
                      <button 
                        type="button" 
                        className="text-[10px] font-semibold text-blue-600 hover:underline"
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
                      className="h-10 md:h-9 pl-3 pr-10 border-slate-200 rounded-lg text-[13px]"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      suppressHydrationWarning
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 md:h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                    suppressHydrationWarning
                  >
                    {isLoading ? <Loader2 className="animate-spin size-4" /> : (isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang')}
                  </Button>
                </div>
              </form>

              <div className="relative my-4 md:my-3">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Atau</span></div>
              </div>

              <div className="text-center pb-2">
                <span className="text-[11px] text-slate-500">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}</span>
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                  className="ml-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
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