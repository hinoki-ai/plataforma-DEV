import fs from "fs";
import type { NextConfig } from "next";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";

function loadClerkKeylessEnv() {
  const missingPublishable =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim().length === 0;
  const missingSecret =
    !process.env.CLERK_SECRET_KEY ||
    process.env.CLERK_SECRET_KEY.trim().length === 0;

  if (!missingPublishable && !missingSecret) {
    return;
  }

  const keylessPath = path.join(__dirname, ".clerk", ".tmp", "keyless.json");

  if (!fs.existsSync(keylessPath)) {
    if (isDevelopment) {
      console.warn(
        "[Clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is missing. Generate credentials with `npx clerk dev` or claim the keyless instance shown the first time the dev server runs.",
      );
    }
    return;
  }

  try {
    const raw = fs.readFileSync(keylessPath, "utf8");
    const data = JSON.parse(raw) as {
      publishableKey?: string;
      secretKey?: string;
    };

    if (missingPublishable && data.publishableKey) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = data.publishableKey;
    }

    if (missingSecret && data.secretKey) {
      process.env.CLERK_SECRET_KEY = data.secretKey;
    }
  } catch (error) {
    if (isDevelopment) {
      console.warn(
        `[Clerk] Failed to hydrate missing credentials from ${keylessPath}:`,
        error,
      );
    }
  }
}

loadClerkKeylessEnv();

const clerkAssetHosts = [
  "https://*.clerk.accounts.dev",
  "https://*.clerkstage.dev",
  "https://*.clerk.dev",
  "https://clerk.plataforma.aramac.dev",
];

const clerkApiHosts = [
  "https://api.clerk.com",
  "https://api.clerkstage.com",
  "https://api.clerk.dev",
];

const clerkImageHosts = ["https://img.clerk.com"];

function parseConvexOrigin() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return { http: undefined, ws: undefined };

  try {
    const parsed = new URL(url);
    const httpOrigin = `${parsed.protocol}//${parsed.host}`;
    const wsOrigin =
      parsed.protocol === "https:"
        ? `wss://${parsed.host}`
        : parsed.protocol === "http:"
          ? `ws://${parsed.host}`
          : undefined;
    return { http: httpOrigin, ws: wsOrigin };
  } catch (error) {
    if (isDevelopment) {
      console.warn(
        `[Convex] Invalid NEXT_PUBLIC_CONVEX_URL: ${url}. Update your .env.local file.`,
        error,
      );
    }
    return { http: undefined, ws: undefined };
  }
}

const convexOrigins = parseConvexOrigin();

function directive(name: string, sources: (string | undefined)[]) {
  const filtered = sources.filter(Boolean);
  return `${name} ${filtered.join(" ")}`;
}
// Temporarily disabled bundle analyzer to troubleshoot build issues
// import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer configuration
// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

