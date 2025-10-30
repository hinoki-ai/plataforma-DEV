import Header from "@/components/layout/Header";

export default function RegistroCentroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-responsive-desktop bg20 flex flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <div className="flex w-full justify-center">{children}</div>
      </div>
    </div>
  );
}
