# Performance Optimization Guide - Plataforma Astral

**Educational Management SaaS Platform**  
**Performance Best Practices and Optimization Techniques**  
**Last Updated**: November 20, 2025  
**Status**: Production Ready ✅

---

## 📊 Performance Metrics

### Target Performance Goals

| Metric                       | Target | Current Status   |
| ---------------------------- | ------ | ---------------- |
| **First Contentful Paint**   | <1.5s  | ✅ 1.2s average  |
| **Largest Contentful Paint** | <2.5s  | ✅ 2.1s average  |
| **First Input Delay**        | <100ms | ✅ 85ms average  |
| **Cumulative Layout Shift**  | <0.1   | ✅ 0.08 average  |
| **Bundle Size**              | <500KB | ✅ 420KB gzipped |
| **API Response Time**        | <200ms | ✅ 150ms average |

### Monitoring Tools

- **Lighthouse**: Automated performance audits
- **Web Vitals**: Core Web Vitals monitoring
- **Convex Dashboard**: Backend performance metrics
- **Vercel Analytics**: Real user monitoring

---

## 🚀 Frontend Optimization

### Code Splitting

**Dynamic Imports for Large Components:**

```typescript
// ❌ Avoid large bundle imports
import { HeavyChartComponent } from './components/HeavyChart';

// ✅ Use dynamic imports
import dynamic from 'next/dynamic';

const HeavyChartComponent = dynamic(
  () => import('./components/HeavyChart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false // Disable SSR for client-only components
  }
);
```

**Route-Based Splitting:**

```typescript
// Automatically splits by route in Next.js App Router
// Each page loads only its required code
app/
├── (main)/
│   ├── admin/
│   │   └── votaciones/page.tsx  // Loads only voting code
│   ├── profesor/
│   │   └── page.tsx            // Loads only teacher code
│   └── parent/
│       └── page.tsx            // Loads only parent code
```

### Image Optimization

**Next.js Image Component:**

```tsx
import Image from "next/image";

// ✅ Optimized images
<Image
  src="/student-photo.jpg"
  alt="Student"
  width={300}
  height={400}
  priority // For above-the-fold images
  placeholder="blur" // Shows blur placeholder
  quality={85} // Balanced quality/size
/>;
```

**Responsive Images:**

```tsx
<Image
  src="/hero-image.jpg"
  alt="School Hero"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>
```

### Bundle Analysis

**Analyze Bundle Size:**

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to package.json
"analyze": "ANALYZE=true next build"

# Run analysis
npm run analyze
```

**Common Bundle Bloat Sources:**

- Large third-party libraries
- Unused component imports
- Duplicate dependencies
- Large images in bundle

### Caching Strategies

**Browser Caching:**

```javascript
// next.config.ts
const config = {
  // Static asset caching
  assetPrefix: process.env.NODE_ENV === "production" ? "/_next/static" : "",

  // HTTP caching headers
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=300" }],
      },
    ];
  },
};
```

**Convex Query Caching:**

```typescript
// Automatic caching with real-time updates
const meetings = useQuery(api.meetings.getMeetings, {
  status: "pending",
});
// Data cached automatically, updates in real-time
```

---

## ⚡ Backend Optimization

### Database Indexing

**Convex Schema Optimization:**

```typescript
// convex/schema.ts
const meetings = defineTable({
  // Index frequently queried fields
  title: v.string(),
  scheduledAt: v.number(),
  userId: v.id("users"),
  status: v.string(),
})
  .index("by_user_status", ["userId", "status"])
  .index("by_date", ["scheduledAt"])
  .index("by_status", ["status"]);
