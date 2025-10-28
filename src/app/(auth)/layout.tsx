import Header from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-background overflow-hidden md:overflow-hidden">
      <Header />
      <div className="flex items-center justify-center p-4 h-screen overflow-y-auto md:overflow-hidden">
        <div className="w-full max-w-sm relative px-4 sm:px-6 flex flex-col items-center -top-5">
          <div className="text-center mb-4 relative w-full -top-[20px]">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl transition-all duration-700 ease-out leading-tight px-2 flex flex-col items-center">
              <div className="animate-fade-in-up block mb-1 text-center">
                Acceso al Portal de
              </div>
              <div className="animate-fade-in-up animation-delay-200 bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent block text-center">
                Funcionarios y Apoderados
              </div>
            </h1>
          </div>
          <div className="transform -translate-y-[40px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
