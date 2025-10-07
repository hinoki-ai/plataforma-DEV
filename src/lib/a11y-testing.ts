/**
 * Accessibility Testing Utilities
 * Automated accessibility validation and testing
 * Part of Stage 4.3: Accessibility & SEO Standardization
 */

import { UserRole } from "@/lib/prisma-compat-types";

export type ExtendedUserRole = UserRole;
export type ContextType = "public" | "auth" | "admin";

// WCAG Compliance Levels
export type WCAGLevel = "AA" | "AAA";

// Test Categories
export type A11yTestCategory =
  | "color-contrast"
  | "keyboard-navigation"
  | "screen-reader"
  | "focus-management"
  | "aria-labels"
  | "semantic-html"
  | "form-accessibility"
  | "image-alt-text"
  | "heading-structure"
  | "skip-links";

// Test Result Interface
export interface A11yTestResult {
  category: A11yTestCategory;
  passed: boolean;
  severity: "error" | "warning" | "info";
  message: string;
  element?: string;
  recommendation?: string;
  wcagReference?: string;
  context: ContextType;
  timestamp: Date;
}

// Test Configuration
export interface A11yTestConfig {
  level: WCAGLevel;
  context: ContextType;
  categories: A11yTestCategory[];
  skipTests?: A11yTestCategory[];
  customRules?: CustomA11yRule[];
}

// Custom Rule Interface
export interface CustomA11yRule {
  id: string;
  name: string;
  category: A11yTestCategory;
  test: (element: Element) => A11yTestResult | null;
  context?: ContextType[];
}

// Color Contrast Standards
const COLOR_CONTRAST_RATIOS = {
  AA: {
    normal: 4.5,
    large: 3.0,
  },
  AAA: {
    normal: 7.0,
    large: 4.5,
  },
};

/**
 * Main accessibility testing function
 */
export async function runA11yTests(
  element: Element = document.body,
  config: Partial<A11yTestConfig> = {},
): Promise<A11yTestResult[]> {
  const fullConfig: A11yTestConfig = {
    level: "AA",
    context: detectContext(),
    categories: [
      "color-contrast",
      "keyboard-navigation",
      "screen-reader",
      "focus-management",
      "aria-labels",
      "semantic-html",
      "form-accessibility",
      "image-alt-text",
      "heading-structure",
      "skip-links",
    ],
    ...config,
  };

  const results: A11yTestResult[] = [];

  // Run each test category
  for (const category of fullConfig.categories) {
    if (fullConfig.skipTests?.includes(category)) continue;

    try {
      const categoryResults = await runTestCategory(
        category,
        element,
        fullConfig,
      );
      results.push(...categoryResults);
    } catch (error) {
      results.push({
        category,
        passed: false,
        severity: "error",
        message: `Test execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        context: fullConfig.context,
        timestamp: new Date(),
      });
    }
  }

  // Run custom rules
  if (fullConfig.customRules) {
    for (const rule of fullConfig.customRules) {
      if (!rule.context || rule.context.includes(fullConfig.context)) {
        try {
          const result = rule.test(element);
          if (result) results.push(result);
        } catch (error) {
          results.push({
            category: rule.category,
            passed: false,
            severity: "error",
            message: `Custom rule "${rule.name}" failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            context: fullConfig.context,
            timestamp: new Date(),
          });
        }
      }
    }
  }

  return results;
}

/**
 * Run tests for a specific category
 */
async function runTestCategory(
  category: A11yTestCategory,
  element: Element,
  config: A11yTestConfig,
): Promise<A11yTestResult[]> {
  switch (category) {
    case "color-contrast":
      return testColorContrast(element, config);
    case "keyboard-navigation":
      return testKeyboardNavigation(element, config);
    case "screen-reader":
      return testScreenReaderSupport(element, config);
    case "focus-management":
      return testFocusManagement(element, config);
    case "aria-labels":
      return testAriaLabels(element, config);
    case "semantic-html":
      return testSemanticHtml(element, config);
    case "form-accessibility":
      return testFormAccessibility(element, config);
    case "image-alt-text":
      return testImageAltText(element, config);
    case "heading-structure":
      return testHeadingStructure(element, config);
    case "skip-links":
      return testSkipLinks(element, config);
    default:
      return [];
  }
}

