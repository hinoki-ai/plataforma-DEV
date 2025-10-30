import ClientLayoutProvider from "@/components/layout/ClientLayoutProvider";

// Force dynamic rendering for authenticated pages to prevent static generation issues
export const dynamic = "force-dynamic";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutProvider>{children}</ClientLayoutProvider>;
}
