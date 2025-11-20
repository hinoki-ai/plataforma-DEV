# AI Knowledge Base - Plataforma Astral

## Educational Management System

**Version**: 0.1.0
**Last Updated**: November 18, 2025
**Status**: Production Ready ✅

---

## 📋 SYSTEM METADATA

```json
{
  "system": {
    "name": "Plataforma Astral",
    "description": "Comprehensive SaaS educational management platform for teacher, admin, and parent control",
    "domain": "https://plataforma.aramac.dev",
    "version": "0.1.0",
    "status": "production",
    "last_updated": "2025-11-18",
    "migration_status": "Convex/Clerk migration complete (2025-01-07)"
  },
  "technologies": {
    "frontend": {
      "framework": "Next.js",
      "version": "16.0.0",
      "router": "App Router",
      "react_version": "19.2.0",
      "typescript_version": "5.9.3"
    },
    "backend": {
      "framework": "Convex",
      "version": "1.28.2",
      "type": "serverless",
      "realtime": true
    },
    "authentication": {
      "provider": "Clerk",
      "version": "6.34.0",
      "backend_version": "2.4.1",
      "migration_from": "NextAuth.js v5",
      "migration_date": "2025-01-07"
    },
    "styling": {
      "framework": "Tailwind CSS",
      "version": "4.x",
      "components": "shadcn/ui + Radix UI"
    },
    "testing": {
      "framework": "Vitest",
      "e2e": "Playwright",
      "version": "latest"
    }
  },
  "deployment": {
    "platform": "Vercel",
    "region": "global",
    "environment_variables": [
      "NEXT_PUBLIC_CONVEX_URL",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
      "CLOUDINARY_URL",
      "CLERK_WEBHOOK_SECRET"
    ]
  }
}
```

---

## 🤖 AI NAVIGATION GUIDE

### Quick Access Patterns

```json
{
  "for_immediate_implementation": {
    "authentication_flow": "#authentication-system",
    "database_operations": "#database-schema + #api-patterns",
    "component_creation": "#code-generation-patterns",
    "error_handling": "#error-handling-patterns",
    "security_implementation": "#security-patterns"
  },
  "for_system_understanding": {
    "architecture_overview": "#architecture-overview",
    "core_dependencies": "#cross-references",
    "data_flow_patterns": "#data-flow",
    "role_permissions": "#rbac-implementation",
    "performance_requirements": "#performance-patterns"
  },
  "for_deployment_operations": {
    "setup_instructions": "../START_HERE.md",
    "deployment_procedures": "../DEPLOYMENT.md",
    "environment_config": "./ENVIRONMENT.md",
    "rollback_procedures": "#deployment-patterns"
  },
  "for_troubleshooting": {
    "error_diagnosis": "#troubleshooting-patterns",
    "performance_issues": "#performance-patterns",
    "security_incidents": "#security-patterns + ./EMERGENCY_ACCESS_PROCEDURES.md",
    "integration_problems": "#integration-patterns"
  },
  "for_feature_development": {
    "voting_system": "./VOTING_SYSTEM.md",
    "libro_clases": "./LIBRO_DE_CLASES_GUIDE.md",
    "role_management": "./ROLE_SYSTEM.md",
    "testing_patterns": "#testing-patterns"
  }
}
```

### Implementation Decision Tree

```text
Need to implement a feature?
├── Is it user-facing?
│   ├── Yes → Check #ui-patterns + shadcn/ui components
│   └── No → Continue to data layer
├── Requires authentication?
│   ├── Yes → Always use #authentication-system patterns
│   └── No → Check #public_routes in routing
├── Involves data operations?
│   ├── Yes → Follow #database-schema + #api-patterns
│   └── No → Check #integration-patterns
├── Needs real-time updates?
│   ├── Yes → Use Convex subscriptions (#data-flow)
│   └── No → Standard queries/mutations
└── Production ready?
    ├── Yes → Run #deployment-patterns validation
    └── No → Add to testing checklist (#testing-patterns)
```

---

## 🏗️ ARCHITECTURE OVERVIEW

### Core Architecture Patterns

```json
{
  "patterns": {
    "authentication": {
      "type": "Clerk-based RBAC",
      "middleware": "proxy.ts enforcement",
      "session_management": "Clerk sessions with Convex user resolution",
      "role_hierarchy": ["MASTER", "ADMIN", "PROFESOR", "PARENT", "PUBLIC"]
    },
    "data_flow": {
      "client_to_server": "Convex client → Convex functions → Database",
      "realtime_updates": "Convex subscriptions for live data",
      "file_storage": "Cloudinary integration for media uploads"
    },
    "routing": {
      "structure": "App Router with role-based route groups",
      "protected_routes": "Middleware enforcement via proxy.ts",
      "public_routes": ["/", "/cpa", "/public/*", "/docs/*"]
    }
  }
}
```

### Directory Structure Taxonomy

