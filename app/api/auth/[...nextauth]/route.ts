import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists with this email
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (dbUser) {
            // Link Google ID if not already linked
            if (!dbUser.googleId && account.providerAccountId) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { googleId: account.providerAccountId }
              })
            }
          } else {
            // Create new user - Google users are auto-verified
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || 'Google User',
                googleId: account.providerAccountId,
                emailVerified: true, // Google already verified their email
                role: 'customer',
              }
            })
          }

          // Check if account is deactivated
          if (dbUser.isActive === false) {
            return false // Block login
          }

          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        // Get the database user
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        
        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role
          token.dbUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
          }
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

    async redirect({ url, baseUrl }) {
      // Redirect to home after successful login
      return baseUrl
    }
  },

  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        // Create our own JWT token and set cookie for compatibility with existing auth
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        
        if (dbUser) {
          const token = await createToken({
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
          })
          
          // Set our auth cookie
          const cookieStore = await cookies()
          cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          })
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
