/**
 * Automated accessibility testing with axe-core
 * Validates WCAG 2.1 AA compliance across the application
 */

import axe from "axe-core";

interface AccessibilityTestResult {
  violations: axe.Result[];
  passes: axe.Result[];
  incomplete: axe.Result[];
  timestamp: string;
  url: string;
}

interface TestConfiguration {
  rules?: Record<string, { enabled: boolean }>;
  tags?: string[];
  reporter?: "v1" | "v2" | "raw" | "raw-env";
}

/**
 * Run comprehensive accessibility tests on the current page
 */
export async function runAccessibilityTests(
  config: TestConfiguration = {},
): Promise<AccessibilityTestResult> {
  const defaultConfig: axe.RunOptions = {
    rules: {
      "color-contrast": { enabled: true },
      "landmark-one-main": { enabled: true },
      "page-has-heading-one": { enabled: true },
      region: { enabled: true },
      "focus-order-semantics": { enabled: true },
      keyboard: { enabled: true },
      label: { enabled: true },
      "form-field-multiple-labels": { enabled: true },
      "heading-order": { enabled: true },
      "aria-roles": { enabled: true },
      "aria-valid-attr-value": { enabled: true },
      "aria-required-attr": { enabled: true },
      "aria-required-children": { enabled: true },
      "aria-required-parent": { enabled: true },
      ...config.rules,
    },
    runOnly: {
      type: "tag",
      values: [
        "wcag2a",
        "wcag2aa",
        "wcag21aa",
        "best-practice",
        ...(config.tags || []),
      ],
    },
    reporter: config.reporter || "v2",
  };

  try {
    const results = await axe.run(document, defaultConfig);

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  } catch (error) {
    console.error("Accessibility testing failed:", error);
    throw new Error(`Accessibility testing failed: ${error}`);
  }
}

/**
 * Test specific components for accessibility issues
 */
export async function testComponent(
  component: HTMLElement,
  config: TestConfiguration = {},
): Promise<AccessibilityTestResult> {
  const defaultConfig: axe.RunOptions = {
    rules: {
      "color-contrast": { enabled: true },
      "focus-order-semantics": { enabled: true },
      keyboard: { enabled: true },
      label: { enabled: true },
      "aria-roles": { enabled: true },
      ...config.rules,
    },
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "best-practice", ...(config.tags || [])],
    },
    reporter: config.reporter || "v2",
  };

  try {
    const results = await axe.run(component, defaultConfig);

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  } catch (error) {
    console.error("Component accessibility testing failed:", error);
    throw new Error(`Component accessibility testing failed: ${error}`);
  }
}

/**
 * Generate a detailed accessibility report
 */
export function generateAccessibilityReport(
  results: AccessibilityTestResult,
): string {
  const { violations, passes, incomplete, timestamp, url } = results;

  let report = `
# Accessibility Test Report
**URL:** ${url}
**Timestamp:** ${timestamp}
**Standard:** WCAG 2.1 AA

## Summary
- **Violations:** ${violations.length}
- **Passes:** ${passes.length}
- **Incomplete:** ${incomplete.length}

## Violations
`;

  if (violations.length === 0) {
    report += "✅ No violations found!\n";
  } else {
    violations.forEach((violation, index) => {
      report += `
### ${index + 1}. ${violation.description}
- **Impact:** ${violation.impact}
- **Rule:** ${violation.id}
- **Help:** ${violation.help}
- **Nodes:** ${violation.nodes.length}

**Affected Elements:**
${violation.nodes.map((node) => `- ${node.target.join(", ")} - ${node.failureSummary || "No summary"}`).join("\n")}
`;
    });
  }

  if (incomplete.length > 0) {
    report += `
## Incomplete Tests
${incomplete.map((item) => `- ${item.description}`).join("\n")}
`;
  }

  report += `
## Passed Tests
${passes.length} accessibility checks passed successfully.
`;

  return report;
}

/**
 * Focusable element detection for keyboard navigation testing
 */
export function detectFocusableElements(
  container: HTMLElement = document.body,
): HTMLElement[] {
  const focusableSelectors = [
    "button:not([disabled])",
    'a[href]:not([tabindex="-1"])',
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]:not([disabled])',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(", ")));
}

/**
 * Test keyboard navigation flow
 */
export function testKeyboardNavigation(): {
  focusableElements: HTMLElement[];
  tabOrder: number[];
  issues: string[];
} {
  const focusableElements = detectFocusableElements();
  const tabOrder = focusableElements
    .map((el) => el.tabIndex)
    .filter((index) => index !== -1);
  const issues: string[] = [];

  // Check for negative tab indices that might break navigation
  focusableElements.forEach((element, index) => {
    if (element.tabIndex < 0 && element.offsetParent !== null) {
      issues.push(
        `Element ${element.tagName}${element.id ? `#${element.id}` : ""} has negative tab index but is visible`,
      );
    }
  });

  // Check for duplicate tab indices
  const tabIndices = focusableElements.map((el) => el.tabIndex);
  const duplicates = tabIndices.filter(
    (tabIndex, index) => tabIndices.indexOf(tabIndex) !== index && tabIndex > 0,
  );
  if (duplicates.length > 0) {
    issues.push(`Duplicate tab indices found: ${duplicates.join(", ")}`);
  }

  return {
    focusableElements,
    tabOrder,
    issues,
  };
}

/**
 * Color contrast testing utilities
 */
export function testColorContrast(elements: HTMLElement[]): Array<{
  element: HTMLElement;
  contrast: number;
  passes: boolean;
  foreground: string;
  background: string;
}> {
  const results = [];

  for (const element of elements) {
    const computedStyle = window.getComputedStyle(element);
    const foreground = computedStyle.color;
    const background = computedStyle.backgroundColor;

    // Calculate relative luminance and contrast ratio
    const contrast = calculateContrastRatio(foreground, background);
    const passes = contrast >= 4.5; // WCAG AA for normal text

    results.push({
      element,
      contrast,
      passes,
      foreground,
      background,
    });
  }

  return results;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(
  foreground: string,
  background: string,
): number {
  // Simplified implementation - in real usage, use a proper color library
  const parseColor = (color: string) => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
    return { r: 0, g: 0, b: 0 };
  };

  const fg = parseColor(foreground);
  const bg = parseColor(background);

  const getLuminance = (r: number, g: number, b: number) => {
    const sRGB = [r, g, b].map((val) => {
      val = val / 255;
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const L1 = getLuminance(fg.r, fg.g, fg.b);
  const L2 = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Browser integration
if (typeof window !== "undefined") {
  // Make accessibility testing available globally for development
  (window as any).accessibilityTest = {
    runTests: runAccessibilityTests,
    testComponent,
    generateReport: generateAccessibilityReport,
    testKeyboardNavigation,
    testColorContrast,
  };

  // Auto-run tests in development mode
  if (process.env.NODE_ENV === "development") {
    // Accessibility testing enabled in development
  }
}
