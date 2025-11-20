import ClientMasterLayout from "@/components/layout/ClientMasterLayout";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <ClientMasterLayout>{children}</ClientMasterLayout>
    </div>
  );
}
