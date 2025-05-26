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

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Check if a route is public (no authentication required)
function isPublicRoute(pathname: string): boolean {
  // Match dynamic public routes for clients and agents
  if (pathname.match(/^\/company\/[^\/]+\/(clientlogin|clientregister|agentlogin)$/)) {
    return true;
  }
  return false;
}

// Get the user's dashboard route based on their role and token data
function getDashboardRoute(token: any): string {
  const role = token.type as string;
  const username = token.name as string;
  const companyId = token.company_id as string;

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
function hasAccess(pathname: string, token: any): boolean {
  const role = token.type as string;
  const username = token.name as string;
  const companyId = token.company_id as string;

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Skip middleware for auth-related routes and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublic = isPublicRoute(pathname);

  if (token) {
    const dashboardRoute = getDashboardRoute(token);

    // Redirect authenticated users from public routes to their dashboard
    if (isPublic) {
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }

    // For admin routes, only check if the user is an admin
    if (pathname.startsWith('/admin/') && token.type !== 'Admin') {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // For other protected routes, check access
    if (!pathname.startsWith('/admin/') && !hasAccess(pathname, token)) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
  } else if (!isPublic) {
    // Redirect unauthenticated users to sign-in for protected routes
    const signInUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Define the routes to apply the middleware to
export const config = {
  matcher: [
    '/admin/:path*',
    '/company/:companyid/client/:clientid/:path*',
    '/company/:companyid/agent/:agentid/:path*',
    '/company/:companyid/clientlogin',
    '/company/:companyid/clientregister',
    '/company/:companyid/agentlogin',
  ],
};