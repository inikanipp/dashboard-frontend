// // import { Sidebar } from '@/components/dashboard/sidebar'

// // export default function DashboardLayout({
// //   children,
// // }: {
// //   children: React.ReactNode
// // }) {
// //   return (
// //     <div className="flex h-screen bg-gray-50 overflow-hidden">
// //       <div className="w-64 shrink-0 h-screen sticky top-0">
// //         <Sidebar className="h-full" />
// //       </div>
// //       <main className="flex-1 overflow-auto h-screen">
// //         {children}
// //       </main>
// //     </div>
// //   )
// // }

// 'use client'

// import { useState } from 'react'
// import { Sidebar } from '@/components/dashboard/sidebar'
// import { Menu } from 'lucide-react'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   return (
//     <div className="flex h-screen bg-slate-50 overflow-hidden">
      
//       {/* 1. Overlay Hitam Transparan untuk Mobile saat Sidebar Terbuka */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* 2. Sidebar Container (Sticky di Desktop, Fixed/Drawer di Mobile) */}
//       <div 
//         className={`
//           fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out 
//           md:relative md:translate-x-0 md:flex-shrink-0 border-r border-slate-200
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//         `}
//       >
//         <Sidebar className="h-full" onClose={() => setSidebarOpen(false)} />
//       </div>

//       {/* 3. Main Content Area */}
//       <main className="flex-1 overflow-auto h-screen flex flex-col relative w-full">
        
//         {/* Mobile Topbar & Hamburger Button (Hanya Muncul di Mobile) */}
//         <div className="md:hidden flex items-center p-4 bg-white border-b border-slate-200 z-30 sticky top-0 shadow-sm">
//           <button 
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mr-3"
//           >
//             <Menu className="w-5 h-5" />
//           </button>
//           <span className="font-bold text-slate-800 text-lg">Artavista</span>
//         </div>

//         {/* Konten Halaman */}
//         {children}
//       </main>
//     </div>
//   )
// }


'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Menu } from 'lucide-react'

// Pastikan path import logo ini sesuai dengan struktur folder Anda.
// Jika file layout.tsx ada di src/app/(dashboard)/layout.tsx, gunakan path di bawah:
import LogoArtavista from '../../../public/logo-artavista.png'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. Overlay Hitam Transparan untuk Mobile saat Sidebar Terbuka */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Container (Sticky di Desktop, Fixed/Drawer di Mobile) */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0 md:flex-shrink-0 border-r border-slate-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar className="h-full" onClose={() => setSidebarOpen(false)} />
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 overflow-auto h-screen flex flex-col relative w-full">
        
        {/* Mobile Topbar & Hamburger Button (Hanya Muncul di Mobile) */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-slate-200 z-30 sticky top-0 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mr-3"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Logo Artavista menggantikan tulisan biasa */}
          <img 
            src={LogoArtavista.src} 
            alt="Artavista Logo" 
            className="h-7 w-auto object-contain" 
          />
        </div>

        {/* Konten Halaman */}
        {children}
      </main>
    </div>
  )
}