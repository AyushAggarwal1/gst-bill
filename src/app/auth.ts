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
        password: { label: "Password", type: "password" },
        organizationName: { label: "Organization Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.organizationName) {
          return null
        }

        // First find the tenant
        const tenant = await prisma.tenant.findFirst({
          where: { name: credentials.organizationName }
        });

        if (!tenant) {
          return null;
        }

        // Then find user in that tenant
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            tenantId: tenant.id
          },
          include: {
            tenant: true
          }
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
          tenantId: tenant.id,
          tenantName: tenant.name,
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
        tenantId?: string;
        tenantName?: string;
      }

      return {
        ...session,
        user: {
          ...session.user as SessionUser,
          id: token.id as string,
          isAdmin: token.isAdmin as boolean,
          tenantId: token.tenantId as string,
          tenantName: token.tenantName as string,
        },
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          isAdmin: (user as any).isAdmin,
          tenantId: (user as any).tenantId,
          tenantName: (user as any).tenantName,
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