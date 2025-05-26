(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__70655b._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/middleware.ts [middleware] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import type { NextRequest } from 'next/server';
// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   // Define protected routes and their required roles
//   const protectedRoutes: { [key: string]: string } = {
//     '/admin': 'Admin',
//     '/client': 'Client',
//     '/agent': 'Agent',
//   };
//   // Public routes that authenticated users should not access
//   const publicRoutes = ['/', '/signin', '/register'];
//   const isPublicRoute = publicRoutes.includes(pathname);
//   // Skip middleware for auth-related routes and static files
//   if (
//     pathname.startsWith('/api/auth') || 
//     // pathname === '/signin' ||
//     pathname.startsWith('/_next') ||
//     pathname.includes('.')
//   ) {
//     return NextResponse.next();
//   }
//   // Check if the requested path is protected
//   const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
//     pathname.startsWith(route)
//   );
//   // Handle authenticated users
//   if (token) {
//     const userRole = token.type as string;
//     const username = token.name as string;
//     // Map roles to their base dashboard paths
//     const roleDashboards: { [key: string]: string } = {
//       Admin: `/admin/${username}/`,
//       Client: `/client/${username}/`,
//       Agent: `/agent/${username}/`,
//     };
//     const userDashboard = roleDashboards[userRole];
//     // Check if user is already on their dashboard
//     const isOnDashboard = pathname.startsWith(`/${userRole.toLowerCase()}/${username}`);
//     // Only redirect if:
//     // 1. User is on a public route
//     // 2. User is trying to access a different role's route
//     // 3. User is on the base role route (e.g., /admin) but not their dashboard
//     if (
//       (isPublicRoute && !isOnDashboard) || 
//       (isProtectedRoute && !isOnDashboard && protectedRoutes[pathname.split('/')[1]] !== userRole)
//     ) {
//       return NextResponse.redirect(new URL(userDashboard, request.url));
//     }
//     // Check if user has the correct role for the protected route
//     if (isProtectedRoute && !isOnDashboard) {
//       const requiredRole = Object.entries(protectedRoutes).find(([route]) =>
//         pathname.startsWith(route)
//       )?.[1];
//       if (requiredRole && userRole !== requiredRole) {
//         return NextResponse.redirect(new URL('/not-found', request.url));
//       }
//     }
//   } else if (isProtectedRoute) {
//     // Redirect unauthenticated users to sign-in
//     const signInUrl = new URL('/signin', request.url);
//     // signInUrl.searchParams.set('callbackUrl', pathname);
//     // signInUrl.searchParams.set('error', 'Please login');
//     return NextResponse.redirect(signInUrl);
//   }
//   // Allow the request to proceed if all checks pass
//   return NextResponse.next();
// }
// // Apply middleware to protected routes and public routes
// export const config = {
//   matcher: ['/admin/:path*', '/client/:path*', '/agent/:path*', '/', '/signin', '/register'],
// };
__turbopack_esm__({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/api/server.js [middleware] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next-auth/jwt/index.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware] (ecmascript)");
;
;
// Check if a route is public (no authentication required)
function isPublicRoute(pathname) {
    // Match dynamic public routes for clients and agents
    if (pathname.match(/^\/company\/[^\/]+\/(clientlogin|clientregister|agentlogin)$/)) {
        return true;
    }
    return false;
}
// Get the user's dashboard route based on their role and token data
function getDashboardRoute(token) {
    const role = token.type;
    const username = token.name;
    const companyId = token.company_id;
    if (role === 'Admin') {
        return `/admin/${username}`;
    } else if (role === 'client') {
        return `/company/${companyId}/client/${username}`;
    } else if (role === 'helper') {
        return `/company/${companyId}/agent/${username}`;
    }
    return '/';
}
// Check if the user has access to the requested route
function hasAccess(pathname, token) {
    const role = token.type;
    const username = token.name;
    const companyId = token.company_id;
    if (role === 'Admin') {
        return pathname.startsWith('/admin/');
    } else if (role === 'client') {
        // Match both base client routes and ticket routes
        const match = pathname.match(/^\/company\/([^\/]+)\/client\/([^\/]+)(?:\/[^\/]+)?$/);
        if (match) {
            const pathCompanyId = match[1];
            const pathClientId = match[2];
            return pathCompanyId === companyId && pathClientId === username;
        }
    } else if (role === 'helper') {
        const match = pathname.match(/^\/company\/([^\/]+)\/agent\/([^\/]+)/);
        if (match) {
            const pathCompanyId = match[1];
            const pathAgentId = match[2];
            return pathCompanyId === companyId && pathAgentId === username;
        }
    }
    return false;
}
async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["getToken"])({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });
    // Skip middleware for auth-related routes and static files
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const isPublic = isPublicRoute(pathname);
    if (token) {
        const dashboardRoute = getDashboardRoute(token);
        // Redirect authenticated users from public routes to their dashboard
        if (isPublic) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(dashboardRoute, request.url));
        }
        // For admin routes, only check if the user is an admin
        if (pathname.startsWith('/admin/') && token.type !== 'Admin') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/not-found', request.url));
        }
        // For other protected routes, check access
        if (!pathname.startsWith('/admin/') && !hasAccess(pathname, token)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/not-found', request.url));
        }
    } else if (!isPublic) {
        // Redirect unauthenticated users to sign-in for protected routes
        const signInUrl = new URL('/signin', request.url);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(signInUrl);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/admin/:path*',
        '/company/:companyid/client/:clientid/:path*',
        '/company/:companyid/agent/:agentid/:path*',
        '/company/:companyid/clientlogin',
        '/company/:companyid/clientregister',
        '/company/:companyid/agentlogin'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__70655b._.js.map