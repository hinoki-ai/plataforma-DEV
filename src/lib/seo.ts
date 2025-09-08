import type { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_SEO = {
  siteName: 'Manitos Pintadas - Sistema de Gestión Escolar',
  description:
    'Sistema integral de gestión escolar para Manitos Pintadas. Planificaciones, reservas y administración educativa.',
  keywords: [
    'escuela especial',
    'lenguaje',
    'educación especial',
    'planificaciones',
    'sistema educativo',
    'gestión escolar',
    'fonoaudiología',
    'terapia ocupacional',
    'psicología educacional',
  ],
  url: 'https://manitos-pintadas.vercel.app',
  image: '/images/og-image.jpg',
  author: 'Manitos Pintadas',
  locale: 'es_CL',
  alternateLocales: ['es'],
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_SEO.image,
    url,
    type = 'website',
    author = DEFAULT_SEO.author,
    publishedTime,
    modifiedTime,
  } = config;

  const fullTitle = title.includes(DEFAULT_SEO.siteName)
    ? title
    : `${title} | ${DEFAULT_SEO.siteName}`;

  const fullUrl = url ? `${DEFAULT_SEO.url}${url}` : DEFAULT_SEO.url;
  const fullImage = image.startsWith('http')
    ? image
    : `${DEFAULT_SEO.url}${image}`;

  const allKeywords = [...DEFAULT_SEO.keywords, ...keywords].join(', ');

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
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: '@ManitosPintadas',
    },

    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
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
        'es-CL': fullUrl,
        es: fullUrl,
      },
    },

    // App specific
    category: 'education',
    classification: 'Education, Special Education, School Management',
  };
}

// Pre-configured metadata for common pages
export const homeMetadata = generateMetadata({
  title: 'Inicio - Manitos Pintadas',
  description:
    'Bienvenido al sistema de gestión de Manitos Pintadas. Accede a planificaciones, reservas y servicios especializados.',
  keywords: ['inicio', 'bienvenida', 'educación especial'],
  url: '/',
});

export const loginMetadata = generateMetadata({
  title: 'Iniciar Sesión',
  description:
    'Accede al sistema de gestión escolar Manitos Pintadas. Portal para profesores y administradores.',
  keywords: ['login', 'acceso', 'profesores'],
  url: '/login',
});

export const profesorMetadata = generateMetadata({
  title: 'Portal del Profesor',
  description:
    'Portal exclusivo para profesores. Gestiona planificaciones, recursos y seguimiento académico.',
  keywords: ['profesor', 'docente', 'planificaciones'],
  url: '/profesor',
});

export const adminMetadata = generateMetadata({
  title: 'Panel de Administración',
  description:
    'Panel de control administrativo. Gestión de usuarios, reservas y configuración del sistema.',
  keywords: ['administración', 'panel', 'gestión'],
  url: '/admin',
});

export const planificacionesMetadata = generateMetadata({
  title: 'Planificaciones',
  description:
    'Crea, edita y gestiona planificaciones educativas. Herramientas para la organización pedagógica.',
  keywords: ['planificaciones', 'pedagogía', 'educación'],
  url: '/profesor/planificaciones',
});

export const equipoMetadata = generateMetadata({
  title: 'Equipo Multidisciplinario',
  description:
    'Conoce nuestro equipo de profesionales: fonoaudióloga, terapeuta ocupacional y psicóloga. Reserva tu cita.',
  keywords: [
    'equipo',
    'multidisciplinario',
    'fonoaudiología',
    'terapia ocupacional',
    'psicología',
  ],
  url: '/public/equipo-multidisciplinario',
});

export const reservasMetadata = generateMetadata({
  title: 'Reservar Cita',
  description:
    'Solicita una cita con nuestro equipo multidisciplinario. Atención especializada para estudiantes.',
  keywords: ['reservas', 'citas', 'atención', 'especializada'],
  url: '/public/equipo-multidisciplinario/reservar',
});

// JSON-LD structured data
export function generateSchemaOrg(
  type: 'organization' | 'educational' | 'article',
  data: any
) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type':
      type === 'organization'
        ? 'EducationalOrganization'
        : type === 'educational'
          ? 'Course'
          : 'Article',
    name: DEFAULT_SEO.siteName,
    url: DEFAULT_SEO.url,
    ...data,
  };

  return JSON.stringify(baseSchema);
}

export const organizationSchema = generateSchemaOrg('organization', {
  name: 'Manitos Pintadas',
  alternateName: 'Manitos Pintadas',
  description: DEFAULT_SEO.description,
  url: DEFAULT_SEO.url,
  logo: `${DEFAULT_SEO.url}/images/logo.png`,
  image: `${DEFAULT_SEO.url}/images/og-image.jpg`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CL',
    addressLocality: 'Chile',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'admissions',
    email: 'contacto@manitospintadas.cl',
  },
  sameAs: [
    'https://www.facebook.com/ManitosPintadas',
    'https://www.instagram.com/manitospintadas',
  ],
});

export default {
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
