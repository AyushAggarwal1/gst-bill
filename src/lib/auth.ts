import { hash } from "bcrypt";
import { auth } from "@/app/auth";

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

export async function getCurrentUser(_req?: Request) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return {
    id: (session.user as unknown as SessionUser).id,
    email: session.user.email,
    name: session.user.name,
    isAdmin: (session.user as unknown as SessionUser).isAdmin,
    tenantId: (session.user as unknown as SessionUser).tenantId,
  };
}