```text
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Protected role-based dashboards
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication components
│   └── [feature]/         # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # Clerk authentication helpers
│   ├── clerk-config.ts    # Clerk configuration
│   └── utils/             # Utility functions
├── hooks/                 # Custom React hooks
├── services/              # Business logic and API calls
├── types/                 # TypeScript type definitions
└── locales/               # Internationalization files

convex/                    # Convex backend
├── schema.ts              # Database schema
├── [feature].ts           # Feature-specific functions
└── _generated/            # Auto-generated types
```

---

## 🔐 AUTHENTICATION SYSTEM

### Clerk Integration Architecture

```json
{
  "clerk_config": {
    "providers": ["credentials"],
    "role_mapping": {
      "MASTER": { "access": "complete_system", "auth": "credentials_only" },
      "ADMIN": { "access": "administrative", "auth": "credentials_only" },
      "PROFESOR": { "access": "teaching", "auth": "credentials_only" },
      "PARENT": { "access": "parent_features", "auth": "credentials_only" }
    },
    "session_handling": {
      "middleware": "src/proxy.ts",
      "resolution": "Clerk user → Convex user lookup",
      "validation": "Active status + role verification"
    }
  }
}
```

### Authentication Flow Patterns

#### Pattern 1: Standard Login

```text
User Login → Clerk Auth → proxy.ts → Convex User Resolution → Role-Based Dashboard
```

#### Pattern 3: Emergency Access

```text
Emergency Credentials → Direct Convex Auth → Admin Override → System Access
```

### Critical Implementation Constraints

```typescript
// ✅ CORRECT: Clerk session resolution with Convex lookup
export async function auth(): Promise<SessionData | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  const convexUser = await getClerkUserById(userId);
  if (!convexUser || !convexUser.isActive) return null;

  return {
    user: {
      id: convexUser.id,
      clerkId: userId,
      role: convexUser.role,
      // ... other fields
    },
  };
}

// ❌ AVOID: Direct Clerk user usage without Convex validation
export async function auth(): Promise<SessionData | null> {
  const { userId } = await clerkAuth();
  const clerkUser = await currentUser(); // Missing Convex validation
  // This bypasses role and active status checks
}
```

---

## 🗄️ DATABASE SCHEMA

### Core Models with Relationships

```typescript
// User Model (Convex Schema)
users: defineTable({
  name: v.optional(v.string()),
  email: v.string(),
  role: v.union("MASTER", "ADMIN", "PROFESOR", "PARENT", "PUBLIC"),
  isActive: v.boolean(),
  clerkId: v.optional(v.string()),
  institutionId: v.optional(v.id("institutionInfo")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_email", ["email"])
.index("by_role", ["role"])
.index("by_clerkId", ["clerkId"])

// Relationship Patterns
{
  "one_to_many": {
    "institution_users": "institutionInfo.id → users.institutionId",
    "author_documents": "users.id → planningDocuments.authorId"
  },
  "many_to_many": {
    "student_grades": "students.id + courses.id → grades",
    "meeting_attendees": "meetings.id + users.id → attendance"
  }
}
```

### Schema Constraints and Indexes

```json
{
  "indexes": {
    "performance_critical": [
      "users.by_email",
      "users.by_clerkId",
      "users.by_role"
    ],
    "query_optimization": [
      "planningDocuments.by_authorId",
      "votes.by_endDate",
      "grades.by_studentId"
    ]
  },
  "constraints": {
    "required_fields": ["email", "role", "isActive"],
    "unique_constraints": ["email", "clerkId"],
    "foreign_keys": ["institutionId", "authorId", "studentId"]
  }
}
```

---

## 🔌 API PATTERNS

### Convex Function Patterns

#### Pattern 1: Authenticated Query

```typescript
// convex/users.ts
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});
```

#### Pattern 2: Admin-Only Mutation

```typescript
export const createUser = mutation({
  args: { email: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = await getCurrentUser(ctx);

    if (user?.role !== "ADMIN" && user?.role !== "MASTER") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("users", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### Next.js API Route Patterns

#### Pattern 1: Convex Client Initialization

```typescript
// ✅ CORRECT: Per-request Convex client
export async function GET(request: NextRequest) {
  const convex = getConvexClient(); // Fresh client per request
  const result = await convex.query(api.users.getCurrentUser);
  return NextResponse.json(result);
}