/**
 * Test color contrast ratios
 */
function testColorContrast(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];
  const textElements = element.querySelectorAll("*");

  textElements.forEach((el) => {
    const computedStyle = window.getComputedStyle(el);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    if (
      color &&
      backgroundColor &&
      color !== "rgba(0, 0, 0, 0)" &&
      backgroundColor !== "rgba(0, 0, 0, 0)"
    ) {
      const contrast = calculateContrastRatio(color, backgroundColor);
      const fontSize = parseFloat(computedStyle.fontSize);
      const fontWeight = computedStyle.fontWeight;

      const isLargeText =
        fontSize >= 18 ||
        (fontSize >= 14 &&
          (fontWeight === "bold" || parseInt(fontWeight) >= 700));
      const requiredRatio =
        COLOR_CONTRAST_RATIOS[config.level][isLargeText ? "large" : "normal"];

      const passed = contrast >= requiredRatio;

      if (!passed) {
        results.push({
          category: "color-contrast",
          passed: false,
          severity:
            contrast <
            COLOR_CONTRAST_RATIOS.AA[isLargeText ? "large" : "normal"]
              ? "error"
              : "warning",
          message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
          element: getElementSelector(el),
          recommendation: `Increase contrast to at least ${requiredRatio}:1 for WCAG ${config.level} compliance`,
          wcagReference: config.level === "AAA" ? "WCAG 1.4.6" : "WCAG 1.4.3",
          context: config.context,
          timestamp: new Date(),
        });
      }
    }
  });

  return results;
}

/**
 * Test keyboard navigation
 */
function testKeyboardNavigation(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];
  const interactiveElements = element.querySelectorAll(
    'a, button, input, select, textarea, [tabindex], [role="button"], [role="link"]',
  );

  interactiveElements.forEach((el) => {
    const tabIndex = el.getAttribute("tabindex");

    // Check for positive tabindex (anti-pattern)
    if (tabIndex && parseInt(tabIndex) > 0) {
      results.push({
        category: "keyboard-navigation",
        passed: false,
        severity: "warning",
        message: "Positive tabindex detected (anti-pattern)",
        element: getElementSelector(el),
        recommendation:
          'Use tabindex="0" or remove tabindex to maintain natural tab order',
        wcagReference: "WCAG 2.4.3",
        context: config.context,
        timestamp: new Date(),
      });
    }

    // Check for keyboard event handlers
    const hasClickHandler = el.getAttribute("onclick") || el.addEventListener;
    const hasKeyHandler =
      el.getAttribute("onkeydown") || el.getAttribute("onkeypress");

    if (
      hasClickHandler &&
      !hasKeyHandler &&
      el.tagName !== "BUTTON" &&
      el.tagName !== "A"
    ) {
      results.push({
        category: "keyboard-navigation",
        passed: false,
        severity: "error",
        message: "Interactive element lacks keyboard event handler",
        element: getElementSelector(el),
        recommendation:
          "Add keyboard event handlers (onKeyDown/onKeyPress) for non-button/non-link interactive elements",
        wcagReference: "WCAG 2.1.1",
        context: config.context,
        timestamp: new Date(),
      });
    }
  });

  return results;
}

/**
 * Test screen reader support
 */
function testScreenReaderSupport(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];

  // Check for screen reader only content
  const srOnlyElements = element.querySelectorAll(
    ".sr-only, .screen-reader-text",
  );

  // Check for context-appropriate skip links
  if (config.context === "auth" || config.context === "admin") {
    const skipLinks = element.querySelectorAll('a[href^="#"]');
    const hasMainSkipLink = Array.from(skipLinks).some(
      (link) =>
        link.textContent?.toLowerCase().includes("skip to main") ||
        link.textContent?.toLowerCase().includes("skip to content"),
    );

    if (!hasMainSkipLink) {
      results.push({
        category: "screen-reader",
        passed: false,
        severity: "warning",
        message: "Missing skip to main content link",
        recommendation:
          "Add skip link for productivity users in authenticated contexts",
        wcagReference: "WCAG 2.4.1",
        context: config.context,
        timestamp: new Date(),
      });
    }
  }

  return results;
}