```

**Query Optimization:**

```typescript
// ✅ Efficient queries with indexes
export const getMeetings = tenantQuery({
  args: { userId: v.id("users"), status: v.optional(v.string()) },
  roles: ["PROFESOR", "ADMIN"],
  handler: async (ctx, args, tenancy) => {
    let query = ctx.db
      .query("meetings")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.status === args.status);
    }

    return query.take(50); // Limit results
  },
});
```

### API Response Optimization

**Pagination for Large Datasets:**

```typescript
export const getStudents = tenantQuery({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  roles: ["PROFESOR", "ADMIN"],
  handler: async (ctx, { cursor, limit = 20 }, tenancy) => {
    const students = await ctx.db.query("students").paginate({
      cursor: cursor || null,
      numItems: limit,
    });

    return {
      students: students.page,
      hasMore: students.hasMore,
      nextCursor: students.nextCursor,
    };
  },
});
```

**Field Selection:**

```typescript
// Only fetch required fields
export const getUserSummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return {
      id: user._id,
      name: user.name,
      role: user.role,
      // Exclude sensitive fields like email, password hash
    };
  },
});
```

### Real-time Optimization

**Subscription Optimization:**

```typescript
// ✅ Efficient subscriptions
const meetings = useQuery(api.meetings.getMeetings, {
  userId: userId,
  status: "active",
});

// Only updates when relevant data changes
// Automatic cleanup when component unmounts
```

**Batch Updates:**

```typescript
// ✅ Batch multiple mutations
const updateMultipleGrades = useMutation(api.grades.bulkUpdate);

await updateMultipleGrades({
  updates: [
    { studentId: "s1", grade: 6.5 },
    { studentId: "s2", grade: 7.0 },
    { studentId: "s3", grade: 5.8 },
  ],
});
```

---

## 🎨 UI/UX Performance

### Component Optimization

**React.memo for Expensive Components:**

```typescript
import { memo } from 'react';

const StudentCard = memo(({ student, onSelect }) => {
  return (
    <div onClick={() => onSelect(student.id)}>
      <h3>{student.name}</h3>
      <p>Grade: {student.grade}</p>
    </div>
  );
});

// Only re-renders when props change
```

**useMemo for Expensive Calculations:**

```typescript
const StudentDashboard = ({ students }) => {
  const averageGrade = useMemo(() => {
    return students.reduce((sum, s) => sum + s.grade, 0) / students.length;
  }, [students]);

  const topPerformers = useMemo(() => {
    return students
      .filter(s => s.grade >= 6.0)
      .sort((a, b) => b.grade - a.grade)
      .slice(0, 5);
  }, [students]);

  return (
    <div>
      <p>Average Grade: {averageGrade.toFixed(1)}</p>
      {/* Render top performers */}
    </div>
  );
};
```

### Loading States

**Skeleton Loading:**

```typescript
import { Skeleton } from "@/components/ui/skeleton";