// ❌ AVOID: Shared Convex client
let convexClient: ConvexReactClient;
export async function GET(request: NextRequest) {
  if (!convexClient) convexClient = getConvexClient(); // Reused client
  // This can cause connection issues in serverless
}
```

---

## 🎯 FEATURE IMPLEMENTATIONS

### Voting System Architecture

```json
{
  "voting_system": {
    "models": ["votes", "voteOptions", "voteResponses"],
    "constraints": {
      "single_vote": "enforced by user + vote ID unique constraint",
      "time_bound": "endDate validation on vote submission",
      "authentication": "required for all voting actions"
    },
    "patterns": {
      "vote_creation": "Admin creates vote → Options added → Public access enabled",
      "vote_submission": "User checks eligibility → Submits choice → Real-time results update",
      "result_calculation": "Count by optionId → Percentage calculation → Live updates"
    }
  }
}
```

### Libro de Clases Implementation

```json
{
  "libro_clases": {
    "models": ["courses", "students", "grades", "classContent"],
    "constraints": {
      "grade_validation": "MINEDUC compliant ranges",
      "attendance_tracking": "Daily recording requirement",
      "content_linking": "Course → Students → Grades relationship"
    },
    "patterns": {
      "class_setup": "Create course → Add students → Set grading criteria",
      "grade_management": "Record assessments → Calculate averages → Generate reports",
      "content_delivery": "Upload materials → Link to curriculum → Track completion"
    }
  }
}
```

---

## 🔄 CROSS-REFERENCES

### Component Dependencies

```json
{
  "auth_dependencies": {
    "providers": ["src/components/providers.tsx"],
    "middleware": ["src/proxy.ts"],
    "utilities": ["src/lib/auth.ts", "src/lib/clerk-config.ts"],
    "services": ["src/services/actions/clerk-users.ts"]
  },
  "ui_dependencies": {
    "base_components": ["src/components/ui/*"],
    "layout_components": ["src/components/layout/*"],
    "feature_components": ["src/components/[feature]/*"]
  }
}
```

### File Relationships and Dependencies

```json
{
  "core_dependencies": {
    "authentication": {
      "clerk_integration": ["src/lib/clerk-config.ts", "src/lib/auth.ts"],
      "middleware": ["src/proxy.ts"],
      "convex_auth": ["convex/users.ts", "convex/auth.ts"],
      "components": ["src/components/auth/*"]
    },
    "database_layer": {
      "schema": ["convex/schema.ts"],
      "generated_types": ["convex/_generated/*"],
      "data_functions": ["convex/*.ts"],
      "utilities": ["convex/schema-utils.ts"]
    },
    "ui_components": {
      "base_components": ["src/components/ui/*"],
      "layout_components": ["src/components/layout/*"],
      "feature_components": ["src/components/[feature]/*"],
      "providers": ["src/components/providers.tsx"]
    }
  },
  "cross_document_references": {
    "setup_guides": {
      "quick_start": "../START_HERE.md",
      "clerk_setup": "./CLERK_SETUP.md",
      "deployment": "../DEPLOYMENT.md",
      "environment": "./ENVIRONMENT.md"
    },
    "feature_documentation": {
      "voting_system": "./VOTING_SYSTEM.md",
      "libro_clases": "./LIBRO_DE_CLASES_GUIDE.md",
      "role_system": "./ROLE_SYSTEM.md",
      "protected_paths": "./protected-paths.md"
    },
    "security_operations": {
      "emergency_access": "./EMERGENCY_ACCESS_PROCEDURES.md",
      "role_audit": "./ROLE_ACCESS_AUDIT.md",
      "security_patterns": "#security-patterns"
    },
    "testing_quality": {
      "testing_guide": "./TESTING_GUIDE.md",
      "performance_guide": "./ANIMATION_GUIDE.md",
      "accessibility": "Built into TESTING_GUIDE.md"
    },
    "implementation_details": {
      "i18n_guide": "./PAGE_I18N_GUIDE.md",
      "multi_tenant": "./MULTI_TENANT_GUIDE.md",
      "migration_history": "../.archive/old-backups/MIGRATION.md"
    },
    "analysis_reviews": {
      "system_review": "./REVIEW_ANALYSIS.md",
      "gap_analysis": "./LIBRO_CLASES_GAP_ANALYSIS.md",
      "implementation_status": "./LIBRO_CLASES_IMPLEMENTATION_STATUS.md"
    }
  },
  "api_routes": {
    "admin_endpoints": ["src/app/api/admin/*"],
    "parent_endpoints": ["src/app/api/parent/*"],
    "public_endpoints": ["src/app/api/public/*"],
    "webhook_endpoints": ["src/app/api/webhooks/*"]
  },
  "service_layers": {
    "actions": ["src/services/actions/*"],
    "queries": ["src/services/queries/*"],
    "utilities": ["src/lib/*"],
    "hooks": ["src/hooks/*"]
  }
}
```

---

## 🚨 IMPLEMENTATION CONSTRAINTS

### Critical Patterns to Follow

```typescript
// ✅ REQUIRED: Always check authentication before Convex operations
export const secureQuery = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Continue with authenticated logic
  },
});

// ✅ REQUIRED: Role-based access control
export const adminOnlyMutation = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!["ADMIN", "MASTER"].includes(user?.role)) {
      throw new Error("Insufficient permissions");
    }
    // Continue with admin logic
  },
});

// ✅ REQUIRED: Input validation with Zod
import { z } from "zod";
const createUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "PROFESOR", "PARENT"]),
});

export const createUser = mutation({
  args: createUserSchema,
  handler: async (ctx, args) => {
    // Validated args are type-safe
  },
});
```

### Patterns to Avoid

```typescript
// ❌ AVOID: Direct database access without auth
export const insecureQuery = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect(); // No auth check
  }
});

// ❌ AVOID: Client-side role checking
export default function AdminPage() {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") return <div>Access denied</div>; // Insecure
  // This can be bypassed by modifying client state
}

