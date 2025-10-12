"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EnhancedAuthProviderProps {
  children: React.ReactNode;
}

export function EnhancedAuthProvider({ children }: EnhancedAuthProviderProps) {
  const [mounted, setMounted] = useState(false);
  const _router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  return (
    <SessionProvider
      refetchInterval={30} // Refresh session every 30 seconds
      refetchOnWindowFocus={true} // Refresh when window regains focus
      refetchWhenOffline={false} // Don't refetch when offline
    >
      {children}
    </SessionProvider>
  );
}
