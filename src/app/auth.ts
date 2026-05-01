import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        organizationName: { label: "Organization Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.organizationName) {
          return null
        }

        const tenant = await prisma.tenant.findFirst({
          where: { name: credentials.organizationName as string }
        });

        if (!tenant) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
            tenantId: tenant.id
          },
          include: { tenant: true }
        })

        if (!user || !user.password) return null

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) return null

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
})