// ❌ AVOID: Shared state without proper invalidation
export const useCachedData = () => {
  const [data, setData] = useState(null);
  // No cache invalidation strategy
};
```

---

## 🐛 TROUBLESHOOTING PATTERNS

### Authentication Issues

```json
{
  "auth_problems": {
    "clerk_session_expired": {
      "symptoms": ["401 errors", "session null"],
      "solution": "Check Clerk dashboard, verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "prevention": "Implement proper session refresh handling"
    },
    "convex_user_not_found": {
      "symptoms": ["User authenticated but no Convex record"],
      "solution": "Sync Clerk user to Convex database",
      "prevention": "Ensure user creation webhooks are configured"
    },
    "role_mismatch": {
      "symptoms": ["Access denied despite correct login"],
      "solution": "Verify role in Convex database matches expected access",
      "prevention": "Use consistent role definitions across systems"
    }
  }
}
```

### Database Issues

```json
{
  "database_problems": {
    "connection_failed": {
      "symptoms": ["Convex client errors", "network timeouts"],
      "solution": "Verify NEXT_PUBLIC_CONVEX_URL, check Convex service status",
      "prevention": "Implement connection retry logic"
    },
    "schema_mismatch": {
      "symptoms": ["Type errors", "validation failures"],
      "solution": "Run convex deploy, regenerate types",
      "prevention": "Keep schema.ts and client types in sync"
    },
    "index_missing": {
      "symptoms": ["Slow queries", "timeout errors"],
      "solution": "Add appropriate indexes to schema.ts",
      "prevention": "Profile queries and add indexes proactively"
    }
  }
}
```

---

## 📊 METRICS AND MONITORING

### Key Performance Indicators

```json
{
  "performance_metrics": {
    "authentication": {
      "login_success_rate": ">99.5%",
      "session_duration": "24 hours",
      "failed_login_threshold": "5 attempts"
    },
    "database": {
      "query_response_time": "<100ms average",
      "connection_pool_utilization": "<80%",
      "realtime_subscription_latency": "<50ms"
    },
    "user_experience": {
      "page_load_time": "<2 seconds",
      "time_to_interactive": "<3 seconds",
      "error_rate": "<0.1%"
    }
  }
}
```

### Monitoring Points

- **Authentication**: Clerk dashboard, custom login analytics
- **Database**: Convex dashboard, query performance metrics
- **Application**: Vercel analytics, custom error tracking
- **User Activity**: Role-based feature usage analytics

---

## 🔄 MIGRATION PATTERNS

### From NextAuth to Clerk

```json
{
  "migration_steps": {
    "phase_1": "Install Clerk packages, configure providers",
    "phase_2": "Update authentication logic in src/lib/auth.ts",
    "phase_3": "Migrate user data to Clerk with clerkId mapping",
    "phase_4": "Update middleware and route protection",
    "phase_5": "Test all authentication flows"
  },
  "breaking_changes": {
    "session_format": "Clerk sessions vs NextAuth JWT",
    "user_resolution": "Convex lookup required for role data",
    "middleware_logic": "proxy.ts role enforcement"
  }
}
```

### From Prisma to Convex

```json
{
  "migration_steps": {
    "phase_1": "Define Convex schema in convex/schema.ts",
    "phase_2": "Migrate data using Convex import tools",
    "phase_3": "Update service layer to use Convex functions",
    "phase_4": "Replace API routes with Convex queries/mutations",
    "phase_5": "Implement real-time subscriptions"
  },
  "data_mapping": {
    "relations": "Foreign keys become v.id() references",
    "queries": "Prisma findMany → Convex query with filters",
    "mutations": "Prisma create → Convex mutation with validation"
  }
}
```

---

## 🔒 SECURITY PATTERNS

### Authentication Security Constraints

```json
{
  "security_requirements": {
    "session_management": {
      "token_rotation": "24 hour expiry with automatic refresh",
      "secure_storage": "HttpOnly cookies, no localStorage for sensitive data",
      "csrf_protection": "Built-in Clerk CSRF protection",
      "session_invalidation": "Immediate logout on role change or deactivation"
    },
    "password_policies": {
      "complexity": "Minimum 8 characters, mixed case, numbers, symbols",
      "history": "Prevent reuse of last 5 passwords",
      "lockout": "5 failed attempts = 15 minute lockout",
      "reset_security": "Secure reset links with 15 minute expiry"
    },
    "api_security": {
      "rate_limiting": "100 requests/minute per IP, 1000/hour per user",
      "input_validation": "Zod schemas for all inputs, sanitize HTML content",
      "cors_policy": "Strict origin validation, no wildcard allowed",
      "headers": "Security headers: HSTS, CSP, X-Frame-Options"
    }
  }
}
```

### Data Protection Patterns

```typescript
// ✅ SECURE: Encrypted data storage and transmission
export const secureUserData = mutation({
  args: { sensitiveData: v.string() },
  handler: async (ctx, args) => {
    // Validate user permissions first
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Encrypt sensitive data before storage
    const encrypted = await encryptData(args.sensitiveData, user.id);

    return await ctx.db.insert("secureData", {
      userId: user.id,
      encryptedData: encrypted,
      createdAt: Date.now(),
    });
  },
});

