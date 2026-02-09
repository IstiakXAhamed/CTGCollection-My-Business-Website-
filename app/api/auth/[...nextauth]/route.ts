import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Use upsert to combine check and create/update in ONE database hit
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: { 
              googleId: account.providerAccountId,
              emailVerified: true // Ensure verified if logging in via Google
            },
            create: {
              email: user.email,
              name: user.name || 'Google User',
              googleId: account.providerAccountId,
              emailVerified: true,
              role: 'customer',
            }
          })

          if (dbUser.isActive === false) return false

          // Attach DB user details to the user object so subsequent callbacks can use them
          (user as any).dbId = dbUser.id;
          (user as any).dbRole = dbUser.role;
          (user as any).dbName = dbUser.name;

          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      // During initial sign-in, account and user are available
      if (account?.provider === 'google' && user) {
        const u = user as any;
        const userId = u.dbId || u.id;
        const role = u.dbRole || 'customer';
        const name = u.dbName || u.name;

        token.userId = userId
        token.role = role
        token.dbUser = {
          id: userId,
          name: name,
          email: token.email,
          role: role,
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token.dbUser) {
        session.user = token.dbUser as any
      }
      return session
    },

    async redirect({ baseUrl }) {
      // Direct redirect to base URL is faster
      return baseUrl
    }
  },

  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const u = user as any;
          const userId = u.dbId || u.id;
          const role = u.dbRole || 'customer';

          const token = await createToken({
            userId: userId,
            email: user.email,
            role: role,
          })
          
          const cookieStore = await cookies()
          cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          })
        } catch (error) {
          console.error('Event signIn error:', error)
        }
      }
    }
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
