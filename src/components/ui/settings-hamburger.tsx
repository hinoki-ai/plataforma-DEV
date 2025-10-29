"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import SkyToggle from "@/components/ui/sky-toggle";
import SoundToggle from "@/components/ui/sound-toggle";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface SettingsHamburgerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SettingsHamburger = ({
  className,
  size = "sm"
}: SettingsHamburgerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={handleToggle}
        aria-label="Settings menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="settings-menu"
        className={cn(
          "relative flex items-center justify-center bg-background/95 backdrop-blur-sm hover:bg-background border-border hover:shadow-md transition-all duration-200 ease-in-out",
          getSizeClasses(),
          className
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 w-64 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            id="settings-menu"
            role="menu"
            aria-label="Settings menu"
          >
            <div className="p-4 space-y-4">
              {/* Language Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Idioma / Language
                </label>
                <div className="flex-shrink-0">
                  <LanguageToggle />
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Tema / Theme
                </label>
                <div className="flex-shrink-0">
                  <SkyToggle size="sm" />
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Música / Music
                </label>
                <div className="flex-shrink-0">
                  <SoundToggle size="sm" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