// ❌ INSECURE: Plain text sensitive data
export const insecureUserData = mutation({
  args: { sensitiveData: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userData", {
      data: args.sensitiveData, // No encryption!
    });
  },
});
```

### Access Control Patterns

```json
{
  "rbac_implementation": {
    "role_hierarchy": {
      "MASTER": ["read", "write", "delete", "admin", "system"],
      "ADMIN": ["read", "write", "delete", "admin"],
      "PROFESOR": ["read", "write", "teaching"],
      "PARENT": ["read", "parent"],
      "PUBLIC": ["read"]
    },
    "resource_permissions": {
      "user_management": ["MASTER", "ADMIN"],
      "grade_management": ["MASTER", "ADMIN", "PROFESOR"],
      "meeting_scheduling": ["MASTER", "ADMIN", "PROFESOR", "PARENT"],
      "voting_system": ["MASTER", "ADMIN", "PROFESOR", "PARENT"],
      "system_settings": ["MASTER"]
    },
    "field_level_security": {
      "user_sensitive_fields": ["password", "clerkId", "securityTokens"],
      "grade_private_fields": ["internalNotes", "adjustmentReason"],
      "audit_fields": ["createdBy", "updatedBy", "auditTrail"]
    }
  }
}
```

---

## 📈 PERFORMANCE PATTERNS

### Database Optimization Strategies

```json
{
  "query_optimization": {
    "indexing_strategy": {
      "primary_indexes": [
        "users.by_email",
        "users.by_clerkId",
        "users.by_role"
      ],
      "composite_indexes": [
        "meetings.by_user_status",
        "grades.by_student_course",
        "votes.by_endDate_active"
      ],
      "pagination_indexes": [
        "planningDocuments.by_author_createdAt",
        "notifications.by_user_createdAt"
      ]
    },
    "query_patterns": {
      "efficient_queries": {
        "with_index": "query.withIndex('by_email').eq('email', value)",
        "pagination": "query.paginate({ numItems: 20, cursor: null })",
        "selective_fields": "query.first().then(user => ({ id: user.id, name: user.name }))"
      },
      "inefficient_anti_patterns": [
        "query.collect() without limits",
        "multiple sequential queries instead of batch",
        "no pagination for large result sets"
      ]
    }
  }
}
```

### Caching and Real-time Patterns

```typescript
// ✅ EFFICIENT: Smart caching with invalidation
export const useOptimizedData = (userId: string) => {
  return useQuery(
    api.users.getUserData,
    { userId },
    {
      // Cache for 5 minutes, refetch on window focus
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
  );
};

// ✅ EFFICIENT: Real-time subscriptions with filtering
export const useRealtimeUpdates = (userId: string) => {
  return useQuery(
    api.notifications.getUserNotifications,
    { userId },
    {
      // Enable real-time updates
      enableRealTime: true,
      // Only refetch when relevant data changes
      refetchOnMount: false,
    },
  );
};
```

### Performance Monitoring

```json
{
  "performance_metrics": {
    "frontend_metrics": {
      "core_web_vitals": {
        "lcp": "<2.5s",
        "fid": "<100ms",
        "cls": "<0.1"
      },
      "custom_metrics": {
        "api_response_time": "<500ms",
        "page_load_time": "<3s",
        "bundle_size": "<500KB"
      }
    },
    "backend_metrics": {
      "convex_metrics": {
        "query_execution_time": "<100ms average",
        "mutation_execution_time": "<200ms average",
        "realtime_latency": "<50ms"
      },
      "database_metrics": {
        "connection_pool_usage": "<80%",
        "query_cache_hit_rate": ">90%",
        "index_usage_rate": ">95%"
      }
    },
    "monitoring_tools": {
      "application": "Vercel Analytics + Sentry",
      "database": "Convex Dashboard",
      "performance": "Lighthouse CI + Web Vitals"
    }
  }
}
```

---

## 🚀 DEPLOYMENT PATTERNS

### Deployment Pipeline Architecture

```json
{
  "deployment_stages": {
    "development": {
      "environment": "local development",
      "triggers": "manual or git push to feature branches",
      "validation": ["type-check", "lint", "unit-tests"],
      "artifacts": "development build with source maps"
    },
    "staging": {
      "environment": "staging server",
      "triggers": "merge to staging branch",
      "validation": ["integration-tests", "e2e-tests", "performance-tests"],
      "artifacts": "optimized production build"
    },
    "production": {
      "environment": "production servers",
      "triggers": "merge to main branch + manual approval",
      "validation": ["full-test-suite", "security-scan", "load-test"],
      "artifacts": "optimized, minified production build"
    }
  },
  "deployment_strategy": {
    "blue_green": {
      "description": "Zero-downtime deployment with instant rollback",
      "implementation": "Vercel automatic blue-green deployments",
      "rollback_time": "< 30 seconds"
    },
    "canary": {
      "description": "Gradual rollout with traffic shifting",
      "implementation": "Vercel traffic splitting",
      "monitoring": "Error rates, performance metrics during rollout"
    }
  }
}
```

### Deployment Automation Scripts

```typescript
// deployment/verification.ts
export const preDeploymentChecks = async () => {
  const checks = [
    { name: "TypeScript", check: () => runCommand("npm run type-check") },
    { name: "Linting", check: () => runCommand("npm run lint") },
    { name: "Unit Tests", check: () => runCommand("npm run test:unit") },
    { name: "Build Test", check: () => runCommand("npm run build") },
    {
      name: "Convex Schema",
      check: () => runCommand("npx convex deploy --dry-run"),
    },
  ];

  for (const check of checks) {
    console.log(`Running ${check.name}...`);
    const result = await check.check();
    if (!result.success) {
      throw new Error(`${check.name} failed: ${result.error}`);
    }
  }

  console.log("✅ All pre-deployment checks passed");
};
```

### Rollback Procedures

```json
{
  "rollback_strategies": {
    "automatic_rollback": {
      "triggers": [
        "error_rate > 5%",
        "response_time > 5s",
        "p95_latency > 10s"
      ],
      "implementation": "Vercel automatic rollback to previous deployment",
      "notification": "Slack alerts to development team"
    },
    "manual_rollback": {
      "process": [
        "Identify failing deployment in Vercel dashboard",
        "Click 'Rollback' button or redeploy previous commit",
        "Monitor error rates and performance metrics",
        "Notify stakeholders of rollback",
        "Investigate root cause in separate branch"
      ],
      "time_to_resolve": "< 10 minutes"
    },
    "data_rollback": {
      "convex_rollback": [
        "Use Convex dashboard to restore from backup",
        "Verify data integrity after restore",
        "Update any affected client caches",
        "Notify users of temporary data rollback"
      ]
    }
  }
}
```

---

## 🧪 TESTING PATTERNS

### Comprehensive Testing Strategy

```json
{
  "testing_pyramid": {
    "unit_tests": {
      "coverage": ">90%",
      "scope": "Individual functions and components",
      "tools": ["Vitest", "React Testing Library"],
      "patterns": [
        "Test business logic in pure functions",
        "Mock external dependencies (Convex, Clerk)",
        "Test component rendering and interactions",
        "Test error handling and edge cases"
      ]
    },
    "integration_tests": {
      "coverage": ">80%",
      "scope": "Component and API integration",
      "tools": ["Vitest", "Convex Test Environment"],
      "patterns": [
        "Test Convex function calls",
        "Test authentication flows",
        "Test data relationships and constraints",
        "Test real-time subscriptions"
      ]
    },
    "e2e_tests": {
      "coverage": ">70%",
      "scope": "Complete user journeys",
      "tools": ["Playwright"],
      "patterns": [
        "Test critical user paths (login, CRUD operations)",
        "Test role-based access control",
        "Test responsive design across devices",
        "Test error recovery scenarios"
      ]
    }
  }
}
```

### Test Implementation Patterns

```typescript
// ✅ COMPREHENSIVE: Unit test with mocking
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMutation } from 'convex/react';
import UserForm from './UserForm';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

