import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolveRoute } from "@/lib/route-resolver";

export default async function CalendarioEscolarPage() {
  const session = await auth();

  // Use intelligent route resolution
  const resolution = resolveRoute("/calendario-escolar", session);

  if (resolution.shouldRedirect) {
    redirect(resolution.redirectPath);
  }

  // This should never be reached due to the route resolver logic
  // but serves as a fallback
  redirect("/login?callbackUrl=" + encodeURIComponent("/calendario-escolar"));
}
