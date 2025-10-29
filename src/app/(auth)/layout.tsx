import Header from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-login bg-responsive-desktop flex flex-col">
      <Header />
      <div className="flex flex-1 items-start justify-center overflow-y-auto">
        <div className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
          <div className="w-full mt-5">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-4 inline-block">
              <h1 className="text-center text-2xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out sm:text-3xl md:text-4xl lg:text-5xl">
                <div className="inline-block animate-fade-in-up">
                  Acceso al Portal de{" "}
                </div>
                <div className="inline-block animate-fade-in-up animation-delay-200 bg-linear-to-r from-pink-300 to-purple-300 dark:from-pink-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Funcionarios y Apoderados
                </div>
              </h1>
            </div>
          </div>
          <div className="flex w-full justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
