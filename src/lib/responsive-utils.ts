import { clsx } from "clsx";

/**
 * Responsive class utility that respects desktop toggle
 * @param mobileClasses - Classes to apply on mobile
 * @param desktopClasses - Classes to apply on desktop
 * @param isDesktopForced - Whether desktop mode is forced
 * @returns Combined class string
 */
export function responsiveClasses(
  mobileClasses: string,
  desktopClasses: string,
  isDesktopForced: boolean = false,
): string {
  if (isDesktopForced) {
    // When desktop is forced, always use desktop classes
    return desktopClasses;
  }

  // Normal responsive behavior: mobile first, then desktop overrides
  return clsx(mobileClasses, desktopClasses);
}

/**
 * Conditional classes based on responsive mode
 * @param condition - When to apply the classes
 * @param classes - Classes to apply when condition is true
 * @returns Class string or empty string
 */
export function conditionalClasses(
  condition: boolean,
  classes: string,
): string {
  return condition ? classes : "";
}

/**
 * Typography responsive classes with desktop override
 */
export const typography = {
  hero: (isDesktopForced: boolean = false) =>
    responsiveClasses(
      "text-3xl sm:text-4xl",
      "md:text-5xl lg:text-6xl",
      isDesktopForced,
    ),

  heading: (isDesktopForced: boolean = false) =>
    responsiveClasses(
      "text-2xl sm:text-3xl",
      "md:text-4xl lg:text-5xl",
      isDesktopForced,
    ),

  subheading: (isDesktopForced: boolean = false) =>
    responsiveClasses(
      "text-lg sm:text-xl",
      "md:text-2xl lg:text-3xl",
      isDesktopForced,
    ),

  body: (isDesktopForced: boolean = false) =>
    responsiveClasses("text-sm sm:text-base", "md:text-lg", isDesktopForced),
};

/**
 * Layout responsive classes with desktop override
 */
export const layout = {
  container: (isDesktopForced: boolean = false) =>
    responsiveClasses(
      "container mx-auto px-4",
      "sm:px-6 lg:px-8",
      isDesktopForced,
    ),

  grid: {
    cards: (isDesktopForced: boolean = false) =>
      responsiveClasses(
        "grid grid-cols-1",
        "sm:grid-cols-2 lg:grid-cols-3",
        isDesktopForced,
      ),

    form: (isDesktopForced: boolean = false) =>
      responsiveClasses(
        "grid grid-cols-1 gap-4",
        "lg:grid-cols-2 sm:gap-6",
        isDesktopForced,
      ),

    planning: (isDesktopForced: boolean = false) =>
      responsiveClasses(
        "grid grid-cols-1 gap-4",
        "sm:grid-cols-2 xl:grid-cols-3 sm:gap-6",
        isDesktopForced,
      ),
  },

  spacing: {
    section: (isDesktopForced: boolean = false) =>
      responsiveClasses("py-8 sm:py-12", "lg:py-16", isDesktopForced),

    component: (isDesktopForced: boolean = false) =>
      responsiveClasses("p-4 sm:p-6", "lg:p-8", isDesktopForced),
  },
};

/**
 * Navigation responsive classes with desktop override
 */
export const navigation = {
  logo: (isDesktopForced: boolean = false) =>
    responsiveClasses("text-lg sm:text-xl", "md:text-2xl", isDesktopForced),

  menu: {
    desktop: (isDesktopForced: boolean = false) =>
      conditionalClasses(isDesktopForced, "flex items-center space-x-6") ||
      "hidden md:flex items-center space-x-6",

    mobile: (isDesktopForced: boolean = false) =>
      conditionalClasses(
        !isDesktopForced,
        "md:hidden flex items-center space-x-4",
      ) ||
      (isDesktopForced ? "hidden" : "md:hidden flex items-center space-x-4"),
  },
};

/**
 * Form responsive classes with desktop override
 */
export const forms = {
  input: (isDesktopForced: boolean = false) =>
    responsiveClasses("h-10 text-sm", "sm:h-12 sm:text-base", isDesktopForced),

  button: (isDesktopForced: boolean = false) =>
    responsiveClasses(
      "h-10 px-4 text-sm",
      "sm:h-12 sm:px-6 sm:text-base",
      isDesktopForced,
    ),

  textarea: (isDesktopForced: boolean = false) =>
    responsiveClasses(
      "min-h-[120px] text-sm",
      "sm:min-h-[160px] sm:text-base",
      isDesktopForced,
    ),
};
