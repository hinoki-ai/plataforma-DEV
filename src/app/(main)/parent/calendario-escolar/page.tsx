import { Metadata } from "next";
import { requireAuth } from "@/lib/server-auth";
import { getRoleAccess } from "@/lib/role-utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendario Escolar | Plataforma Astral",
  description:
    "Sistema de calendario institucional con fechas importantes, eventos académicos y actividades para toda la comunidad educativa.",
  keywords:
    "calendario escolar, gestión educativa, plataforma institucional, eventos académicos",
  openGraph: {
    title: "Calendario Escolar | Plataforma Astral",
    description:
      "Accede al calendario institucional con fechas importantes y eventos académicos.",
    type: "website",
  },
};

export default async function CalendarioEscolarPage() {
  const session = await requireAuth();
  const roleAccess = getRoleAccess(session.user.role);

  // Ensure user has access to parent dashboard
  if (
    !roleAccess.canAccessParent &&
    session.user.role !== "PROFESOR" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/no-autorizado");
  }

  // Redirect to integrated calendar in libro de clases
  redirect("/parent/libro-clases/asistencia");
}
