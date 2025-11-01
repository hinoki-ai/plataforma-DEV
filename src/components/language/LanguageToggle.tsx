"use client";

import React, { useCallback, memo, useState, useEffect } from "react";
import styled from "styled-components";
import { useLanguage } from "./LanguageContext";

interface LanguageOption {
  code: "es" | "en";
  name: string;
  nativeName: string;
  flag: string;
  ariaLabel: string;
}

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LanguageToggle = memo(
  ({ className, size = "md" }: LanguageToggleProps) => {
    const { language, setLanguage, isLoading, t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    // Only set mounted after component has mounted to prevent hydration issues
    useEffect(() => {
      if (typeof window !== "undefined") {
        // Use setTimeout to avoid cascading renders
        const timeoutId = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timeoutId);
      }
    }, []);

    const languageOptions: LanguageOption[] = [
      {
        code: "es",
        name: "Spanish",
        nativeName: t("language.spanish", "language") || "Español",
        flag: "🇨🇱",
        ariaLabel:
          t("language.ariaSwitchSpanish", "language") || "Cambiar a español",
      },
      {
        code: "en",
        name: "English",
        nativeName: t("language.english", "language") || "English",
        flag: "🇺🇸",
        ariaLabel:
          t("language.ariaSwitchEnglish", "language") || "Switch to English",
      },
    ];

    const currentLanguage = languageOptions.find(
      (lang) => lang.code === language,
    );

    const nextLanguage = languageOptions.find((lang) => lang.code !== language);

    const handleToggle = useCallback(async () => {
      if (nextLanguage && !isLoading) {
        try {
          await setLanguage(nextLanguage.code);

          // Announce language change for screen readers
          const announcement = `${t("language.changedTo", "language")} ${nextLanguage.nativeName}`;
          const liveRegion = document.getElementById("sr-announcement");
          if (liveRegion) liveRegion.textContent = announcement;

          // Also update HTML lang attribute immediately for better SEO
          if (typeof document !== "undefined") {
            document.documentElement.lang =
              nextLanguage.code === "es" ? "es-CL" : "en-US";
          }
        } catch (error) {
          // Silently handle errors - the language state should still update
          if (process.env.NODE_ENV === "development") {
            console.warn("Language toggle error:", error);
          }
        }
      }
    }, [nextLanguage, setLanguage, isLoading, t]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      },
      [handleToggle],
    );

    if (!mounted) {
      return null;
    }

    const isEnglish = language === "en";
    const sizeMultiplier = size === "sm" ? 0.4 : size === "lg" ? 1.2 : 1;

    return (
      <>
        {/* Screen reader announcements */}
        <div
          id="sr-announcement"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        <StyledWrapper className={className} $sizeMultiplier={sizeMultiplier}>
          <label className="language-switch">
            <input
              type="checkbox"
              className="language-switch__checkbox"
              checked={isEnglish}
              onChange={handleToggle}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label={
                nextLanguage?.ariaLabel || t("language.switchTo", "language")
              }
            />
            <div className="language-switch__container">
              {/* Stars overlay for English (3-2-3 pattern) */}
              {isEnglish && (
                <div className="language-switch__stars-overlay">
                  {/* Row 1: 3 stars (oxoxoxo) */}
                  <div className="language-switch__star-row language-switch__star-row--1">
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__space"></span>
                  </div>
                  {/* Row 2: 2 stars (xoxoxox) */}
                  <div className="language-switch__star-row language-switch__star-row--2">
                    <span className="language-switch__space"></span>
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__space"></span>
                  </div>
                  {/* Row 3: 3 stars (oxoxoxo) */}
                  <div className="language-switch__star-row language-switch__star-row--3">
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__star">★</span>
                    <span className="language-switch__space"></span>
                    <span className="language-switch__space"></span>
                  </div>
                </div>
              )}
              {/* Circle Container with Flag */}
              <div className="language-switch__circle-container">
                <div className="language-switch__flag-container">
                  {/* Spanish Flag */}
                  <div
                    className={`language-switch__flag language-switch__flag--es ${!isEnglish ? "language-switch__flag--active" : ""}`}
                  >
                    <span
                      className="language-switch__flag-icon"
                      role="img"
                      aria-label="Spanish flag"
                    >
                      🇨🇱
                    </span>
                  </div>
                  {/* English Flag */}
                  <div
                    className={`language-switch__flag language-switch__flag--en ${isEnglish ? "language-switch__flag--active" : ""}`}
                  >
                    <span
                      className="language-switch__flag-icon"
                      role="img"
                      aria-label="English flag"
                    >
                      🇺🇸
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </StyledWrapper>
      </>
    );
  },
);

