import Header from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-login bg-responsive-desktop flex flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12 overflow-y-auto md:px-8 md:py-16">
        <div className="flex w-full max-w-4xl flex-col items-center gap-10 text-center">
          <div className="w-full">
            <h1 className="px-2 text-center text-3xl font-bold leading-tight text-white drop-shadow-2xl transition-all duration-700 ease-out sm:text-4xl md:text-5xl lg:text-6xl">
              <div className="inline-block animate-fade-in-up">
                Acceso al Portal de{" "}
              </div>
              <div className="inline-block animate-fade-in-up animation-delay-200 bg-linear-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                Funcionarios y Apoderados
              </div>
            </h1>
          </div>
          <div className="flex w-full justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
