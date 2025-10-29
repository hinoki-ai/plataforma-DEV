/**
 * SEO Generator - Enhanced Meta/SEO Handling
 * Context-aware SEO optimization for public and authenticated pages
 * Part of Stage 4.3: Accessibility & SEO Standardization
 */

import { Metadata } from "next";
import { UserRole } from "@/lib/prisma-compat-types";

export type ExtendedUserRole = UserRole;
export type ContextType = "public" | "auth" | "admin";

export interface SEOOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  alternates?: {
    languages?: Record<string, string>;
  };
  openGraph?: {
    type?: "website" | "article" | "profile";
    siteName?: string;
    locale?: string;
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    site?: string;
    creator?: string;
  };
  structuredData?: Record<string, any>;
}

const DEFAULT_CONFIG = {
  siteName: "Plataforma Astral - Sistema Educativo",
  domain: "https://plataforma.aramac.dev",
  defaultImage: "/og-image.jpg",
  twitter: "@plataforma-astral",
  keywords: [
    "jardín infantil",
    "educación inicial",
    "manitos pintadas",
    "equipo multidisciplinario",
    "centro y consejo",
    "proyecto educativo",
  ],
};

/**
 * Generate comprehensive metadata for any context
 */
export function generateMetadata(
  context: ContextType,
  options: SEOOptions,
): Metadata {
  const baseUrl = DEFAULT_CONFIG.domain;
  const siteName = DEFAULT_CONFIG.siteName;

  // Context-specific optimizations
  const contextOptimizations = getContextOptimizations(context);

  const metadata: Metadata = {
    title: options.title,
    description: options.description,
    keywords: [...DEFAULT_CONFIG.keywords, ...(options.keywords || [])],

    // Robots configuration per context
    robots: {
      index: !options.noIndex && contextOptimizations.allowIndexing,
      follow: contextOptimizations.allowFollow,
      googleBot: {
        index: !options.noIndex && contextOptimizations.allowIndexing,
        follow: contextOptimizations.allowFollow,
        "max-snippet": contextOptimizations.maxSnippet,
        "max-image-preview":
          (contextOptimizations.maxImagePreview as
            | "none"
            | "large"
            | "standard") || "large",
        "max-video-preview": contextOptimizations.maxVideoPreview,
      },
    },

    // Open Graph
    openGraph: {
      type: options.openGraph?.type || "website",
      siteName: options.openGraph?.siteName || siteName,
      title: options.title,
      description: options.description,
      url: options.canonical || baseUrl,
      images: [
        {
          url: options.image || DEFAULT_CONFIG.defaultImage,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
      locale: options.openGraph?.locale || "es_CL",
    },

    // Twitter/X Cards
    twitter: {
      card: options.twitter?.card || "summary_large_image",
      site: options.twitter?.site || DEFAULT_CONFIG.twitter,
      creator: options.twitter?.creator || DEFAULT_CONFIG.twitter,
      title: options.title,
      description: options.description,
      images: [options.image || DEFAULT_CONFIG.defaultImage],
    },

    // Canonical URL
    alternates: {
      canonical: options.canonical,
      languages: options.alternates?.languages,
    },

    // Verification tags
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: {
        "facebook-domain-verification":
          process.env.FACEBOOK_DOMAIN_VERIFICATION || "",
      },
    },

    // Additional context-specific metadata
    ...contextOptimizations.additionalMeta,
  };

  return metadata;
}

/**
 * Quick metadata generator for public pages
 */
export function generatePublicPageMetadata(options: {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  canonical?: string;
}): Metadata {
  return generateMetadata("public", {
    ...options,
    keywords: [
      ...DEFAULT_CONFIG.keywords,
      "información pública",
      "comunidad educativa",
      ...(options.keywords || []),
    ],
    openGraph: {
      type: "website",
      siteName: DEFAULT_CONFIG.siteName,
    },
    twitter: {
      card: "summary_large_image",
    },
  });
}

/**
 * Quick metadata generator for authenticated pages
 */
export function generateAuthPageMetadata(
  role: ExtendedUserRole,
  options: {
    title: string;
    description: string;
    noIndex?: boolean;
  },
): Metadata {
  return generateMetadata("auth", {
    ...options,
    noIndex: options.noIndex ?? true, // Default to no-index for auth pages
    keywords: [
      "panel de control",
      "gestión educativa",
      "sistema interno",
      getRoleKeywords(role),
    ].flat(),
    openGraph: {
      type: "website",
      siteName: `${DEFAULT_CONFIG.siteName} - Panel de Control`,
    },
    twitter: {
      card: "summary",
    },
  });
}

/**
 * Generate role-specific dashboard metadata
 */
export function generateDashboardMetadata(role: ExtendedUserRole): Metadata {
  const roleData = getRoleData(role);

  return generateAuthPageMetadata(role, {
    title: `Dashboard ${roleData.title} - ${DEFAULT_CONFIG.siteName}`,
    description: `Panel de control para ${roleData.description}. Gestiona ${roleData.capabilities.join(", ")}.`,
    noIndex: true,
  });
}

/**
 * Generate calendar-specific metadata
 */
export function generateCalendarMetadata(context: ContextType): Metadata {
  if (context === "public") {
    return generatePublicPageMetadata({
      title: `Calendario Escolar - ${DEFAULT_CONFIG.siteName}`,
      description:
        "Consulta nuestro calendario escolar con fechas importantes, eventos especiales y actividades educativas programadas.",
      keywords: [
        "calendario escolar",
        "eventos",
        "fechas importantes",
        "actividades educativas",
      ],
      canonical: `${DEFAULT_CONFIG.domain}/calendario-escolar`,
    });
  }

  return generateAuthPageMetadata("ADMIN", {
    title: `Gestión de Calendario - ${DEFAULT_CONFIG.siteName}`,
    description:
      "Panel de gestión del calendario escolar. Administra eventos, fechas importantes y actividades.",
    noIndex: true,
  });
}

/**
 * Generate team page metadata
 */
export function generateTeamMetadata(context: ContextType): Metadata {
  if (context === "public") {
    return generatePublicPageMetadata({
      title: `Equipo Multidisciplinario - ${DEFAULT_CONFIG.siteName}`,
      description:
        "Conoce a nuestro equipo multidisciplinario de profesionales dedicados al desarrollo integral de nuestros niños y niñas.",
      keywords: [
        "equipo multidisciplinario",
        "profesionales",
        "especialistas",
        "desarrollo integral",
      ],
      canonical: `${DEFAULT_CONFIG.domain}/equipo-multidisciplinario`,
    });
  }

  return generateAuthPageMetadata("ADMIN", {
    title: `Gestión de Equipo - ${DEFAULT_CONFIG.siteName}`,
    description:
      "Panel de administración del equipo multidisciplinario. Gestiona perfiles, especialidades y disponibilidad.",
    noIndex: true,
  });
}

/**
 * Generate structured data for public pages
 */
export function generateStructuredData(
  type: "Organization" | "EducationalOrganization" | "Event",
  data: any,
) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type,
    name: DEFAULT_CONFIG.siteName,
    url: DEFAULT_CONFIG.domain,
    ...data,
  };

  if (type === "EducationalOrganization") {
    return {
      ...baseStructuredData,
      "@type": "EducationalOrganization",
      educationalCredentialAwarded: "Educación Inicial",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CL",
        addressLocality: "Chile",
      },
    };
  }

  return baseStructuredData;
}