const StyledWrapper = styled.div<{ $sizeMultiplier: number }>`
  .language-switch {
    --toggle-size: ${(props) => 30 * props.$sizeMultiplier}px;
    --container-width: 5.625em;
    --container-height: 2.5em;
    --container-radius: 6.25em;
    --container-es-bg: #dc2626;
    --container-en-bg: #2563eb;
    --circle-container-diameter: 3.375em;
    --flag-diameter: 2.125em;
    --flag-bg: #ffffff;
    --transition: 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    --circle-transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    --text-color: #ffffff;
  }

  .language-switch,
  .language-switch *,
  .language-switch *::before,
  .language-switch *::after {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-size: var(--toggle-size);
  }

  .language-switch__container {
    width: var(--container-width);
    height: var(--container-height);
    background-color: var(--container-es-bg);
    border-radius: var(--container-radius);
    overflow: hidden;
    cursor: pointer;
    -webkit-box-shadow:
      0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
      0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
    box-shadow:
      0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
      0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
    -webkit-transition: var(--transition);
    -o-transition: var(--transition);
    transition: var(--transition);
    position: relative;
  }

  .language-switch__stars-overlay {
    position: absolute;
    left: 1.2em;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.06em;
    z-index: 1;
    opacity: 0;
    -webkit-transition: opacity var(--transition);
    -o-transition: opacity var(--transition);
    transition: opacity var(--transition);
    width: 2em;
  }

  .language-switch__checkbox:checked
    + .language-switch__container
    .language-switch__stars-overlay {
    opacity: 1;
  }

  .language-switch__star-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    align-items: center;
    justify-items: center;
    width: 100%;
    height: 0.32em;
    gap: 0;
  }

  .language-switch__star {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.36em;
    color: white;
    line-height: 1;
    text-shadow: 0 0 0.08em rgba(255, 255, 255, 0.95);
    width: 100%;
    height: 100%;
  }

  .language-switch__space {
    display: block;
    width: 100%;
    height: 100%;
  }

  .language-switch__container::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    -webkit-box-shadow:
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset,
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
    box-shadow:
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset,
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
    border-radius: var(--container-radius);
  }

  .language-switch__checkbox {
    display: none;
  }

  .language-switch__checkbox:disabled + .language-switch__container {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .language-switch__circle-container {
    width: var(--circle-container-diameter);
    height: var(--circle-container-diameter);
    background-color: rgba(255, 255, 255, 0.1);
    position: absolute;
    --circle-offset: calc(
      (var(--circle-container-diameter) - var(--container-height)) / 2 * -1
    );
    left: var(--circle-offset);
    top: var(--circle-offset);
    border-radius: var(--container-radius);
    -webkit-box-shadow:
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      0 0 0 0.625em rgba(255, 255, 255, 0.1),
      0 0 0 1.25em rgba(255, 255, 255, 0.1);
    box-shadow:
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      0 0 0 0.625em rgba(255, 255, 255, 0.1),
      0 0 0 1.25em rgba(255, 255, 255, 0.1);
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-transition: var(--circle-transition);
    -o-transition: var(--circle-transition);
    transition: var(--circle-transition);
    pointer-events: none;
  }

  .language-switch__flag-container {
    pointer-events: auto;
    position: relative;
    z-index: 2;
    width: var(--flag-diameter);
    height: var(--flag-diameter);
    margin: auto;
    border-radius: var(--container-radius);
    background-color: var(--flag-bg);
    -webkit-box-shadow:
      0.062em 0.062em 0.062em 0em rgba(255, 255, 255, 0.61) inset,
      0em -0.062em 0.062em 0em rgba(0, 0, 0, 0.2) inset;
    box-shadow:
      0.062em 0.062em 0.062em 0em rgba(255, 255, 255, 0.61) inset,
      0em -0.062em 0.062em 0em rgba(0, 0, 0, 0.2) inset;
    -webkit-filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25))
      drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
    filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25))
      drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
    overflow: visible;
    -webkit-transition: var(--transition);
    -o-transition: var(--transition);
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .language-switch__flag {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition);
  }

  .language-switch__flag--active {
    opacity: 1;
  }

  .language-switch__flag-icon {
    font-size: 1.35em;
    line-height: 1;
  }

  /* English State (checked) */
  .language-switch__checkbox:checked + .language-switch__container {
    background-color: var(--container-en-bg);
  }

  .language-switch__checkbox:checked + .language-switch__container::after {
    opacity: 1;
  }

  .language-switch__checkbox:checked
    + .language-switch__container
    .language-switch__circle-container {
    left: calc(100% - var(--circle-offset) - var(--circle-container-diameter));
  }

  /* Hover Effects */
  .language-switch__circle-container:hover {
    left: calc(var(--circle-offset) + 0.187em);
  }

  .language-switch__checkbox:checked
    + .language-switch__container
    .language-switch__circle-container:hover {
    left: calc(
      100% - var(--circle-offset) - var(--circle-container-diameter) - 0.187em
    );
  }
`;

LanguageToggle.displayName = "LanguageToggle";

export { LanguageToggle };
