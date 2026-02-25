// 'use client'

// import Link from 'next/link'
// import { usePathname, useRouter } from 'next/navigation'
// import { signOut, useSession } from 'next-auth/react'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'
// import LogoArtavista from '../../../public/logo-artavista.png'
// import { useState, useEffect, useRef } from 'react'
// import {
//   LayoutDashboard,
//   Upload,
//   ShoppingCart,
//   LogOut,
//   Store,
//   Bell,
//   Users,
//   BarChart3,
//   TrendingUp,
//   Sparkles,
//   X,
//   Check
// } from 'lucide-react'
// import { getInitials } from '@/lib/utils'

// interface Notification {
//   id: number
//   title: string
//   message: string
//   type: 'info' | 'success' | 'warning' | 'error'
//   read: boolean
//   date: string
// }

// const allNavigation = [
//   { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['GM', 'MANAGER', 'STAFF'] },
//   { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['GM', 'MANAGER'] },
//   { name: 'Upload Data', href: '/upload', icon: Upload, roles: ['GM', 'MANAGER', 'STAFF'] },
//   { name: 'Data Transaksi', href: '/orders', icon: ShoppingCart, roles: ['GM', 'MANAGER'] },
//   { name: 'Forecasting', href: '/forecasting', icon: TrendingUp, roles: ['GM', 'MANAGER'] },
//   { name: 'Rekomendasi', href: '/recommendation', icon: Sparkles, roles: ['GM'] },
// ]

// const managerNavigation = [
//   { name: 'Kelola Staff', href: '/staff', icon: Users, roles: ['MANAGER'] },
// ]

// const adminNavigation = [
//   { name: 'Department', href: '/retailer', icon: Store, roles: ['GM'] },
// ]

// function getRoleLabel(role: string | undefined) {
//   switch (role) {
//     case 'GM': return 'GM'
//     case 'GENERAL_MANAGER': return 'GM'
//     case 'MANAGER': return 'Manager'
//     case 'REGIONAL_MANAGER': return 'Manager'
//     case 'STAFF': return 'Staff'
//     default: return 'Staff'
//   }
// }

// interface SidebarProps {
//   className?: string
//   onClose?: () => void
// }

// export function Sidebar({ className, onClose }: SidebarProps) {
//   const pathname = usePathname()
//   const { data: session } = useSession()
//   const router = useRouter()

//   const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
//   const isGM = userRole === 'GM' || userRole === 'GENERAL_MANAGER'
//   const isManager = userRole === 'MANAGER' || userRole === 'REGIONAL_MANAGER'
//   const isStaff = userRole === 'STAFF'

//   const [showNotifications, setShowNotifications] = useState(false)
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

//   // Ambil notifikasi dari API
//   useEffect(() => {
//     if (session) {
//       fetchNotifications()
//     }
//   }, [session])

//   const fetchNotifications = async () => {
//     setIsLoadingNotifications(true)
//     try {
//       const res = await fetch('/api/notifications')
//       const data = await res.json()
//       if (data.notifications && data.notifications.length > 0) {
//         setNotifications(data.notifications)
//       } else {
//         // Default notifications jika belum ada chat
//         setNotifications([
//           { id: 1, title: 'Selamat Datang', message: 'Gunakan AI Assistant untuk mendapat insights', type: 'info', read: false, date: 'Baru saja' },
//           { id: 2, title: 'Tips', message: 'Klik pertanyaan sugestif di sidebar untuk memulai', type: 'info', read: true, date: '1 hari lalu' },
//         ])
//       }
//     } catch (err) {
//       console.error('Error fetching notifications:', err)
//       // Default notifications
//       setNotifications([
//         { id: 1, title: 'Selamat Datang', message: 'Gunakan AI Assistant untuk mendapat insights', type: 'info', read: false, date: 'Baru saja' },
//       ])
//     } finally {
//       setIsLoadingNotifications(false)
//     }
//   }

//   const unreadCount = notifications.filter(n => !n.read).length

//   const markAsRead = (id: number) => {
//     setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
//   }

//   const markAllAsRead = () => {
//     setNotifications(notifications.map(n => ({ ...n, read: true })))
//   }

//   const handleLogout = async () => {
//     await signOut({ redirect: false })
//     router.push('/login')
//   }

//   const filteredNavigation = allNavigation.filter(item => item.roles.includes(userRole))
//   const filteredAdminNav = adminNavigation.filter(item => item.roles.includes(userRole))
//   const filteredManagerNav = managerNavigation.filter(item => item.roles.includes(userRole))

//   const notificationRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
//         setShowNotifications(false)
//       }
//     }

//     if (showNotifications) {
//       document.addEventListener('mousedown', handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [showNotifications])