// Helper functions

function getContextOptimizations(context: ContextType) {
  switch (context) {
    case "public":
      return {
        allowIndexing: true,
        allowFollow: true,
        maxSnippet: -1,
        maxImagePreview: "large",
        maxVideoPreview: -1,
        additionalMeta: {
          category: "education",
          "application-name": DEFAULT_CONFIG.siteName,
        },
      };

    case "auth":
      return {
        allowIndexing: false,
        allowFollow: false,
        maxSnippet: 0,
        maxImagePreview: "none",
        maxVideoPreview: 0,
        additionalMeta: {
          "application-name": `${DEFAULT_CONFIG.siteName} - Panel`,
        },
      };

    case "admin":
      return {
        allowIndexing: false,
        allowFollow: false,
        maxSnippet: 0,
        maxImagePreview: "none",
        maxVideoPreview: 0,
        additionalMeta: {
          "application-name": `${DEFAULT_CONFIG.siteName} - Admin`,
        },
      };

    default:
      return {
        allowIndexing: true,
        allowFollow: true,
        maxSnippet: -1,
        maxImagePreview: "standard",
        maxVideoPreview: 0,
        additionalMeta: {},
      };
  }
}

function getRoleData(role: ExtendedUserRole) {
  switch (role) {
    case "ADMIN":
      return {
        title: "Administrador",
        description: "administradores del sistema",
        capabilities: [
          "gestión completa",
          "informes",
          "configuración del sistema",
        ],
      };
    case "PROFESOR":
      return {
        title: "Profesor",
        description: "profesores y educadores",
        capabilities: [
          "planificaciones",
          "evaluaciones",
          "reportes de progreso",
        ],
      };
    default:
      return {
        title: "Usuario",
        description: "usuarios del sistema",
        capabilities: ["acceso básico", "consulta de información"],
      };
  }
}

function getRoleKeywords(role: ExtendedUserRole): string[] {
  switch (role) {
    case "ADMIN":
      return ["administración", "gestión", "configuración", "reportes"];
    case "PROFESOR":
      return ["educación", "planificación", "evaluación", "seguimiento"];
    default:
      return ["usuario", "acceso"];
  }
}

/**
 * Get page-specific structured data
 */
export function getPageStructuredData(page: string) {
  switch (page) {
    case "home":
      return generateStructuredData("EducationalOrganization", {
        description:
          "Jardín infantil enfocado en el desarrollo integral de niños y niñas a través de metodologías innovadoras.",
        telephone: "+56 2 1234 5678",
        email: "astral@gmail.com",
      });

    case "team":
      return generateStructuredData("EducationalOrganization", {
        description:
          "Equipo multidisciplinario de profesionales especializados en educación inicial.",
        member: {
          "@type": "OrganizationRole",
          roleName: "Equipo Multidisciplinario",
        },
      });

    default:
      return null;
  }
}
