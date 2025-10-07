import ClientLayoutProvider from "@/components/layout/ClientLayoutProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutProvider>{children}</ClientLayoutProvider>;
}
