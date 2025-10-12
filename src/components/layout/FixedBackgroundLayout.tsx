"use client";

import React from "react";
import {
  PageTransition,
  PageTransitionProps,
} from "@/components/ui/page-transition";

export interface FixedBackgroundLayoutProps {
  children: React.ReactNode;
  backgroundImage: string;
  overlayType?: "gradient" | "solid" | "none";
  responsivePositioning?: "homepage" | "default" | "custom";
  customOverlay?: string;
  pageTransitionProps?: Partial<PageTransitionProps>;
  className?: string;
}

export function FixedBackgroundLayout({
  children,
  backgroundImage,
  overlayType = "gradient",
  responsivePositioning = "homepage",
  customOverlay,
  pageTransitionProps = {
    skeletonType: "homepage",
    duration: 700,
    enableProgressiveAnimation: true,
  },
  className = "",
}: FixedBackgroundLayoutProps) {
  // Generate overlay CSS based on type
  const getOverlayStyle = () => {
    switch (overlayType) {
      case "gradient":
        return "bg-gradient-to-b from-black/30 via-black/20 to-black/40";
      case "solid":
        return "bg-black/40";
      case "none":
        return "";
      default:
        return (
          customOverlay ||
          "bg-gradient-to-b from-black/30 via-black/20 to-black/40"
        );
    }
  };

  // Dynamic background classes
  const backgroundClasses = [
    "bg-responsive-desktop",
    responsivePositioning === "custom"
      ? "bg-position-center"
      : "bg-position-center-5",
  ].join(" ");

  return (
    <PageTransition {...pageTransitionProps}>
      <div
        className={`relative min-h-screen ${backgroundClasses} bg-variable ${className}`}
        style={
          { "--bg-image": `url(${backgroundImage})` } as React.CSSProperties
        }
      >
        {/* Overlay layer (non-fixed, matches homepage) */}
        {overlayType !== "none" && (
          <div className={`absolute inset-0 ${getOverlayStyle()}`} />
        )}

        {/* Content layer */}
        <div className="relative z-10">{children}</div>
      </div>
    </PageTransition>
  );
}

export default FixedBackgroundLayout;
