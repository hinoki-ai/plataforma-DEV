"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewVotingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main votaciones page with a query parameter to open the create dialog
    router.replace("/admin/votaciones?create=true");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Redirigiendo a crear votación...
        </p>
      </div>
    </div>
  );
}
