import type { Metadata } from "next";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_SEO = {
  siteName: "Plataforma Institucional Astral",
  description:
    "Sistema líder nacional de gestión educativa integral. Solución SaaS profesional para instituciones de excelencia.",
  keywords: [
    "plataforma educativa",
    "gestión institucional",
    "SaaS educativo",
    "planificación académica",
    "sistema educativo",
    "gestión escolar",
    "administración educativa",
    "tecnología educativa",
    "solución integral",
  ],
  url: "https://plataforma-astral.vercel.app",
  image: "/images/og-image.jpg",
  author: "Plataforma Astral",
  locale: "es_CL",
  alternateLocales: ["es"],
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_SEO.image,
    url,
    type = "website",
    author = DEFAULT_SEO.author,
    publishedTime,
    modifiedTime,
  } = config;

  const fullTitle = title.includes(DEFAULT_SEO.siteName)
    ? title
    : `${title} | ${DEFAULT_SEO.siteName}`;

  const fullUrl = url ? `${DEFAULT_SEO.url}${url}` : DEFAULT_SEO.url;
  const fullImage = image.startsWith("http")
    ? image
    : `${DEFAULT_SEO.url}${image}`;

  const allKeywords = [...DEFAULT_SEO.keywords, ...keywords].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: author }],
    creator: author,
    publisher: DEFAULT_SEO.siteName,

    // Open Graph
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: DEFAULT_SEO.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: DEFAULT_SEO.locale,
      alternateLocale: DEFAULT_SEO.alternateLocales,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: "@PlataformaAstral",
    },

    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Alternates
    alternates: {
      canonical: fullUrl,
      languages: {
        "es-CL": fullUrl,
        es: fullUrl,
      },
    },

    // App specific
    category: "education",
    classification: "Education, Special Education, School Management",
  };
}

// Pre-configured metadata for common pages
export const homeMetadata = generateMetadata({
  title: "Plataforma Institucional Astral",
  description:
    "Bienvenido al sistema de gestión de Manitos Pintadas. Accede a planificaciones, reservas y servicios especializados.",
  keywords: ["inicio", "bienvenida", "educación especial"],
  url: "/",
});

export const loginMetadata = generateMetadata({
  title: "Iniciar Sesión",
  description:
    "Accede al sistema de gestión escolar Manitos Pintadas. Portal para profesores y administradores.",
  keywords: ["login", "acceso", "profesores"],
  url: "/login",
});

export const profesorMetadata = generateMetadata({
  title: "Portal del Profesor",
  description:
    "Portal exclusivo para profesores. Gestiona planificaciones, recursos y seguimiento académico.",
  keywords: ["profesor", "docente", "planificaciones"],
  url: "/profesor",
});

export const adminMetadata = generateMetadata({
  title: "Panel de Administración",
  description:
    "Panel de control administrativo. Gestión de usuarios, reservas y configuración del sistema.",
  keywords: ["administración", "panel", "gestión"],
  url: "/admin",
});

export const planificacionesMetadata = generateMetadata({
  title: "Planificaciones",
  description:
    "Crea, edita y gestiona planificaciones educativas. Herramientas para la organización pedagógica.",
  keywords: ["planificaciones", "pedagogía", "educación"],
  url: "/profesor/planificaciones",
});

export const equipoMetadata = generateMetadata({
  title: "Equipo",
  description:
    "Conoce al equipo de Manitos Pintadas. Profesionales especializados en educación especial.",
  keywords: ["equipo", "profesionales", "educación especial"],
  url: "/equipo",
});

export const reservasMetadata = generateMetadata({
  title: "Reservas",
  description:
    "Sistema de reservas para servicios especializados. Agenda citas y sesiones terapéuticas.",
  keywords: ["reservas", "citas", "terapia"],
  url: "/reservas",
});

// JSON-LD structured data
export function generateSchemaOrg(
  type: "organization" | "educational" | "article",
  data: Record<string, unknown>,
) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type":
      type === "organization"
        ? "EducationalOrganization"
        : type === "educational"
          ? "Course"
          : "Article",
    name: DEFAULT_SEO.siteName,
    url: DEFAULT_SEO.url,
    ...data,
  };

  return JSON.stringify(baseSchema);
}

export const organizationSchema = generateSchemaOrg("organization", {
  name: "Manitos Pintadas",
  alternateName: "Manitos Pintadas",
  description: DEFAULT_SEO.description,
  url: DEFAULT_SEO.url,
  logo: `${DEFAULT_SEO.url}/images/logo.png`,
  image: `${DEFAULT_SEO.url}/images/og-image.jpg`,
  address: {
    "@type": "PostalAddress",
    addressCountry: "CL",
    addressLocality: "Chile",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "admissions",
    email: "contacto@plataforma-astral.com",
  },
  sameAs: [
    "https://www.facebook.com/ManitosPintadas",
    "https://www.instagram.com/plataformaastral",
  ],
});

const seoUtils = {
  generateMetadata,
  homeMetadata,
  loginMetadata,
  profesorMetadata,
  adminMetadata,
  planificacionesMetadata,
  equipoMetadata,
  reservasMetadata,
  generateSchemaOrg,
  organizationSchema,
};

export default seoUtils;
