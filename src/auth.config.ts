import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isPublicRoute = nextUrl.pathname === '/';

            // If on a public route (login page) and logged in, redirect to dashboard
            if (isPublicRoute && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // If on a private route and not logged in, redirect to login page
            if (!isPublicRoute && !isLoggedIn) {
                return false; // Redirects to login page by default
            }

            // Otherwise, allow the request
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;