const nextConfig: NextConfig = {
  // TypeScript configuration - skip type checking during build (done separately)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Output configuration - use standalone for server deployment
  // Temporarily disabled to troubleshoot build issues
  // output: "standalone",

  // Performance optimizations
  productionBrowserSourceMaps: true,
  compress: true,
  poweredByHeader: false,

  // Skip trailing slash redirect for better compatibility
  skipTrailingSlashRedirect: true,

  // Generate buildId to help with debugging
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // React Compiler is now stable in Next.js 16
  // Temporarily disabled due to missing babel-plugin-react-compiler
  // reactCompiler: true,

  // Turbopack configuration for Next.js 16 - disabled to avoid font loading issues
  // turbopack: {
  //   // Empty config to silence the warning
  // },

  // Development optimizations
  ...(isDevelopment && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000, // Increased from 25s to 60s for stability
      pagesBufferLength: 5, // Increased from 2 to 5 for better buffering
    },
  }),

  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "next-auth/react": path.resolve(__dirname, "src/lib/auth-client.tsx"),
      "next-auth": path.resolve(__dirname, "src/lib/auth-server.ts"),
    };
    return config;
  },

  // Turbopack configuration for Next.js 16 compatibility
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/teacher",
        destination: "/profesor",
        permanent: true,
      },
      {
        source: "/mineduc",
        destination: "https://www.mineduc.cl",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security Headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // Content Security Policy (relaxed for development)
          {
            key: "Content-Security-Policy",
            value: isDevelopment
              ? [
                  directive("default-src", [
                    "'self'",
                    "'unsafe-eval'",
                    "'unsafe-inline'",
                    "data:",
                    "blob:",
                    "ws:",
                    "wss:",
                    "localhost:*",
                    "*.local",
                  ]),
                  directive("script-src", [
                    "'self'",
                    "'unsafe-eval'",
                    "'unsafe-inline'",
                    "localhost:*",
                    "*.local",
                    ...clerkAssetHosts,
                  ]),
                  directive("style-src", [
                    "'self'",
                    "'unsafe-inline'",
                    "localhost:*",
                    "*.local",
                  ]),
                  directive("img-src", [
                    "'self'",
                    "data:",
                    "blob:",
                    "localhost:*",
                    "*.local",
                    "https://res.cloudinary.com",
                    "https://*.cloudinary.com",
                    ...clerkAssetHosts,
                    ...clerkImageHosts,
                  ]),
                  directive("font-src", [
                    "'self'",
                    "data:",
                    "localhost:*",
                    "*.local",
                  ]),
                  directive("connect-src", [
                    "'self'",
                    "ws:",
                    "wss:",
                    "localhost:*",
                    "*.local",
                    "https://api.cloudinary.com",
                    convexOrigins.http,
                    ...clerkAssetHosts,
                    ...clerkApiHosts,
                  ]),
                  directive("media-src", [
                    "'self'",
                    "data:",
                    "blob:",
                    "localhost:*",
                    "*.local",
                    "https://res.cloudinary.com",
                  ]),
                  directive("frame-src", [
                    "'self'",
                    "localhost:*",
                    "*.local",
                    ...clerkAssetHosts,
                  ]),
                  directive("object-src", ["'none'"]),
                  directive("base-uri", ["'self'"]),
                  directive("form-action", ["'self'"]),
                ].join("; ")
              : [
                  directive("default-src", [
                    "'self'",
                    "https://www.mineduc.cl",
                    "https://*.mineduc.cl",
                    "https://facebook.com",
                    "https://*.facebook.com",
                    "https://twitter.com",
                    "https://*.twitter.com",
                    "https://instagram.com",
                    "https://*.instagram.com",
                    "https://youtube.com",
                    "https://*.youtube.com",
                  ]),
                  directive("script-src", [
                    "'self'",
                    "'unsafe-eval'",
                    "'unsafe-inline'",
                    "https://vercel.live",
                    "https://*.vercel.live",
                    "https://*.clerk.accounts.dev",
                    "https://clerk.plataforma.aramac.dev",
                  ]),
                  directive("style-src", ["'self'", "'unsafe-inline'"]),
                  directive("img-src", [
                    "'self'",
                    "data:",
                    "https://res.cloudinary.com",
                    "https://*.cloudinary.com",
                    "https://www.mineduc.cl",
                    "https://*.mineduc.cl",
                    "https://facebook.com",
                    "https://*.facebook.com",
                    "https://twitter.com",
                    "https://*.twitter.com",
                    "https://instagram.com",
                    "https://*.instagram.com",
                    "https://youtube.com",
                    "https://*.youtube.com",
                    "https://img.clerk.com",
                  ]),
                  directive("font-src", ["'self'", "data:"]),
                  directive("connect-src", [
                    "'self'",
                    "https://api.cloudinary.com",
                    "https://www.mineduc.cl",
                    "https://*.mineduc.cl",
                    "https://industrious-manatee-7.convex.cloud",
                    "wss://industrious-manatee-7.convex.cloud",
                    convexOrigins.http,
                    convexOrigins.ws,
                    "https://vercel.live",
                    "https://*.vercel.live",
                    "https://*.clerk.accounts.dev",
                    "https://clerk.plataforma.aramac.dev",
                    "https://api.clerk.com",
                  ]),
                  directive("media-src", [
                    "'self'",
                    "https://res.cloudinary.com",
                  ]),
                  directive("object-src", ["'none'"]),
                  directive("base-uri", ["'self'"]),
                  directive("form-action", [
                    "'self'",
                    "https://www.mineduc.cl",
                    "https://*.mineduc.cl",
                  ]),
                  directive("frame-src", [
                    "'self'",
                    "https://vercel.live",
                    "https://*.vercel.live",
                    "https://*.clerk.accounts.dev",
                    "https://clerk.plataforma.aramac.dev",
                  ]),
                  directive("worker-src", ["'self'", "blob:"]),
                  directive("frame-ancestors", ["'none'"]),
                  "upgrade-insecure-requests",
                ].join("; "),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// Temporarily exporting config directly without bundle analyzer
export default nextConfig;
// export default withBundleAnalyzer(nextConfig);