//   return (
//     <div
//       className={cn(
//         "flex flex-col h-full bg-white border-r border-slate-200",
//         className
//       )}
//     >
//       {/* Logo */}
//       <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-200">
//         <img src={LogoArtavista.src} alt="Logo" className="w-32 h-auto drop-shadow-sm" />
//         {onClose && (
//           <button 
//             onClick={onClose} 
//             className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
//         {filteredNavigation.map((item) => {
//           const isActive = pathname === item.href
//           return (
//             <Link
//               key={item.name}
//               href={item.href}
//               onClick={onClose}
//               className={cn(
//                 "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
//                 isActive 
//                   ? "bg-[#054CC7] text-white shadow-md shadow-[#054CC7]/20" 
//                   : "text-slate-600 hover:bg-slate-100 hover:text-[#054CC7]"
//               )}
//             >
//               <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#054CC7]")} />
//               {item.name}
//             </Link>
//           )
//         })}

//         {(isGM || isManager) && (
//           <>
//             <div className="pt-6 pb-2">
//               <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
//                 {isGM ? 'Administration' : 'Manajemen'}
//               </p>
//             </div>
//             {isManager && filteredManagerNav.map((item) => {
//               const isActive = pathname === item.href
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   onClick={onClose}
//                   className={cn(
//                     "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
//                     isActive 
//                       ? "bg-[#054CC7] text-white shadow-md shadow-[#054CC7]/20" 
//                       : "text-slate-600 hover:bg-slate-100 hover:text-[#054CC7]"
//                   )}
//                 >
//                   <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#054CC7]")} />
//                   {item.name}
//                 </Link>
//               )
//             })}
//             {isGM && filteredAdminNav.map((item) => {
//               const isActive = pathname === item.href
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   onClick={onClose}
//                   className={cn(
//                     "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
//                     isActive 
//                       ? "bg-[#054CC7] text-white shadow-md shadow-[#054CC7]/20" 
//                       : "text-slate-600 hover:bg-slate-100 hover:text-[#054CC7]"
//                   )}
//                 >
//                   <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#054CC7]")} />
//                   {item.name}
//                 </Link>
//               )
//             })}
//           </>
//         )}
//       </nav>

//       {/* User section */}
//       <div className="px-4 py-4 border-t border-slate-200">
//         <div className="flex items-center gap-3 mb-4">
//           <Avatar className="h-10 w-10 border border-slate-200">
//             <AvatarImage src="" />
//             <AvatarFallback className="rounded-full bg-gradient-to-br from-[#054CC7] to-[#17C3CC] text-white font-semibold">
//               {session?.user?.name ? getInitials(session.user.name) : 'U'}
//             </AvatarFallback>
//           </Avatar>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-semibold text-slate-800 truncate">
//               {session?.user?.name}
//             </p>
//             <p className="text-[11px] text-slate-500 truncate mt-0.5">
//               {session?.user?.email}
//             </p>
//             <Badge className="mt-1.5 px-2 py-0 bg-[#054CC7]/10 text-[#054CC7] hover:bg-[#054CC7]/20 border-0 font-bold text-[10px]">
//               {getRoleLabel((session?.user as any)?.position || (session?.user as any)?.role)}
//             </Badge>
//           </div>
//           <div className="relative">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setShowNotifications(!showNotifications)}
//               className="relative text-slate-400 hover:text-[#054CC7] hover:bg-[#054CC7]/10 rounded-full"
//             >
//               <Bell className="h-5 w-5" />
//               {unreadCount > 0 && (
//                 <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full"></span>
//               )}
//             </Button>

//             {showNotifications && (
//               <div ref={notificationRef} className="absolute -right-2 bottom-12 w-72 max-h-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
//                 <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0">
//                   <h3 className="font-bold text-sm text-slate-800">Notifikasi</h3>
//                   <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//                 <div className="overflow-y-auto max-h-56">
//                   {notifications.length === 0 ? (
//                     <div className="p-6 text-center">
//                       <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
//                       <p className="text-slate-500 text-xs">Tidak ada notifikasi baru</p>
//                     </div>
//                   ) : (
//                     notifications.map((notif) => (
//                       <div
//                         key={notif.id}
//                         className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
//                         onClick={() => {
//                           markAsRead(notif.id)
//                           setShowNotifications(false)
//                           if (onClose) onClose()
//                           if (notif.title.includes('Forecast')) {
//                             router.push('/forecasting')
//                           } else if (notif.title.includes('Data') || notif.title.includes('upload')) {
//                             router.push('/upload')
//                           } else if (notif.title.includes('Rekomendasi')) {
//                             router.push('/recommendation')
//                           } else {
//                             router.push('/')
//                           }
//                         }}
//                       >
//                         <div className="flex items-start gap-3">
//                           <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
//                             notif.type === 'info' ? 'bg-[#054CC7]' :
//                             notif.type === 'success' ? 'bg-emerald-500' :
//                             notif.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'
//                           }`} />
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center justify-between gap-2">
//                               <p className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</p>
//                               <p className="text-[9px] text-slate-400 whitespace-nowrap">{notif.date}</p>
//                             </div>
//                             <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{notif.message}</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//                 {notifications.some(n => !n.read) && (
//                   <div className="p-2 border-t border-slate-100 bg-slate-50/50">
//                     <button
//                       onClick={markAllAsRead}
//                       className="w-full text-xs font-medium text-[#054CC7] hover:text-blue-800 flex items-center justify-center gap-1.5 py-1"
//                     >
//                       <Check className="h-3.5 w-3.5" /> Tandai semua dibaca
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
        
