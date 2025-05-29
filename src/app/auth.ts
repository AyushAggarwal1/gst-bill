import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      interface SessionUser {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        isAdmin?: boolean;
      }

      return {
        ...session,
        user: {
          ...session.user as SessionUser,
          id: token.id as string,
          isAdmin: token.isAdmin as boolean,
        },
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          isAdmin: (user as any).isAdmin,
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
    signOut: "/signout",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key"
} 