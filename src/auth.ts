import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";


const SESSION_MAX_AGE_SECONDS = 60 * 60;

// This interface should match the User object from your backend's login response
interface BackendUser {
    id: number;
    name: string;
    email: string;
    roleId: number;
}

export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    providers: [
        Credentials({
            credentials: {
                identifier: { label: "Email or Username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials.password) {
                    return null;
                }
                try {
                    const res = await fetch(`${process.env.API_URL}/Users/Login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            Identifier: credentials.identifier,
                            Password: credentials.password,
                        }),
                    });
                    if (!res.ok) { return null; }
                    const responseData = await res.json();
                    const backendUser: BackendUser = responseData.user;
                    const token: string = responseData.token;
                    if (backendUser && token) {
                        return {
                            id: backendUser.id.toString(),
                            name: backendUser.name,
                            email: backendUser.email,
                            roleId: backendUser.roleId,
                            accessToken: token,
                        };
                    }
                    return null;
                } catch (e) {
                    if (e.cause?.code === 'ECONNREFUSED') {
                        throw new Error('ConnectionFailed');
                    }
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.loginTime = Math.floor(Date.now() / 1000);
                token.id = user.id;
                token.roleId = user.roleId;
                token.accessToken = user.accessToken;
                // 3. Use the same constant in the JWT callback.
                token.maxAge = SESSION_MAX_AGE_SECONDS;
            }

            // Handle session update trigger - fetch fresh user data from API
            if (trigger === "update" && token.id && token.accessToken) {
                try {
                    const response = await fetch(`${process.env.API_URL}/Users/${token.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        // Update the token with fresh data from your API
                        token.name = userData.user.name;
                        token.email = userData.user.email;
                        token.roleId = userData.user.roleId;
                        // Keep all existing timing properties unchanged
                        // loginTime, maxAge, accessToken remain the same
                    }
                } catch (error) {
                    console.error('Failed to refresh user data:', error);
                    // Continue with existing token data if refresh fails
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.accessToken = token.accessToken as string;
                session.user.loginTime = token.loginTime;
                session.user.maxAge = token.maxAge;

                switch (token.roleId) {
                    case 1:
                        session.user.role = "admin";
                        break;
                    case 2:
                        session.user.role = "employee";
                        break;
                    default:
                        session.user.role = "guest";
                        break;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
        // 2. Use the constant in the session configuration.
        maxAge: SESSION_MAX_AGE_SECONDS,
    },
    secret: process.env.AUTH_SECRET,
});