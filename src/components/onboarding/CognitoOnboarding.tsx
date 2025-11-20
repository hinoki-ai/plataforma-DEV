"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Check } from "lucide-react";
import Image from "next/image";

interface CognitoOnboardingProps {
  onStart?: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
  onHighlightSidebar?: (highlight: boolean) => void;
}

export function CognitoOnboarding({
  onStart,
  onComplete,
  onDismiss,
  onHighlightSidebar,
}: CognitoOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the onboarding
    const hasSeenOnboarding = localStorage.getItem(
      "cognito_onboarding_completed",
    );
    if (!hasSeenOnboarding) {
      setIsVisible(true);
      onStart?.();
    }
  }, [onStart]);

  useEffect(() => {
    if (isVisible && step === 1) {
      onHighlightSidebar?.(true);
    } else {
      onHighlightSidebar?.(false);
    }
  }, [step, isVisible, onHighlightSidebar]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleComplete = () => {
    localStorage.setItem("cognito_onboarding_completed", "true");
    setIsVisible(false);
    onHighlightSidebar?.(false);
    onComplete?.();
  };

  const handleDismiss = () => {
    localStorage.setItem("cognito_onboarding_completed", "true");
    setIsVisible(false);
    onHighlightSidebar?.(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Content Container */}
          <div className="relative z-50 w-full max-w-4xl p-4 md:p-8 pointer-events-none">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Cognito Character */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 pointer-events-auto"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Image
                  src="/cognito-happy-light.png"
                  alt="Cogníto"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              {/* Dialogue Box */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl max-w-lg relative pointer-events-auto"
              >
                {/* Speech Bubble Arrow (Desktop) */}
                <div className="hidden md:block absolute top-1/2 -left-3 w-6 h-6 bg-card border-l border-b border-border transform rotate-45 -translate-y-1/2" />

                {/* Speech Bubble Arrow (Mobile) */}
                <div className="md:hidden absolute -top-3 left-1/2 w-6 h-6 bg-card border-t border-l border-border transform rotate-45 -translate-x-1/2" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {step === 0
                      ? "¡Hola! Soy Cogníto 👋"
                      : "Tu Panel de Control"}
                  </h2>

                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {step === 0
                      ? "Bienvenido a Plataforma Astral. Estoy aquí para ayudarte a dar tus primeros pasos y asegurarme de que tengas una experiencia increíble."
                      : "A tu izquierda encontrarás el menú principal. Aquí podrás acceder a todas las herramientas que necesitas: Planificación, Asistencia, Notas y más."}
                  </p>

                  <div className="flex items-center justify-center pt-4 border-t border-border/50">
                    <Button
                      onClick={step === 0 ? handleNext : handleComplete}
                      className="group"
                    >
                      {step === 0 ? "Comenzar Tour" : "Entendido"}
                      {step === 0 ? (
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      ) : (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
