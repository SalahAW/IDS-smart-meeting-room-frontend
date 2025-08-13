import { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the default JWT type
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        roleId: number;
        accessToken: string;
    }
}

// Extend the default Session's User type
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "admin" | "employee" | "guest"; // The final role as a string
            accessToken: string;
        } & DefaultSession["user"]; // Keep the default properties like name, email, image
    }

    // Extend the default User type (the object from the `authorize` callback)
    interface User{
        roleId: number;
        accessToken: string;
    }
}