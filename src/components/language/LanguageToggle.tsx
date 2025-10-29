"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageContext";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LanguageOption {
  code: "es" | "en";
  name: string;
  nativeName: string;
  flag: string;
  ariaLabel: string;
}

// Memoized language options for performance
const languageOptions: LanguageOption[] = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    ariaLabel: "Cambiar a español",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    ariaLabel: "Switch to English",
  },
] as const;

// Memoized individual option component for better performance
const LanguageOptionItem = memo(function LanguageOptionItem({
  option,
  isSelected,
  isFocused,
  onClick,
  onKeyDown,
  index,
}: {
  option: LanguageOption;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  index: number;
}) {
  return (
    <div
      id={`language-option-${index}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-inset rounded-md cursor-pointer ${
        isSelected
          ? "bg-primary/10 text-primary shadow-sm"
          : "hover:bg-accent/50"
      } ${isFocused ? "bg-accent" : ""}`}
      role="option"
      aria-label={option.ariaLabel}
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
       
    >
      <div className="flex items-center gap-3">
        <span className="text-lg" aria-hidden="true" role="img">
          {option.flag}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">
            {option.nativeName}
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            {option.name}
          </span>
        </div>
      </div>
      {isSelected && (
        <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
      )}
    </div>
  );
});

LanguageOptionItem.displayName = "LanguageOptionItem";

const LanguageToggle = memo(() => {
  const { language, setLanguage, t, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentLanguage = languageOptions.find(
    (lang) => lang.code === language,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = useCallback(
    (newLanguage: "es" | "en") => {
      if (newLanguage === language) return;
      setLanguage(newLanguage);
      setIsOpen(false);
      setFocusedIndex(-1);
      const announcement = `Language changed to ${languageOptions.find((lang) => lang.code === newLanguage)?.nativeName}`;
      const liveRegion = document.getElementById("sr-announcement");
      if (liveRegion) liveRegion.textContent = announcement;
    },
    [language, setLanguage],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < languageOptions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : languageOptions.length - 1,
          );
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(languageOptions.length - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleLanguageChange(languageOptions[focusedIndex].code);
          }
          break;
        case "Tab":
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [isOpen, focusedIndex, handleLanguageChange],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const firstOption = listboxRef.current.querySelector(
        '[role="option"]',
      ) as HTMLElement;
      if (firstOption) {
        firstOption.focus();
        setFocusedIndex(0);
      }
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setFocusedIndex(-1);
  }, []);

  const handleOptionClick = useCallback(
    (option: LanguageOption) => {
      handleLanguageChange(option.code);
    },
    [handleLanguageChange],
  );

  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent, option: LanguageOption) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleLanguageChange(option.code);
      }
    },
    [handleLanguageChange],
  );

  return (
    <>
      <div
        id="sr-announcement"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="relative" ref={dropdownRef}>
        <Button
          ref={buttonRef}
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={t("language.toggle", "language")}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="language-listbox"
          aria-describedby="language-description"
          className="relative flex items-center gap-2 bg-background/95 backdrop-blur-sm hover:bg-background border-border hover:shadow-md transition-all duration-200 ease-in-out min-w-[100px] h-9 disabled:opacity-50"
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          <span className="text-base" aria-hidden="true">
            {currentLanguage?.flag}
          </span>
          <span className="text-sm font-medium">
            {currentLanguage?.code.toUpperCase()}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
            aria-hidden="true"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </Button>

        <div id="language-description" className="sr-only">
          Language selector. Use arrow keys to navigate options, Enter to
          select, and Escape to close.
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full mt-1 right-0 w-44 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div
                role="listbox"
                id="language-listbox"
                aria-label="Language options"
                aria-activedescendant={
                  focusedIndex >= 0 ? `language-option-${focusedIndex}` : ""
                }
                ref={listboxRef}
                className="max-h-60 overflow-auto"
                 
              >
                {languageOptions.map((option, index) => (
                  <LanguageOptionItem
                    key={option.code}
                    option={option}
                    isSelected={language === option.code}
                    isFocused={focusedIndex === index}
                    onClick={() => handleOptionClick(option)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

LanguageToggle.displayName = "LanguageToggle";

export { LanguageToggle };