//         <Button
//           variant="outline"
//           className="w-full border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
//           onClick={handleLogout}
//         >
//           <LogOut className="mr-2 h-4 w-4" />
//           Keluar
//         </Button>
//       </div>
//     </div>
//   )
// }

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import LogoArtavista from '../../../public/logo-artavista.png'
import {
  LayoutDashboard,
  Upload,
  ShoppingCart,
  LogOut,
  Store,
  Users,
  BarChart3,
  TrendingUp,
  Sparkles,
  X
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['GM', 'MANAGER', 'STAFF'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['GM', 'MANAGER'] },
  { name: 'Upload Data', href: '/upload', icon: Upload, roles: ['GM', 'MANAGER', 'STAFF'] },
  { name: 'Data Transaksi', href: '/orders', icon: ShoppingCart, roles: ['GM', 'MANAGER'] },
  { name: 'Forecasting', href: '/forecasting', icon: TrendingUp, roles: ['GM', 'MANAGER'] },
  { name: 'Rekomendasi', href: '/recommendation', icon: Sparkles, roles: ['GM'] },
]

const managerNavigation = [
  { name: 'Kelola Staff', href: '/staff', icon: Users, roles: ['MANAGER'] },
]

const adminNavigation = [
  { name: 'Department', href: '/retailer', icon: Store, roles: ['GM'] },
]

function getRoleLabel(role: string | undefined) {
  switch (role) {
    case 'GM': return 'GM'
    case 'GENERAL_MANAGER': return 'GM'
    case 'MANAGER': return 'Manager'
    case 'REGIONAL_MANAGER': return 'Manager'
    case 'STAFF': return 'Staff'
    default: return 'Staff'
  }
}

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const isGM = userRole === 'GM' || userRole === 'GENERAL_MANAGER'
  const isManager = userRole === 'MANAGER' || userRole === 'REGIONAL_MANAGER'

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const filteredNavigation = allNavigation.filter(item => item.roles.includes(userRole))
  const filteredAdminNav = adminNavigation.filter(item => item.roles.includes(userRole))
  const filteredManagerNav = managerNavigation.filter(item => item.roles.includes(userRole))

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-200">
        <img src={LogoArtavista.src} alt="Logo" className="w-32 h-auto drop-shadow-sm" />
        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                isActive 
                  ? "bg-[#054CC7] text-white shadow-md shadow-[#054CC7]/20" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#054CC7]"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#054CC7]")} />
              {item.name}
            </Link>
          )
        })}

        {(isGM || isManager) && (
          <>
            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {isGM ? 'Administration' : 'Manajemen'}
              </p>
            </div>
            {isManager && filteredManagerNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                    isActive 
                      ? "bg-[#054CC7] text-white shadow-md shadow-[#054CC7]/20" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#054CC7]"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#054CC7]")} />
                  {item.name}
                </Link>
              )
            })}
            {isGM && filteredAdminNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                    isActive 
                      ? "bg-[#054CC7] text-white shadow-md shadow-[#054CC7]/20" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#054CC7]"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-[#054CC7]")} />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border border-slate-200">
            <AvatarImage src="" />
            <AvatarFallback className="rounded-full bg-gradient-to-br from-[#054CC7] to-[#17C3CC] text-white font-semibold">
              {session?.user?.name ? getInitials(session.user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {session?.user?.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {session?.user?.email}
            </p>
            <Badge className="mt-1.5 px-2 py-0 bg-[#054CC7]/10 text-[#054CC7] hover:bg-[#054CC7]/20 border-0 font-bold text-[10px]">
              {getRoleLabel((session?.user as any)?.position || (session?.user as any)?.role)}
            </Badge>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  )
}