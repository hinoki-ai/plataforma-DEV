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
  siteName: "Plataforma Astral",
  description:
    "Plataforma SaaS líder en Chile para gestión educativa institucional. Tecnología de vanguardia y soluciones innovadoras para instituciones de excelencia chilenas.",
  keywords: [
    "SaaS Chile",
    "tecnología chilena",
    "plataforma educativa",
    "gestión institucional",
    "SaaS educativo",
    "planificación académica",
    "sistema educativo",
    "gestión escolar",
    "administración educativa",
    "tecnología educativa",
    "solución integral",
    "software educativo Chile",
    "plataforma tecnológica",
    "innovación educativa",
    "SaaS institucional",
  ],
  url: "https://plataforma-astral.vercel.app",
  image: "/images/og-image.jpg",
  author: "Plataforma SaaS Chile",
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
  title: "Plataforma Astral",
  description:
    "Plataforma SaaS líder en Chile para gestión educativa institucional. Tecnología de vanguardia para instituciones de excelencia chilenas.",
  keywords: ["inicio", "bienvenida", "SaaS Chile", "tecnología educativa"],
  url: "/",
});

export const loginMetadata = generateMetadata({
  title: "Iniciar Sesión - Plataforma SaaS Chile",
  description:
    "Accede a la plataforma SaaS líder en Chile para gestión educativa. Portal seguro para profesores y administradores.",
  keywords: ["login", "acceso", "profesores", "SaaS Chile"],
  url: "/login",
});

export const profesorMetadata = generateMetadata({
  title: "Portal del Profesor - Plataforma SaaS Chile",
  description:
    "Portal exclusivo para profesores en la plataforma SaaS líder de Chile. Gestiona planificaciones, recursos y seguimiento académico.",
  keywords: ["profesor", "docente", "planificaciones", "SaaS Chile"],
  url: "/profesor",
});

export const adminMetadata = generateMetadata({
  title: "Panel de Administración - Plataforma SaaS Chile",
  description:
    "Panel de control administrativo de la plataforma SaaS líder en Chile. Gestión de usuarios, configuración y administración del sistema.",
  keywords: ["administración", "panel", "gestión", "SaaS Chile"],
  url: "/admin",
});

export const planificacionesMetadata = generateMetadata({
  title: "Planificaciones - Plataforma SaaS Chile",
  description:
    "Crea, edita y gestiona planificaciones educativas en la plataforma SaaS líder de Chile. Herramientas avanzadas para la organización pedagógica.",
  keywords: ["planificaciones", "pedagogía", "educación", "SaaS Chile"],
  url: "/profesor/planificaciones",
});

export const equipoMetadata = generateMetadata({
  title: "Equipo - Plataforma SaaS Chile",
  description:
    "Conoce al equipo de tecnología detrás de la plataforma SaaS líder en Chile. Profesionales especializados en soluciones educativas innovadoras.",
  keywords: ["equipo", "profesionales", "tecnología educativa", "SaaS Chile"],
  url: "/equipo",
});

export const reservasMetadata = generateMetadata({
  title: "Reservas - Plataforma SaaS Chile",
  description:
    "Sistema avanzado de reservas en la plataforma SaaS líder de Chile. Agenda citas y sesiones especializadas con tecnología de vanguardia.",
  keywords: ["reservas", "citas", "SaaS Chile", "tecnología"],
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
  name: "Plataforma Astral",
  alternateName: "Plataforma Astral",
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
    contactType: "customer service",
    email: "contacto@plataforma-astral.com",
  },
  sameAs: [
    "https://www.linkedin.com/company/plataforma-saas-chile",
    "https://www.instagram.com/plataformasaaschile",
  ],
  knowsAbout: [
    "Tecnología Educativa",
    "SaaS",
    "Gestión Educativa",
    "Innovación Digital",
    "Software Educativo Chile",
  ],
  serviceArea: {
    "@type": "Country",
    name: "Chile",
  },
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
