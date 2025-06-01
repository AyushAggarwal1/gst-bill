import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  isAdmin: boolean;
  tenantId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function getCurrentUser(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  return {
    id: (session.user as SessionUser).id,
    email: session.user.email,
    name: session.user.name,
    isAdmin: (session.user as SessionUser).isAdmin,
    tenantId: (session.user as SessionUser).tenantId,
  };
} 