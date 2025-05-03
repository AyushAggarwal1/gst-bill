import { authOptions } from "@/app/auth";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { logAuthEvent, LogEvent } from "@/lib/logger";

// Create a new instance with logging
const authOptionsWithLogging: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // Log failed login attempt - missing credentials
          if (credentials?.email) {
            await logAuthEvent(credentials.email, LogEvent.LOGIN_FAILED, "Missing credentials");
          }
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          // Log failed login attempt - user not found
          await logAuthEvent(credentials.email, LogEvent.LOGIN_FAILED, "User not found");
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Log failed login attempt - invalid password
          await logAuthEvent(credentials.email, LogEvent.LOGIN_FAILED, "Invalid password");
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  callbacks: authOptions.callbacks,
  session: authOptions.session,
  pages: authOptions.pages,
  secret: authOptions.secret,
  events: {
    async signIn({ user }) {
      if (user.email) {
        await logAuthEvent(user.email, LogEvent.LOGIN);
      }
    },
    async signOut({ token }) {
      const email = token?.email as string | undefined;
      if (email) {
        await logAuthEvent(email, LogEvent.LOGOUT);
      }
    }
  }
};

const handler = NextAuth(authOptionsWithLogging);

export { handler as GET, handler as POST }; 