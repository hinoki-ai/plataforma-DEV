import { cn } from "@/lib/utils";

interface MoonLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

export function MoonLoader({
  className,
  size = "md",
  text = "Redirigiendo a tu dashboard...",
}: MoonLoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Moon shape with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 animate-pulse"></div>

        {/* Crescent shadow overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-slate-100 dark:to-slate-900 transform rotate-12 animate-pulse"></div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-indigo-400/20 dark:from-blue-500/30 dark:via-purple-500/30 dark:to-indigo-500/30 animate-pulse"></div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 dark:bg-blue-300 rounded-full"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 dark:bg-purple-300 rounded-full"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-indigo-400 dark:bg-indigo-300 rounded-full"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-cyan-400 dark:bg-cyan-300 rounded-full"></div>
        </div>
      </div>

      {text && (
        <p className="mt-4 text-sm text-muted-foreground text-center max-w-xs animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function DarkMoonLoader({
  className,
  size = "md",
  text = "Redirigiendo a tu dashboard...",
}: MoonLoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Dark moon base */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black animate-pulse"></div>

        {/* Moon surface details */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>

        {/* Crescent highlight */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-600 via-slate-700 to-transparent transform -rotate-12"></div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 animate-pulse"></div>

        {/* Orbiting stars */}
        <div className="absolute inset-0 animate-spin">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-indigo-300 rounded-full shadow-lg shadow-indigo-300/50"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50"></div>
        </div>
      </div>

      {text && (
        <p className="mt-4 text-sm text-slate-300 text-center max-w-xs animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
