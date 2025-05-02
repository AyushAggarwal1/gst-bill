import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import Image from "next/image";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
