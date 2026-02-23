// import { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { prisma } from "@/lib/prisma"
// import crypto from "crypto"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null

//         const normalizedEmail = credentials.email.toLowerCase()
//         const user = await prisma.user.findUnique({
//           where: { email: normalizedEmail }
//         })

//         if (!user) return null

//         const hashedPassword = crypto.createHash('md5').update(credentials.password).digest('hex')
        
//         if (hashedPassword !== user.password) {
//           console.log("❌ DEBUG: Password salah di DB")
//           return null
//         }

//         console.log("✅ DEBUG: Login Berhasil di level Database")

//         // MENGGUNAKAN (user as any) AGAR TYPESCRIPT TIDAK ERROR
//         return {
//           id: String(user.id),
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           position: user.position,
//           // Cek retailerId atau restaurantId (tergantung penamaan di DB lama kamu)
//           retailerId: (user as any).retailerId || (user as any).restaurantId 
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: "jwt", 
//   },
//   callbacks: {
//     async jwt({ token, user }: any) {
//       if (user) {
//         token.role = user.role
//         token.position = user.position
//         token.retailerId = user.retailerId 
//       }
//       return token
//     },
//     async session({ session, token }: any) {
//       if (session?.user) {
//         session.user.role = token.role
//         session.user.position = token.position
//         session.user.retailerId = token.retailerId 
//       }
//       return session
//     }
//   },
//   pages: {
//     signIn: '/login',
//   },
//   secret: process.env.NEXTAUTH_SECRET || "INI_KODE_RAHASIA_ARTAVISTA_2024_Pasti_Jalan",
// }

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = credentials.email.toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })

        if (!user) return null

        const hashedPassword = crypto.createHash('md5').update(credentials.password).digest('hex')
        
        if (hashedPassword !== user.password) {
          return null
        }

        // Ambil ID Retailer. Kita konsisten pakai 'retailerId'
        const rId = (user as any).retailerId || (user as any).restaurantId || null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position,
          retailerId: rId ? Number(rId) : null
        }
      }
    })
  ],
  session: {
    strategy: "jwt", 
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.position = user.position
        token.retailerId = user.retailerId 
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).position = token.position;
        (session.user as any).retailerId = token.retailerId;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "INI_KODE_RAHASIA_ARTAVISTA_2024_Pasti_Jalan",
}