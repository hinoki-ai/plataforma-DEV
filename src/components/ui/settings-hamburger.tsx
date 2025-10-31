"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, X, Sparkles } from "lucide-react";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import SkyToggle from "@/components/ui/sky-toggle";
import SoundToggle from "@/components/ui/sound-toggle";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface SettingsHamburgerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SettingsHamburger = ({
  className,
  size = "sm",
}: SettingsHamburgerProps) => {
  const { t } = useDivineParsing(["common"]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Generate stable random positions for sparkles to avoid React purity violations
  const sparklePositions = useState(() =>
    [...Array(1)].map(() => ({
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
    })),
  )[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-9 w-9";
      case "md":
        return "h-10 w-10";
      case "lg":
        return "h-12 w-12";
      default:
        return "h-9 w-9";
    }
  };

  // Container variants for epic dropdown animation
  const containerVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      rotateX: -15,
      filter: "blur(4px)",
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -10,
      rotateX: 10,
      filter: "blur(2px)",
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 1, 1] as const,
      },
    },
  };

  // Item variants for staggered entrance
  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      scale: 0.9,
    },
    open: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Epic button with glow effects */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          aria-label="Settings menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls="settings-menu"
          className={cn(
            "relative flex items-center justify-center bg-transparent border-none transition-all duration-300 overflow-hidden hover:bg-transparent",
            getSizeClasses(),
            className,
          )}
        >
          {/* Sparkle effects */}
          <AnimatePresence>
            {(isHovered || isOpen) && (
              <>
                {[...Array(1)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: sparklePositions[i].x,
                      y: sparklePositions[i].y,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 180, 360],
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <Sparkles className="h-2 w-2 text-primary" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Icon with insane rotation and effects */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{
              rotate: isOpen ? 180 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              rotate: { duration: 0.5, ease: "easeInOut" },
              scale: { duration: 0.2 },
            }}
          >
            <motion.div
              animate={{
                rotate: isOpen ? 90 : 0,
              }}
              transition={{ duration: 0.3, delay: isOpen ? 0.1 : 0 }}
            >
              {isOpen ? (
                <X className="h-4 w-4 drop-shadow-lg" />
              ) : (
                <Settings className="h-4 w-4 drop-shadow-lg" />
              )}
            </motion.div>
          </motion.div>
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="absolute top-full mt-2 right-0 w-20 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
            id="settings-menu"
            role="menu"
            aria-label="Settings menu"
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-purple-500/10 rounded-xl pointer-events-none" />

            <div className="relative py-1 px-1 inline-flex flex-col items-center space-y-0.5 scale-125 origin-top">
              {/* Enhanced Language Toggle */}
              <LanguageToggle size="sm" />

              {/* Enhanced Theme Toggle */}
              <SkyToggle size="sm" />

              {/* Enhanced Sound Toggle */}
              <SoundToggle size="sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
