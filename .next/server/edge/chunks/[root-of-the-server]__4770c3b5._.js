(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__4770c3b5._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/middleware-auth.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Middleware-compatible authentication helper
// This runs in Edge Runtime and doesn't use Prisma
__turbopack_context__.s([
    "getMiddlewareAuth",
    ()=>getMiddlewareAuth,
    "getRoleRedirectPath",
    ()=>getRoleRedirectPath,
    "hasMiddlewareAccess",
    ()=>hasMiddlewareAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)");
;
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production');
async function getMiddlewareAuth(request) {
    try {
        // Get the session token from cookies (NextAuth uses 'next-auth.session-token')
        const token = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value;
        if (!token) {
            return null;
        }
        // Verify and decode the JWT
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
        // Extract user data from JWT payload
        const user = {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            needsRegistration: payload.needsRegistration,
            isOAuthUser: payload.isOAuthUser
        };
        return {
            user,
            expires: payload.exp ? new Date(payload.exp * 1000).toISOString() : new Date().toISOString()
        };
    } catch (error) {
        // Token is invalid or expired
        console.warn('Middleware auth error:', error);
        return null;
    }
}
function hasMiddlewareAccess(userRole, requiredRoles) {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
}
function getRoleRedirectPath(userRole) {
    switch(userRole){
        case 'MASTER':
            return '/master';
        case 'ADMIN':
            return '/admin';
        case 'PROFESOR':
            return '/profesor';
        case 'PARENT':
            return '/parent';
        default:
            return '/';
    }
}
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/middleware-auth.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
// Role hierarchy for authorization (future use in role comparison)
const _ROLE_HIERARCHY = {
    MASTER: 4,
    ADMIN: 3,
    PROFESOR: 2,
    PARENT: 1,
    PUBLIC: 0
};
// Route access control matrix
const ROUTE_ACCESS = {
    '/master': [
        'MASTER'
    ],
    '/admin': [
        'MASTER',
        'ADMIN'
    ],
    '/profesor': [
        'MASTER',
        'ADMIN',
        'PROFESOR'
    ],
    '/parent': [
        'MASTER',
        'ADMIN',
        'PARENT'
    ],
    '/api/master': [
        'MASTER'
    ],
    '/api/admin': [
        'MASTER',
        'ADMIN'
    ],
    '/api/profesor': [
        'MASTER',
        'ADMIN',
        'PROFESOR'
    ],
    '/api/parent': [
        'MASTER',
        'ADMIN',
        'PARENT'
    ]
};
// Security headers for all responses
const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
};
function addSecurityHeaders(response) {
    Object.entries(SECURITY_HEADERS).forEach(([key, value])=>{
        response.headers.set(key, value);
    });
    return response;
}
async function middleware(req) {
    try {
        const { nextUrl } = req;
        const pathname = nextUrl.pathname;
        // Skip middleware for static assets and system paths
        if (pathname.includes('_next/static') || pathname.includes('_next/image') || pathname.includes('favicon') || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        }
        // Get session and user info using middleware-compatible auth
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getMiddlewareAuth"])(req);
        const isLoggedIn = Boolean(session?.user);
        const userRole = session?.user?.role;
        // Log security events in development
        if ("TURBOPACK compile-time truthy", 1) {
            console.log(`🔐 Route: ${pathname} | User: ${userRole || 'ANONYMOUS'} | Logged: ${isLoggedIn}`);
        }
        // Handle auth pages
        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/registro');
        if (isAuthPage && isLoggedIn && userRole) {
            const redirectPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getRoleRedirectPath"])(userRole);
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(redirectPath, nextUrl));
            return addSecurityHeaders(response);
        }
        // Check if route requires authentication
        const requiresAuth = Object.keys(ROUTE_ACCESS).some((route)=>pathname.startsWith(route));
        if (requiresAuth && !isLoggedIn) {
            const loginUrl = new URL('/login', nextUrl);
            loginUrl.searchParams.set('callbackUrl', nextUrl.toString());
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
            return addSecurityHeaders(response);
        }
        // Check authorization for protected routes
        if (requiresAuth) {
            // Find matching route pattern for authorization
            const matchingRoute = Object.keys(ROUTE_ACCESS).find((route)=>pathname.startsWith(route));
            if (matchingRoute && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["hasMiddlewareAccess"])(userRole, ROUTE_ACCESS[matchingRoute])) {
                // Log unauthorized access attempt
                console.warn(`🚨 Unauthorized access attempt: ${userRole} → ${pathname}`);
                // Redirect to appropriate dashboard or show unauthorized
                const allowedPath = isLoggedIn && userRole ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getRoleRedirectPath"])(userRole) : '/unauthorized';
                const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(allowedPath, nextUrl));
                return addSecurityHeaders(response);
            }
        }
        // Add security headers to all responses
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        return addSecurityHeaders(response);
    } catch (error) {
        console.error('🚨 Middleware error:', error);
        // Fail secure - redirect to login on error
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.nextUrl));
        return addSecurityHeaders(response);
    }
}
const config = {
    matcher: [
        // Match all request paths except static files and system paths
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__4770c3b5._.js.map