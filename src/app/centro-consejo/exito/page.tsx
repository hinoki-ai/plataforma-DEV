import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CentroConsejoExitoPage() {
  // Check if user is authenticated
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // If authenticated, redirect to parent dashboard
  redirect("/parent");
}
