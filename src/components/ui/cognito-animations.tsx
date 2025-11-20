"use client";

import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";

/**
 * Advanced Animation System for Cognito
 * Provides sophisticated micro-interactions and visual feedback
 */

export interface CognitoAnimationProps {
  children: React.ReactNode;
  variant?: "idle" | "thinking" | "excited" | "helpful" | "celebrating";
  isHovered?: boolean;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

// Cognito's personality-based animations
export const cognitoAnimations = {
  idle: {
    y: [0, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  thinking: {
    rotate: [0, -5, 5, -3, 3, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  excited: {
    y: [0, -8, 0],
    rotate: [0, -10, 10, -5, 5, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeOut" as const,
    },
  },
  helpful: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  celebrating: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    transition: {
      duration: 1,
      ease: "easeOut" as const,
    },
  },
};

// Particle effect for celebrations
export function CelebrationParticles({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: i * 30 * (Math.PI / 180),
    delay: i * 0.1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: Math.cos(particle.angle) * 60,
            y: Math.sin(particle.angle) * 60,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Typing indicator with advanced animation
export function TypingIndicator({ isTyping }: { isTyping: boolean }) {
  if (!isTyping) return null;

  return (
    <motion.div
      className="flex items-center space-x-1 p-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <span className="text-xs text-gray-500">Cogníto is typing</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-blue-500 rounded-full"
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Magnetic hover effect for buttons
export function MagneticButton({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Floating animation with physics
export function FloatingElement({
  children,
  intensity = 1,
  speed = 1,
}: {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      animate={{
        y: [0, -intensity * 2, 0],
        rotate: isHovered ? [0, 2, -2, 0] : 0,
      }}
      transition={{
        y: {
          duration: 3 / speed,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 0.5,
          ease: "easeInOut",
        },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        transform: isHovered
          ? `translateY(${(mousePosition.y - window.innerHeight / 2) * 0.01}px)`
          : "none",
      }}
    >
      {children}
    </motion.div>
  );
}

// Ripple effect for button clicks
export function RippleButton({
  children,
  onClick,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  [key: string]: any;
}) {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const handleClick = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full"
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
            opacity: 0.6,
          }}
          animate={{
            width: 100,
            height: 100,
            x: ripple.x - 50,
            y: ripple.y - 50,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          style={{
            pointerEvents: "none",
          }}
        />
      ))}
    </button>
  );
}

// Success animation with checkmark
export function SuccessAnimation({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <motion.div
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.path
            d="M20 6L9 17L4 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

// Pulse notification indicator
export function PulseNotification({
  hasNotification,
}: {
  hasNotification: boolean;
}) {
  if (!hasNotification) return null;

  return (
    <motion.div
      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Morphing blob background
export function MorphingBackground({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <motion.div
      className="absolute inset-0 opacity-10 pointer-events-none"
      animate={{
        background: [
          "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
          "radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
          "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Main Cognito animation component
export function CognitoAnimated({
  children,
  variant = "idle",
  isHovered = false,
  isActive = false,
  size = "md",
}: CognitoAnimationProps) {
  const controls = useAnimation();
  const [currentVariant, setCurrentVariant] = useState(variant);

  useEffect(() => {
    if (isHovered) {
      setCurrentVariant("excited");
    } else if (isActive) {
      setCurrentVariant("helpful");
    } else {
      setCurrentVariant(variant);
    }
  }, [variant, isHovered, isActive]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]}`}
      animate={cognitoAnimations[currentVariant]}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <CelebrationParticles isActive={currentVariant === "celebrating"} />
      {children}
      <PulseNotification hasNotification={isActive} />
    </motion.div>
  );
}

// Import useSpring for magnetic effect
import { useSpring } from "motion/react";
