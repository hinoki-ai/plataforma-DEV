/**
 * Enhanced Lighthouse CI Configuration
 * Comprehensive performance testing for Next.js 15 educational platform
 */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/admin',
        'http://localhost:3000/profesor',
        'http://localhost:3000/parent',
        'http://localhost:3000/centro-consejo',
        'http://localhost:3000/profesor/planificaciones',
        'http://localhost:3000/parent/reuniones',
        'http://localhost:3000/api/health',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        skipAudits: [
          'canonical',
          'structured-data',
          'robots-txt',
          'tap-targets',
        ],
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals - Stricter thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['error', { maxNumericValue: 2000 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'max-potential-fid': ['error', { maxNumericValue: 100 }],

        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 15000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 400 }],
        'modern-image-formats': ['warn'],
        'efficiently-encode-images': ['warn'],
        'uses-responsive-images': ['warn'],
        'uses-webp-images': ['warn'],

        // Accessibility - Educational platform requirements
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        label: 'error',
        'link-name': 'error',
        list: 'error',
        'meta-viewport': 'error',
        'focus-traps': 'warn',
        'focusable-controls': 'warn',
        tabindex: 'warn',

        // Security
        'csp-xss': ['warn'],
        'is-on-https': ['error'],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },

  // Mobile configuration
  mobile: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/profesor',
        'http://localhost:3000/parent',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'speed-index': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
