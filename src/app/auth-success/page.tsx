"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/unified-loader";
import { useLanguage } from "@/components/language/LanguageContext";

export default function AuthSuccessPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (redirected) return;

    const checkAuthAndRedirect = () => {
      console.log(
        "AuthSuccess - Status:",
        status,
        "Session:",
        session?.user ? "exists" : "null",
        "Role:",
        session?.user?.role,
      );

      if (status === "loading") return; // Wait for session

      if (status === "unauthenticated") {
        console.log(
          "AuthSuccess - User is unauthenticated, redirecting to login",
        );
        setRedirected(true);
        router.replace("/login");
        return;
      }

      if (status === "authenticated" && session?.user) {
        setRedirected(true);
        const role = session.user.role;
        console.log(
          "AuthSuccess - User authenticated with role:",
          role,
          "redirecting...",
        );

        switch (role) {
          case "MASTER":
            console.log("AuthSuccess - Redirecting MASTER to /master");
            router.replace("/master");
            break;
          case "ADMIN":
            router.replace("/admin");
            break;
          case "PROFESOR":
            router.replace("/profesor");
            break;
          case "PARENT":
            if (session.user.needsRegistration) {
              router.replace("/centro-consejo");
            } else {
              router.replace("/parent");
            }
            break;
          default:
            router.replace("/");
        }
      }
    };

    checkAuthAndRedirect();
  }, [session, status, router, redirected]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!redirected) {
        setRedirected(true);
        router.replace("/");
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [redirected, router]);

  return <PageLoader text={t("common.loading", "common")} />;
}
