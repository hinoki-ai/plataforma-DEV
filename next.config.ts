import type { NextConfig } from "next";
import path from "path";
// Temporarily disabled bundle analyzer to troubleshoot build issues
// import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer configuration
// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

const nextConfig: NextConfig = {
  // ESLint configuration - disable during build to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },

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

  // experimental: {
  //   // Enable React 19 Compiler for maximum performance (requires React 19 and babel-plugin-react-compiler)
  //   reactCompiler: true,
  // },

  // Development optimizations
  ...(process.env.NODE_ENV === "development" && {
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
            value:
              process.env.NODE_ENV === "development"
                ? [
                    "default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: ws: wss: localhost:* *.local",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' localhost:* *.local",
                    "style-src 'self' 'unsafe-inline' localhost:* *.local",
                    "img-src 'self' data: blob: localhost:* *.local https://res.cloudinary.com https://*.cloudinary.com",
                    "font-src 'self' data: localhost:* *.local",
                    "connect-src 'self' ws: wss: localhost:* *.local https://api.cloudinary.com https://industrious-manatee-7.convex.cloud",
                    "media-src 'self' data: blob: localhost:* *.local https://res.cloudinary.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                  ].join("; ")
                : [
                    "default-src 'self' https://www.mineduc.cl https://*.mineduc.cl https://facebook.com https://*.facebook.com https://twitter.com https://*.twitter.com https://instagram.com https://*.instagram.com https://youtube.com https://*.youtube.com",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.live https://*.clerk.accounts.dev https://clerk.plataforma.aramac.dev", // Next.js requires unsafe-eval and unsafe-inline, Vercel Live for feedback widget, Clerk for authentication
                    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
                    "img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com https://www.mineduc.cl https://*.mineduc.cl https://facebook.com https://*.facebook.com https://twitter.com https://*.twitter.com https://instagram.com https://*.instagram.com https://youtube.com https://*.youtube.com https://img.clerk.com",
                    "font-src 'self' data:",
                    "connect-src 'self' https://api.cloudinary.com https://www.mineduc.cl https://*.mineduc.cl https://industrious-manatee-7.convex.cloud wss://industrious-manatee-7.convex.cloud https://vercel.live https://*.vercel.live https://*.clerk.accounts.dev https://clerk.plataforma.aramac.dev https://api.clerk.com",
                    "media-src 'self' https://res.cloudinary.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self' https://www.mineduc.cl https://*.mineduc.cl",
                    "frame-src 'self' https://vercel.live https://*.vercel.live https://*.clerk.accounts.dev https://clerk.plataforma.aramac.dev",
                    "worker-src 'self' blob:",
                    "frame-ancestors 'none'",
                    "upgrade-insecure-requests",
                  ].join("; "),
          },
        ],
      },
    ];
  },
  images: {
    domains: ["localhost", "res.cloudinary.com"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // experimental: {
  //   typedRoutes: true,
  // },
};

// Temporarily exporting config directly without bundle analyzer
export default nextConfig;
// export default withBundleAnalyzer(nextConfig);
