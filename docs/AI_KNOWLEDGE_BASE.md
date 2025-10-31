# AI Knowledge Base - Plataforma Astral

**Educational Management System**

**Version**: 0.1.0
**Last Updated**: October 31, 2025
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
    "last_updated": "2025-10-31",
    "migration_status": "Convex/Clerk migration complete (2025-01-07)"
  },
  "technologies": {
    "frontend": {
      "framework": "Next.js",
      "version": "16.0.0",
      "router": "App Router",
      "react_version": "19.2.0",
      "typescript_version": "5.9.2"
    },
    "backend": {
      "framework": "Convex",
      "version": "1.27.4",
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

```
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
    "providers": ["credentials", "google_oauth"],
    "role_mapping": {
      "MASTER": { "access": "complete_system", "auth": "credentials_only" },
      "ADMIN": { "access": "administrative", "auth": "credentials_only" },
      "PROFESOR": { "access": "teaching", "auth": "credentials_only" },
      "PARENT": { "access": "parent_features", "auth": "oauth_preferred" }
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

**Pattern 1: Standard Login**

```
User Login → Clerk Auth → proxy.ts → Convex User Resolution → Role-Based Dashboard
```

**Pattern 2: OAuth Registration**

```
Google OAuth → Clerk User Created → Convex User Sync → Registration Completion → Dashboard
```

**Pattern 3: Emergency Access**

```
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

**Pattern 1: Authenticated Query**

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

**Pattern 2: Admin-Only Mutation**

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

**Pattern 1: Convex Client Initialization**

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

### File Relationships

```json
{
  "convex_functions": {
    "auth_related": ["convex/users.ts", "convex/auth.ts"],
    "feature_related": [
      "convex/votes.ts",
      "convex/students.ts",
      "convex/grades.ts"
    ],
    "utility_functions": ["convex/schema.ts", "convex/_generated/*"]
  },
  "api_routes": {
    "admin_endpoints": ["src/app/api/admin/*"],
    "parent_endpoints": ["src/app/api/parent/*"],
    "public_endpoints": ["src/app/api/public/*"]
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

**This AI Knowledge Base contains all consolidated documentation optimized for machine processing and understanding. Cross-reference all implementation decisions against these patterns and constraints.**
