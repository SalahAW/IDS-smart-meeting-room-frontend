import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

// Define routes that are restricted to admins
const adminRoutes = [
    '/dashboard/users',
    '/dashboard/analytics',
];

// Define routes that guests are NOT allowed to access
const guestBlockedRoutes = [
    '/dashboard/rooms',
    '/dashboard/calendar',
    '/dashboard/minutes',
    '/dashboard/schedule',
    ...adminRoutes
];

export default auth(async (req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;
    const isLoggedIn = !!session;

    const isAuthPage = pathname === '/';
    const isProtectedRoute = pathname.startsWith('/dashboard');

    // 1. If logged in, redirect away from the login page
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // 2. If not logged in, protect the dashboard routes
    if (!isLoggedIn && isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // 3. If logged in and on a protected route, perform role checks
    if (isLoggedIn && isProtectedRoute) {
        const userRole = session.user.role;

        // Admin Route Protection
        if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Guest Route Protection
        if (userRole === 'guest' && guestBlockedRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // 4. If no rules match, allow the request
    return NextResponse.next();
});

// Use the required broad matcher to run on all pages
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};