describe('UserForm', () => {
  it('creates user successfully', async () => {
    const mockCreateUser = vi.fn().mockResolvedValue({ id: '123' });
    (useMutation as any).mockReturnValue(mockCreateUser);

    render(<UserForm />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.click(screen.getByText('Create User'));

    expect(mockCreateUser).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});
```

### Test Data Management

```json
{
  "test_data_patterns": {
    "fixture_strategy": {
      "static_fixtures": "JSON files with consistent test data",
      "dynamic_generation": "Factories for varied test scenarios",
      "cleanup_patterns": "Automatic cleanup after each test"
    },
    "data_isolation": {
      "test_database": "Separate Convex environment for tests",
      "transaction_rollback": "Wrap tests in transactions",
      "cleanup_hooks": "Before/after hooks for data reset"
    },
    "edge_cases": {
      "error_scenarios": [
        "network failures",
        "permission denied",
        "validation errors"
      ],
      "boundary_conditions": [
        "empty data",
        "maximum limits",
        "special characters"
      ],
      "concurrent_access": ["race conditions", "locking conflicts"]
    }
  }
}
```

---

## 🛠️ ERROR HANDLING PATTERNS

### Comprehensive Error Classification

```json
{
  "error_hierarchy": {
    "authentication_errors": {
      "session_expired": "CLERK_SESSION_EXPIRED",
      "insufficient_permissions": "INSUFFICIENT_PERMISSIONS",
      "user_not_found": "USER_NOT_FOUND",
      "invalid_credentials": "INVALID_CREDENTIALS"
    },
    "validation_errors": {
      "schema_validation": "VALIDATION_ERROR",
      "business_rule_violation": "BUSINESS_RULE_ERROR",
      "data_integrity": "DATA_INTEGRITY_ERROR",
      "constraint_violation": "CONSTRAINT_VIOLATION"
    },
    "system_errors": {
      "database_connection": "DATABASE_ERROR",
      "external_service": "EXTERNAL_SERVICE_ERROR",
      "resource_exhaustion": "RESOURCE_ERROR",
      "configuration_error": "CONFIG_ERROR"
    },
    "user_errors": {
      "input_error": "USER_INPUT_ERROR",
      "network_error": "NETWORK_ERROR",
      "timeout_error": "TIMEOUT_ERROR",
      "unsupported_operation": "UNSUPPORTED_ERROR"
    }
  }
}
```

### Error Handling Implementation

```typescript
// ✅ ROBUST: Comprehensive error handling
export const robustMutation = mutation({
  args: z.object({ data: z.string() }),
  handler: async (ctx, args) => {
    try {
      // Validate authentication
      const user = await getCurrentUser(ctx);
      if (!user) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Validate permissions
      if (!canPerformAction(user, "create")) {
        throw new ConvexError({
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Insufficient permissions for this action",
        });
      }

      // Validate business rules
      const validation = await validateBusinessRules(args.data);
      if (!validation.valid) {
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: validation.message,
          field: validation.field,
        });
      }

      // Perform operation
      const result = await performOperation(args.data);

      return result;
    } catch (error) {
      // Log error for monitoring
      console.error("Operation failed:", error);

      // Re-throw ConvexError as-is
      if (error instanceof ConvexError) {
        throw error;
      }

      // Wrap unknown errors
      throw new ConvexError({
        code: "INTERNAL_ERROR",
        message: "An internal error occurred",
      });
    }
  },
});
```

### Client-Side Error Handling

```typescript
// ✅ USER-FRIENDLY: Client error handling with recovery
export const useErrorHandling = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback(
    async (error: any) => {
      // Classify error type
      const errorType = classifyError(error);

      switch (errorType) {
        case "NETWORK_ERROR":
          // Auto-retry network errors
          if (!isRetrying) {
            setIsRetrying(true);
            setTimeout(() => {
              retryOperation();
              setIsRetrying(false);
            }, 1000);
          }
          break;

        case "AUTHENTICATION_ERROR":
          // Redirect to login
          redirectToLogin();
          break;

        case "VALIDATION_ERROR":
          // Show field-specific error
          setFieldError(error.field, error.message);
          break;

        default:
          // Show generic error message
          setError("An unexpected error occurred. Please try again.");
      }
    },
    [isRetrying],
  );

  return { error, handleError, isRetrying };
};
```

---

## 🔄 INTEGRATION PATTERNS

### Third-Party Service Integration

```json
{
  "integration_patterns": {
    "cloudinary_media": {
      "upload_pattern": {
        "client_upload": "Direct upload from browser to Cloudinary",
        "server_side": "Secure server-side upload with authentication",
        "optimization": "Automatic format conversion and compression"
      },
      "security": {
        "signed_uploads": "Server-generated signatures for secure uploads",
        "access_control": "Institution-based folder structure",
        "cleanup": "Automatic deletion of unused assets"
      }
    },
    "email_service": {
      "provider": "Resend or similar service",
      "patterns": {
        "transactional": "Password resets, notifications",
        "bulk": "Newsletter distribution with rate limiting",
        "templates": "Pre-built email templates with i18n"
      },
      "error_handling": {
        "retry_logic": "Exponential backoff for failed sends",
        "fallback": "Alternative delivery methods",
        "monitoring": "Delivery rates and bounce tracking"
      }
    },
    "external_apis": {
      "educational_apis": {
        "mineduc_integration": "Chilean education system integration",
        "authentication": "OAuth 2.0 or API key based",
        "rate_limiting": "Respect external API limits",
        "caching": "Cache responses to reduce external calls"
      }
    }
  }
}
```

### Webhook Implementation Patterns

```typescript
// ✅ SECURE: Webhook signature verification
export async function handleClerkWebhook(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("clerk-signature");

  // Verify webhook signature
  const isValid = verifyWebhookSignature(payload, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // Handle different event types
  switch (event.type) {
    case "user.created":
      await handleUserCreated(event.data);
      break;
    case "user.updated":
      await handleUserUpdated(event.data);
      break;
    case "user.deleted":
      await handleUserDeleted(event.data);
      break;
  }

  return NextResponse.json({ success: true });
}
```

### Data Synchronization Patterns

```typescript
// ✅ RELIABLE: Idempotent data synchronization
export const syncExternalData = mutation({
  args: { externalId: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    // Check if already synced (idempotency)
    const existing = await ctx.db
      .query("externalSync")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();

    if (existing) {
      // Update existing record
      return await ctx.db.patch(existing._id, {
        data: args.data,
        lastSynced: Date.now(),
        syncStatus: "updated",
      });
    } else {
      // Create new record
      return await ctx.db.insert("externalSync", {
        externalId: args.externalId,
        data: args.data,
        lastSynced: Date.now(),
        syncStatus: "created",
      });
    }
  },
});
```

---

## 🌐 INTERNATIONALIZATION PATTERNS

### i18n Architecture Implementation

```json
{
  "i18n_system": {
    "chunked_loading": {
      "description": "Load translation namespaces on-demand",
      "implementation": "Divine Parsing Oracle chunked system",
      "performance": "Optimizes bundle size by loading only required translations"
    },
    "supported_languages": {
      "primary": "Spanish (es) - Default",
      "secondary": "English (en)",
      "structure": "src/locales/{lang}/page-specific.json"
    },
    "loading_patterns": {
      "page_specific": "Load namespace for current page only",
      "component_level": "Load additional namespaces for complex components",
      "fallback": "Graceful fallback to Spanish if translation missing"
    }
  }
}
```

### Translation Implementation Patterns

```typescript
// ✅ CORRECT: Page-specific i18n loading
import { useDivineParsing } from '@/hooks/useDivineParsing';

export default function MyPage() {
  // Load page-specific translations
  const { t, isLoading } = useDivineParsing('my-page');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
      <section>
        <h2>{t('section.title')}</h2>
        <p>{t('section.content')}</p>
      </section>
    </div>
  );
}
```

### Translation File Structure

```json
{
  "translation_file_structure": {
    "naming_convention": "page-or-component-name.json",
    "key_structure": "section.subsection.key",
    "variable_interpolation": "Use {{variable}} syntax",
    "pluralization": "Support for singular/plural forms",
    "context_aware": "Keys can include context (_error, _success, etc.)"
  },
  "common_patterns": {
    "forms": {
      "validation": "fieldName.error.required",
      "labels": "fieldName.label",
      "placeholders": "fieldName.placeholder"
    },
    "navigation": {
      "menu_items": "nav.itemName",
      "breadcrumbs": "nav.breadcrumb.pageName"
    },
    "messages": {
      "success": "message.success.actionCompleted",
      "error": "message.error.actionFailed",
      "warning": "message.warning.confirmAction"
    }
  }
}
```

### i18n Best Practices

```json
{
  "i18n_best_practices": {
    "key_naming": {
      "descriptive": "Use clear, descriptive keys",
      "consistent": "Follow established patterns across pages",
      "hierarchical": "Use dot notation for organization",
      "action_oriented": "Name keys by purpose, not content"
    },
    "performance": {
      "chunk_loading": "Load only required namespaces per page",
      "lazy_loading": "Defer loading until translation needed",
      "caching": "Cache loaded translations in memory",
      "minimize_payload": "Keep translation files focused and minimal"
    },
    "maintainability": {
      "centralized_keys": "Avoid duplicating keys across files",
      "documentation": "Document key purposes in comments",
      "validation": "Validate translation completeness",
      "consistency": "Use consistent terminology across languages"
    },
    "accessibility": {
      "semantic_keys": "Keys should convey meaning, not just text",
      "context_preservation": "Maintain context in translations",
      "cultural_adaptation": "Consider cultural differences in translations",
      "rtl_support": "Design for right-to-left languages if needed"
    }
  }
}
```

---

## 🤖 CODE GENERATION PATTERNS

### AI-Assisted Development Guidelines

```json
{
  "code_generation_rules": {
    "authentication_patterns": {
      "always_verify": "Every Convex function must check authentication",
      "role_based": "Use getCurrentUser() and check permissions",
      "error_messages": "Use ConvexError with specific error codes",
      "session_handling": "Validate session before any sensitive operations"
    },
    "data_patterns": {
      "schema_first": "Define Convex schema before implementing functions",
      "validation_zod": "Use Zod for input validation in all mutations",
      "indexing_strategy": "Add indexes for frequently queried fields",
      "relationships": "Use proper foreign key relationships"
    },
    "ui_patterns": {
      "component_structure": "Use shadcn/ui components with consistent patterns",
      "state_management": "Use Convex hooks for server state",
      "error_boundaries": "Wrap components with error boundaries",
      "accessibility": "Include ARIA labels and keyboard navigation"
    },
    "testing_patterns": {
      "unit_tests": "Test business logic and component rendering",
      "integration_tests": "Test Convex function calls and data flow",
      "e2e_tests": "Test complete user journeys",
      "mocking_strategy": "Mock external dependencies appropriately"
    }
  }
}
```

### Component Generation Templates

```typescript
// TEMPLATE: Authenticated Page Component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const user = useQuery(api.users.getCurrentUser);

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) redirect("/auth/login");

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {/* Page content */}
    </div>
  );
}
```

```typescript
// TEMPLATE: Convex Mutation with Validation
import { mutation } from "./_generated/server";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(["A", "B", "C"]),
});

export const createItem = mutation({
  args: createItemSchema,
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError({ code: "UNAUTHORIZED" });

    // Business logic validation
    const existing = await ctx.db
      .query("items")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new ConvexError({
        code: "VALIDATION_ERROR",
        message: "Item name already exists",
      });
    }

    return await ctx.db.insert("items", {
      ...args,
      createdBy: user._id,
      createdAt: Date.now(),
    });
  },
});
```

---

**This AI Knowledge Base contains all consolidated documentation optimized for machine processing and understanding. Cross-reference all implementation decisions against these patterns and constraints.**
