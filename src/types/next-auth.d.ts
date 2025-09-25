import { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the default JWT type
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        roleId: number;
        accessToken: string;
        loginTime: number;
        maxAge: number;
    }
}

// Extend the default Session's User type
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "admin" | "employee" | "guest";
            accessToken: string;
            loginTime: number;
            maxAge: number;
        } & DefaultSession["user"];
    }

    interface User {
        roleId: number;
        accessToken: string;
    }
}