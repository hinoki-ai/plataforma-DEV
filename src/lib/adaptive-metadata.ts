import { Metadata } from "next";

export type MetadataContext = "public" | "auth";

export interface AdaptiveMetadataOptions {
  /**
   * Context for metadata generation
   */
  context: MetadataContext;

  /**
   * Page title
   */
  title: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Keywords for SEO
   */
  keywords?: string[];

  /**
   * Open Graph image
   */
  image?: string;

  /**
   * Canonical URL
   */
  url?: string;

  /**
   * Additional metadata
   */
  additionalMeta?: Record<string, string>;
}

/**
 * Generate context-appropriate metadata
 */
export function generateMetadata({
  context,
  title,
  description,
  keywords = [],
  image,
  url,
  additionalMeta = {},
}: AdaptiveMetadataOptions): Metadata {
  // Base metadata
  const baseTitle = "Escuela Manitos Pintadas";
  const baseDescription =
    "Educación integral y desarrollo humano en un ambiente de amor y respeto";
  const baseKeywords = [
    "educación",
    "escuela",
    "manitos pintadas",
    "desarrollo integral",
    "niños",
  ];

  // Context-specific configurations
  const contextConfig = {
    public: {
      titleTemplate: `%s | ${baseTitle}`,
      defaultDescription:
        "Descubre nuestra propuesta educativa centrada en el desarrollo integral de cada niño y niña.",
      keywordPrefix: [
        "educación pública",
        "comunidad educativa",
        "proyecto educativo",
      ],
      robots: "index, follow",
    },
    auth: {
      titleTemplate: `%s - Panel | ${baseTitle}`,
      defaultDescription:
        "Panel de gestión educativa para profesores y administradores.",
      keywordPrefix: [
        "gestión educativa",
        "panel administrativo",
        "herramientas docentes",
      ],
      robots: "noindex, nofollow",
    },
  };

  const config = contextConfig[context];

  // Combine keywords
  const allKeywords = [...config.keywordPrefix, ...baseKeywords, ...keywords];

  // Final title
  const finalTitle = title === baseTitle ? title : `${title} | ${baseTitle}`;

  // Final description
  const finalDescription =
    description || config.defaultDescription || baseDescription;

  // Generate metadata
  const metadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: allKeywords.join(", "),
    robots: config.robots,

    // Open Graph
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: "website",
      locale: "es_CL",
      siteName: baseTitle,
      ...(image && { images: [{ url: image }] }),
      ...(url && { url }),
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      ...(image && { images: [image] }),
    },

    // Additional meta tags
    other: {
      "theme-color": context === "public" ? "#1f2937" : "#ffffff",
      "msapplication-TileColor": context === "public" ? "#1f2937" : "#ffffff",
      ...additionalMeta,
    },
  };

  // Context-specific additions
  if (context === "public") {
    metadata.authors = [{ name: "Escuela Manitos Pintadas" }];
    metadata.creator = "Escuela Manitos Pintadas";
    metadata.publisher = "Escuela Manitos Pintadas";

    // Canonical URL for public pages
    if (url) {
      metadata.alternates = {
        canonical: url,
      };
    }
  }

  return metadata;
}

/**
 * Quick metadata generators for common page types
 */

export function generatePublicPageMetadata(
  title: string,
  description?: string,
  options?: Partial<AdaptiveMetadataOptions>,
): Metadata {
  return generateMetadata({
    context: "public",
    title,
    description,
    ...options,
  });
}

export function generateAuthPageMetadata(
  title: string,
  description?: string,
  options?: Partial<AdaptiveMetadataOptions>,
): Metadata {
  return generateMetadata({
    context: "auth",
    title,
    description,
    ...options,
  });
}

export function generateDashboardMetadata(role: string): Metadata {
  const roleLabels = {
    ADMIN: "Administrador",
    PROFESOR: "Profesor",
    PARENT: "Padre/Apoderado",
  };

  const roleLabel = roleLabels[role as keyof typeof roleLabels] || "Usuario";

  return generateAuthPageMetadata(
    `Panel ${roleLabel}`,
    `Panel de control para usuarios con rol ${roleLabel.toLowerCase()}.`,
    {
      keywords: ["panel", "dashboard", roleLabel.toLowerCase(), "gestión"],
    },
  );
}

export function generateCalendarMetadata(context: MetadataContext): Metadata {
  if (context === "public") {
    return generatePublicPageMetadata(
      "Calendario Escolar",
      "Consulta todos los eventos, fechas importantes y actividades de nuestra comunidad educativa.",
      {
        keywords: [
          "calendario",
          "eventos",
          "fechas importantes",
          "actividades escolares",
        ],
      },
    );
  } else {
    return generateAuthPageMetadata(
      "Gestión de Calendario",
      "Administra eventos, fechas y actividades del calendario escolar.",
      {
        keywords: [
          "gestión calendario",
          "eventos",
          "administración",
          "planificación",
        ],
      },
    );
  }
}

export function generateTeamMetadata(context: MetadataContext): Metadata {
  if (context === "public") {
    return generatePublicPageMetadata(
      "Equipo Multidisciplinario",
      "Conoce a nuestro equipo de profesionales comprometidos con el desarrollo integral de cada estudiante.",
      {
        keywords: [
          "equipo",
          "profesionales",
          "multidisciplinario",
          "psicólogos",
          "educadores",
        ],
      },
    );
  } else {
    return generateAuthPageMetadata(
      "Gestión de Equipo",
      "Administra la información del equipo multidisciplinario.",
      {
        keywords: [
          "gestión equipo",
          "administración",
          "profesionales",
          "multidisciplinario",
        ],
      },
    );
  }
}