/**
 * Test focus management
 */
function testFocusManagement(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  // Check for focus indicators
  focusableElements.forEach((el) => {
    const computedStyle = window.getComputedStyle(el, ":focus");
    const outline = computedStyle.outline;
    const boxShadow = computedStyle.boxShadow;

    if (outline === "none" && !boxShadow.includes("inset")) {
      results.push({
        category: "focus-management",
        passed: false,
        severity: "error",
        message: "Focusable element lacks visible focus indicator",
        element: getElementSelector(el),
        recommendation:
          "Add visible focus indicator using outline or box-shadow",
        wcagReference: "WCAG 2.4.7",
        context: config.context,
        timestamp: new Date(),
      });
    }
  });

  return results;
}

/**
 * Test ARIA labels and attributes
 */
function testAriaLabels(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];

  // Check for missing aria-labels on interactive elements without text content
  const interactiveElements = element.querySelectorAll(
    'button, a, input[type="button"], input[type="submit"]',
  );

  interactiveElements.forEach((el) => {
    const hasTextContent = (el.textContent?.trim().length ?? 0) > 0;
    const hasAriaLabel = el.getAttribute("aria-label");
    const hasAriaLabelledBy = el.getAttribute("aria-labelledby");
    const hasTitle = el.getAttribute("title");

    if (!hasTextContent && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
      results.push({
        category: "aria-labels",
        passed: false,
        severity: "error",
        message: "Interactive element lacks accessible name",
        element: getElementSelector(el),
        recommendation:
          "Add aria-label, aria-labelledby, or visible text content",
        wcagReference: "WCAG 4.1.2",
        context: config.context,
        timestamp: new Date(),
      });
    }
  });

  return results;
}

/**
 * Test semantic HTML usage
 */
function testSemanticHtml(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];

  // Check for proper landmark usage
  const hasMain = element.querySelector("main");
  const hasNav = element.querySelector("nav");
  const hasHeader = element.querySelector("header");

  if (!hasMain) {
    results.push({
      category: "semantic-html",
      passed: false,
      severity: "warning",
      message: "Missing main landmark element",
      recommendation: "Add <main> element to identify main content area",
      wcagReference: "WCAG 1.3.1",
      context: config.context,
      timestamp: new Date(),
    });
  }

  return results;
}

/**
 * Test form accessibility
 */
function testFormAccessibility(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];
  const formElements = element.querySelectorAll("input, select, textarea");

  formElements.forEach((el) => {
    const id = el.getAttribute("id");
    const ariaLabelledBy = el.getAttribute("aria-labelledby");
    const ariaLabel = el.getAttribute("aria-label");

    // Check for associated label
    const associatedLabel = id && element.querySelector(`label[for="${id}"]`);

    if (!associatedLabel && !ariaLabelledBy && !ariaLabel) {
      results.push({
        category: "form-accessibility",
        passed: false,
        severity: "error",
        message: "Form control lacks associated label",
        element: getElementSelector(el),
        recommendation:
          "Add <label> element with for attribute, aria-labelledby, or aria-label",
        wcagReference: "WCAG 3.3.2",
        context: config.context,
        timestamp: new Date(),
      });
    }
  });

  return results;
}

/**
 * Test image alt text
 */
function testImageAltText(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];
  const images = element.querySelectorAll("img");

  images.forEach((img) => {
    const alt = img.getAttribute("alt");
    const role = img.getAttribute("role");

    if (alt === null) {
      results.push({
        category: "image-alt-text",
        passed: false,
        severity: "error",
        message: "Image missing alt attribute",
        element: getElementSelector(img),
        recommendation:
          'Add alt attribute with descriptive text or empty alt="" for decorative images',
        wcagReference: "WCAG 1.1.1",
        context: config.context,
        timestamp: new Date(),
      });
    } else if (role === "presentation" && alt !== "") {
      results.push({
        category: "image-alt-text",
        passed: false,
        severity: "warning",
        message: "Decorative image has non-empty alt text",
        element: getElementSelector(img),
        recommendation:
          'Use alt="" for decorative images or remove role="presentation"',
        wcagReference: "WCAG 1.1.1",
        context: config.context,
        timestamp: new Date(),
      });
    }
  });

  return results;
}

