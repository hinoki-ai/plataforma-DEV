'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export type TypographyContext = 'public' | 'auth' | 'auto';

/**
 * Adaptive typography variants based on context
 */
const adaptiveTypographyVariants = cva('', {
  variants: {
    context: {
      public: '',
      auth: '',
      auto: '',
    },
    type: {
      h1: '',
      h2: '',
      h3: '',
      h4: '',
      body: '',
      subtitle: '',
      caption: '',
      muted: '',
    },
  },
  compoundVariants: [
    // Public context typography - Large, bold, emotional
    {
      context: 'public',
      type: 'h1',
      class:
        'text-white font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight',
    },
    {
      context: 'public',
      type: 'h2',
      class:
        'text-white font-bold text-2xl md:text-3xl lg:text-4xl leading-tight',
    },
    {
      context: 'public',
      type: 'h3',
      class:
        'text-white font-semibold text-xl md:text-2xl lg:text-3xl leading-snug',
    },
    {
      context: 'public',
      type: 'h4',
      class: 'text-white font-semibold text-lg md:text-xl lg:text-2xl',
    },
    {
      context: 'public',
      type: 'body',
      class: 'text-white text-base md:text-lg lg:text-xl leading-relaxed',
    },
    {
      context: 'public',
      type: 'subtitle',
      class: 'text-gray-200 text-lg md:text-xl lg:text-2xl font-medium',
    },
    {
      context: 'public',
      type: 'caption',
      class: 'text-gray-300 text-sm md:text-base',
    },
    {
      context: 'public',
      type: 'muted',
      class: 'text-gray-400 text-sm md:text-base',
    },

    // Auth context typography - Professional hierarchy, information density
    {
      context: 'auth',
      type: 'h1',
      class:
        'text-foreground font-semibold text-2xl md:text-3xl lg:text-4xl leading-tight',
    },
    {
      context: 'auth',
      type: 'h2',
      class:
        'text-foreground font-semibold text-xl md:text-2xl lg:text-3xl leading-tight',
    },
    {
      context: 'auth',
      type: 'h3',
      class:
        'text-foreground font-medium text-lg md:text-xl lg:text-2xl leading-snug',
    },
    {
      context: 'auth',
      type: 'h4',
      class: 'text-foreground font-medium text-base md:text-lg lg:text-xl',
    },
    {
      context: 'auth',
      type: 'body',
      class: 'text-foreground text-sm md:text-base leading-normal',
    },
    {
      context: 'auth',
      type: 'subtitle',
      class: 'text-muted-foreground text-base md:text-lg font-medium',
    },
    {
      context: 'auth',
      type: 'caption',
      class: 'text-muted-foreground text-xs md:text-sm',
    },
    {
      context: 'auth',
      type: 'muted',
      class: 'text-muted-foreground/70 text-xs md:text-sm',
    },
  ],
});

export interface AdaptiveTypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof adaptiveTypographyVariants> {
  /**
   * Context override - auto-detects by default
   */
  context?: TypographyContext;
  /**
   * Typography type/level
   */
  type: NonNullable<VariantProps<typeof adaptiveTypographyVariants>['type']>;
  /**
   * HTML element to render as
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

/**
 * Base Adaptive Typography Component
 */
const AdaptiveTypography = React.forwardRef<
  HTMLElement,
  AdaptiveTypographyProps
>(({ className, context = 'auto', type, as, ...props }, ref) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Auto-detect context based on route and session
  const detectedContext: Exclude<TypographyContext, 'auto'> =
    context !== 'auto'
      ? context
      : session &&
          (pathname?.startsWith('/admin') ||
            pathname?.startsWith('/profesor') ||
            pathname?.startsWith('/parent'))
        ? 'auth'
        : 'public';

  // Default element mapping
  const defaultElementMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    subtitle: 'p',
    caption: 'span',
    muted: 'span',
  } as const;

  const Element = as || defaultElementMap[type] || 'p';

  return React.createElement(Element, {
    ref,
    className: cn(
      adaptiveTypographyVariants({ context: detectedContext, type }),
      className
    ),
    ...props,
  });
});

AdaptiveTypography.displayName = 'AdaptiveTypography';

/**
 * Pre-configured typography components
 */

/**
 * Adaptive H1 - Large, emotional headlines for public; professional headlines for auth
 */
export const AdaptiveH1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="h1" as="h1" {...props} />
));
AdaptiveH1.displayName = 'AdaptiveH1';

/**
 * Adaptive H2 - Section headers with context-appropriate sizing
 */
export const AdaptiveH2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="h2" as="h2" {...props} />
));
AdaptiveH2.displayName = 'AdaptiveH2';

/**
 * Adaptive H3 - Subsection headers
 */
export const AdaptiveH3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="h3" as="h3" {...props} />
));
AdaptiveH3.displayName = 'AdaptiveH3';

/**
 * Adaptive H4 - Minor headers
 */
export const AdaptiveH4 = React.forwardRef<
  HTMLHeadingElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="h4" as="h4" {...props} />
));
AdaptiveH4.displayName = 'AdaptiveH4';

/**
 * Adaptive P - Body text with context-appropriate sizing and leading
 */
export const AdaptiveP = React.forwardRef<
  HTMLParagraphElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="body" as="p" {...props} />
));
AdaptiveP.displayName = 'AdaptiveP';

/**
 * Adaptive Subtitle - Supporting text for headers
 */
export const AdaptiveSubtitle = React.forwardRef<
  HTMLParagraphElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="subtitle" as="p" {...props} />
));
AdaptiveSubtitle.displayName = 'AdaptiveSubtitle';

/**
 * Adaptive Caption - Small descriptive text
 */
export const AdaptiveCaption = React.forwardRef<
  HTMLSpanElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="caption" as="span" {...props} />
));
AdaptiveCaption.displayName = 'AdaptiveCaption';

/**
 * Adaptive Muted - Very subtle supporting text
 */
export const AdaptiveMuted = React.forwardRef<
  HTMLSpanElement,
  Omit<AdaptiveTypographyProps, 'type' | 'as'>
>((props, ref) => (
  <AdaptiveTypography ref={ref} type="muted" as="span" {...props} />
));
AdaptiveMuted.displayName = 'AdaptiveMuted';

/**
 * Utility function to get typography classes based on context
 */
export function getAdaptiveTypographyStyles(
  type: NonNullable<VariantProps<typeof adaptiveTypographyVariants>['type']>,
  context: TypographyContext = 'auto',
  pathname?: string,
  session?: any
): string {
  const detectedContext =
    context !== 'auto'
      ? context
      : session &&
          (pathname?.startsWith('/admin') ||
            pathname?.startsWith('/profesor') ||
            pathname?.startsWith('/parent'))
        ? 'auth'
        : 'public';

  return adaptiveTypographyVariants({ context: detectedContext, type });
}

export { AdaptiveTypography, adaptiveTypographyVariants };
