"use client";

import { useSignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language/LanguageContext";
import { motion, Variants } from "motion/react";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const { signIn, isLoaded } = useSignIn();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        window.location.href = callbackUrl ?? "/auth-success";
      }
    } catch (err) {
      console.error("Error signing in:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 sm:px-6">
      {/* Title Panel with Glass Blur */}
      <div className="mb-8 w-full max-w-md">
        <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl px-6 pt-2 pb-4 mx-auto text-center -mt-24">
          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-2xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out sm:text-3xl md:text-4xl"
          >
            {t("auth.portal_title")}
          </motion.h1>
        </div>
      </div>

      <div className="glass-panel mx-auto flex w-full max-w-md flex-col items-center p-6 text-center text-foreground sm:p-10">
        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-left block text-foreground font-medium"
            >
              {t("auth.email.label")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-left block text-foreground font-medium"
            >
              {t("auth.password.label")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 text-white font-semibold transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 focus:outline-none"
          >
            {isLoading ? t("auth.signing_in_button") : t("auth.sign_in_button")}
          </Button>
        </form>

        {/* Parent Registration Button */}
        <div className="w-full border-t border-border pt-6 mt-6">
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              {t("auth.new_parent_question")}
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link
                href="/registro-centro"
                className="flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {t("auth.register_as_parent")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col items-center justify-center px-4 sm:px-6">
          {/* Title Panel with Glass Blur */}
          <div className="mb-8 w-full max-w-md">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl px-6 pt-2 pb-4 mx-auto text-center -mt-24">
              <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out sm:text-3xl md:text-4xl">
                Portal de Acceso
              </h1>
            </div>
          </div>

          <div className="glass-panel mx-auto flex w-full max-w-md items-center justify-center p-6 text-foreground sm:p-10">
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