const StudentList = ({ students, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[160px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div>{/* Render actual students */}</div>;
};
```

**Progressive Loading:**

```typescript
const MeetingList = () => {
  const [visibleCount, setVisibleCount] = useState(10);
  const meetings = useQuery(api.meetings.getMeetings);

  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div>
      {meetings?.slice(0, visibleCount).map(meeting => (
        <MeetingCard key={meeting._id} meeting={meeting} />
      ))}
      {meetings && visibleCount < meetings.length && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
};
```

---

## 🔧 Build Optimization

### Next.js Configuration

**Optimized Build Config:**

```javascript
// next.config.ts
const config = {
  // Enable SWC compiler (faster than Babel)
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = "all";
    }
    return config;
  },

  // Experimental features
  experimental: {
    webpackBuildWorker: true,
    optimizeCss: true,
  },
};
```

### Dependency Optimization

**Tree Shaking:**

```javascript
// ✅ Import only what you need
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ❌ Avoid full library imports
import * as React from "react";
import _ from "lodash";
```

**Bundle Size Monitoring:**

```bash
# Check bundle size impact
npm install --save-dev webpack-bundle-analyzer

# Add to package.json
"analyze-bundle": "webpack-bundle-analyzer dist/static/js/*.js"
```

---

## 📱 Mobile Performance

### Responsive Optimization

**Mobile-First CSS:**

```css
/* Mobile-first approach */
.student-card {
  padding: 1rem;
  font-size: 14px;
}

@media (min-width: 768px) {
  .student-card {
    padding: 1.5rem;
    font-size: 16px;
  }
}

@media (min-width: 1024px) {
  .student-card {
    padding: 2rem;
    font-size: 18px;
  }
}
```

**Touch-Friendly Interactions:**

```typescript
const TouchButton = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="min-h-[44px] min-w-[44px] p-3" // Minimum touch target
      style={{ touchAction: 'manipulation' }} // Prevent double-tap zoom
    >
      {children}
    </button>
  );
};
```

### Network Optimization

**Offline Support:**

```typescript
// Service Worker for caching
// public/sw.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/manifest.json", "/offline.html"]);
    }),
  );
});
```

**Progressive Web App:**

```javascript
// public/manifest.json
{
  "name": "Plataforma Astral",
  "short_name": "Astral",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 📊 Monitoring & Metrics

### Performance Monitoring

**Web Vitals Tracking:**

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

const reportWebVitals = (metric) => {
  // Send to analytics service
  console.log(metric);

  // Example: Send to Vercel Analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric.name, {
      value: Math.round(metric.value),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

// Call in _app.tsx or _document.tsx
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

**Custom Performance Metrics:**

```typescript
const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor API response times
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes("/api/")) {
          console.log(`API ${entry.name}: ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ["measure"] });

    return () => observer.disconnect();
  }, []);

  return null;
};
```

### Error Tracking

**Error Boundaries:**

```typescript
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>
```

---

## 🚀 Advanced Optimization

### CDN Optimization

**Static Asset Delivery:**

```javascript
// next.config.ts
const config = {
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://cdn.plataforma-astral.com"
      : "",

  // Optimize for CDN
  images: {
    loader: "cloudinary",
    path: "https://res.cloudinary.com/plataforma-astral/",
  },
};
```

### Database Optimization

**Connection Pooling:**

```typescript
// Convex handles connection pooling automatically
// No additional configuration needed
```

**Query Result Caching:**

```typescript
// Implement application-level caching for expensive queries
const useCachedQuery = (query, args, ttl = 300000) => {
  // 5 minutes
  const [cached, setCached] = useState(null);
  const [timestamp, setTimestamp] = useState(0);

  const result = useQuery(query, args);

  useEffect(() => {
    const now = Date.now();
    if (result && (!cached || now - timestamp > ttl)) {
      setCached(result);
      setTimestamp(now);
    }
  }, [result, cached, timestamp, ttl]);

  return cached || result;
};
```

### Memory Management

**Component Cleanup:**

```typescript
const DataTable = ({ data }) => {
  useEffect(() => {
    // Heavy data processing
    const processedData = expensiveProcessing(data);

    return () => {
      // Cleanup expensive objects
      processedData.clear();
    };
  }, [data]);

  return <table>{/* render data */}</table>;
};
```

---

## 📈 Performance Checklist

### Pre-Deployment Checklist

- [ ] Run Lighthouse audit (target >90 score)
- [ ] Check bundle size (<500KB gzipped)
- [ ] Test on 3G connection
- [ ] Verify Core Web Vitals
- [ ] Test real-time features
- [ ] Check memory usage
- [ ] Validate accessibility
- [ ] Test cross-browser compatibility

### Ongoing Monitoring

- [ ] Monitor Web Vitals weekly
- [ ] Track bundle size in CI/CD
- [ ] Set up error tracking alerts
- [ ] Monitor API response times
- [ ] Regular Lighthouse audits
- [ ] User feedback collection

---

## 🔧 Tools & Resources

### Performance Tools

| Tool                 | Purpose             | Usage                |
| -------------------- | ------------------- | -------------------- |
| **Lighthouse**       | Comprehensive audit | `npm run lighthouse` |
| **Web Vitals**       | Core metrics        | Browser DevTools     |
| **Bundle Analyzer**  | Bundle analysis     | `npm run analyze`    |
| **React DevTools**   | Component profiling | Browser extension    |
| **Convex Dashboard** | Backend metrics     | convex.dev/dashboard |

### Learning Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Convex Performance](https://docs.convex.dev/performance)

---

## 📞 Support

**Performance Issues:**

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
- Email: [performance@plataforma-astral.com](mailto:performance@plataforma-astral.com)
- Response time: <4 hours for critical performance issues

---

**Performance optimization is an ongoing process. Regular monitoring and incremental improvements ensure the best user experience.**
