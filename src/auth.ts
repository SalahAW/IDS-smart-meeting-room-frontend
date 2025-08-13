import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
                            identifier: credentials.identifier,
                            password: credentials.password,
                        }),
                    });

                    if (!res.ok) {
                        console.error("API Login Error:", res.statusText);
                        return null;
                    }

                    const responseData = await res.json();
                    const backendUser: BackendUser = responseData.user;
                    const token: string = responseData.token;

                    if (backendUser && token) {
                        // Return the necessary data to the JWT callback
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
                    if (e instanceof TypeError && e.message === 'Failed to fetch') {
                        throw new Error('ConnectionFailed');
                    }
                    console.error("Authorize Error:", e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // This 'user' object comes from the 'authorize' function on initial sign-in.
            if (user) {
                token.id = user.id;
                token.roleId = user.roleId;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            // We are adding the custom properties from the token to the session.
            if (session.user) {
                session.user.id = token.id as string;

                session.user.accessToken = token.accessToken as string;

                switch (token.roleId) {
                    case 1:
                        session.user.role = "admin";
                        break;
                    case 2:
                        session.user.role = "employee";
                        break;
                    case 3:
                        session.user.role = "guest";
                        break;
                    default:
                        session.user.role = "guest";
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/", // Your login page is at the root
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
});