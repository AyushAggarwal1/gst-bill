import type { NextAuthConfig } from "next-auth"

// Edge-compatible auth config — no bcrypt, no prisma, no native addons.
// Used by middleware (Edge runtime) and merged into the full auth config.
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        isAdmin: token.isAdmin as boolean,
        tenantId: token.tenantId as string,
        tenantName: token.tenantName as string,
      },
    }),
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
    },
  },
  session: { strategy: "jwt" as const },
} satisfies NextAuthConfig