/**
 * Test heading structure
 */
function testHeadingStructure(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];
  const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");

  let previousLevel = 0;

  headings.forEach((heading) => {
    const currentLevel = parseInt(heading.tagName.substring(1));

    if (currentLevel > previousLevel + 1) {
      results.push({
        category: "heading-structure",
        passed: false,
        severity: "warning",
        message: `Heading level skipped: ${heading.tagName} follows h${previousLevel}`,
        element: getElementSelector(heading),
        recommendation:
          "Use sequential heading levels (h1, h2, h3, etc.) without skipping",
        wcagReference: "WCAG 1.3.1",
        context: config.context,
        timestamp: new Date(),
      });
    }

    previousLevel = currentLevel;
  });

  return results;
}

/**
 * Test skip links
 */
function testSkipLinks(
  element: Element,
  config: A11yTestConfig,
): A11yTestResult[] {
  const results: A11yTestResult[] = [];

  // Skip links are especially important in auth/admin contexts
  if (config.context === "auth" || config.context === "admin") {
    const skipLinks = element.querySelectorAll('a[href^="#"]:first-child');

    if (skipLinks.length === 0) {
      results.push({
        category: "skip-links",
        passed: false,
        severity: "warning",
        message: "Missing skip navigation links",
        recommendation:
          "Add skip links at beginning of page for keyboard users",
        wcagReference: "WCAG 2.4.1",
        context: config.context,
        timestamp: new Date(),
      });
    }
  }

  return results;
}

// Utility functions

function detectContext(): ContextType {
  const pathname = window.location.pathname;

  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/(main)") || pathname.includes("/dashboard"))
    return "auth";
  return "public";
}

function getElementSelector(element: Element): string {
  if (element.id) return `#${element.id}`;
  if (element.className) return `.${Array.from(element.classList).join(".")}`;
  return element.tagName.toLowerCase();
}

function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want a more robust color parsing library
  const getLuminance = (color: string) => {
    // This is a simplified version - you'd want to properly parse RGB values
    // and calculate relative luminance according to WCAG guidelines
    return 0.5; // Placeholder
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate accessibility report
 */
export function generateA11yReport(results: A11yTestResult[]): {
  summary: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    warnings: number;
    complianceLevel: WCAGLevel | "Non-compliant";
  };
  byCategory: Record<A11yTestCategory, A11yTestResult[]>;
  recommendations: string[];
} {
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    errors: results.filter((r) => r.severity === "error").length,
    warnings: results.filter((r) => r.severity === "warning").length,
    complianceLevel: "Non-compliant" as WCAGLevel | "Non-compliant",
  };

  // Determine compliance level
  if (summary.errors === 0) {
    if (summary.warnings === 0) {
      summary.complianceLevel = "AAA";
    } else {
      summary.complianceLevel = "AA";
    }
  } else if (summary.errors <= summary.total * 0.1) {
    summary.complianceLevel = "AA";
  }

  const byCategory = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) acc[result.category] = [];
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<A11yTestCategory, A11yTestResult[]>,
  );

  const recommendations = Array.from(
    new Set(
      results.filter((r) => r.recommendation).map((r) => r.recommendation!),
    ),
  );

  return { summary, byCategory, recommendations };
}

/**
 * Context-specific accessibility guidelines
 */
export const CONTEXT_A11Y_GUIDELINES = {
  public: {
    priority: ["color-contrast", "image-alt-text", "keyboard-navigation"],
    description: "Focus on visual accessibility and engaging interactions",
  },
  auth: {
    priority: [
      "keyboard-navigation",
      "focus-management",
      "skip-links",
      "form-accessibility",
    ],
    description: "Optimize for productivity and efficient navigation",
  },
  admin: {
    priority: [
      "keyboard-navigation",
      "focus-management",
      "aria-labels",
      "form-accessibility",
    ],
    description: "Ensure comprehensive administrative interface accessibility",
  },
} as const;
