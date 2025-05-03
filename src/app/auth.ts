import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { prisma } from "@/lib/prisma"
import { logAuthEvent } from "@/lib/logger"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          // Log failed login attempt - user not found
          await logAuthEvent({
            email: credentials.email,
            action: 'LOGIN_FAILURE',
            level: 'WARN',
            message: 'Login failed - user not found',
            ipAddress: req?.headers?.['x-forwarded-for'] as string || 'unknown',
            userAgent: req?.headers?.['user-agent'],
          });
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Log failed login attempt - invalid password
          await logAuthEvent({
            email: credentials.email,
            action: 'LOGIN_FAILURE',
            level: 'WARN',
            message: 'Login failed - invalid password',
            ipAddress: req?.headers?.['x-forwarded-for'] as string || 'unknown',
            userAgent: req?.headers?.['user-agent'],
          });
          return null
        }

        // Log successful login
        await logAuthEvent({
          email: user.email,
          action: 'LOGIN_SUCCESS',
          level: 'INFO',
          message: 'User logged in successfully',
          ipAddress: req?.headers?.['x-forwarded-for'] as string || 'unknown',
          userAgent: req?.headers?.['user-agent'],
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        }
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
        }
      }
      return token
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  events: {
    signOut: async ({ token }) => {
      if (token?.email) {
        // Log user logout
        await logAuthEvent({
          email: token.email as string,
          action: 'LOGOUT',
          level: 'INFO',
          message: 'User logged out',
        });
      }
    }
  }
} 