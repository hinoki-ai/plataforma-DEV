"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState, useRef, useEffect, useMemo } from "react";

type MeteorsProps = {
  number?: number;
  className?: string;
  containerClassName?: string;
};

export const Meteors = ({
  number = 20,
  className,
  containerClassName,
}: MeteorsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const [meteorSeeds] = useState(() =>
    Array.from({ length: number }).map((_, idx) => ({
      id: idx,
      duration: Math.floor(Math.random() * (10 - 5) + 5),
      delay: Math.random() * 5,
    })),
  );

  const meteors = useMemo(
    () =>
      meteorSeeds.map((meteor, idx) => ({
        ...meteor,
        position: idx * (containerWidth / number) - containerWidth / 2,
      })),
    [meteorSeeds, containerWidth, number],
  );
  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        containerClassName,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {meteors.map((meteor) => (
        <span
          key={`meteor-${meteor.id}`}
          className={cn(
            "absolute h-px w-px rotate-220 rounded-full bg-primary/55 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)] will-change-transform meteor-base",
            "before:absolute before:top-1/2 before:h-px before:w-[110px] before:-translate-y-1/2 before:bg-linear-to-r before:from-primary/70 before:via-primary/20 before:to-transparent before:content-['']",
            "dark:bg-primary/25 dark:shadow-[0_0_0_1px_hsl(var(--primary)/0.2)] dark:before:from-primary/45 dark:before:via-primary/12",
            className,
          )}
          style={
            {
              "--meteor-left": `${meteor.position}px`,
              animationDuration: `${meteor.duration}s`,
              animationDelay: `${meteor.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </motion.div>
  );
};
