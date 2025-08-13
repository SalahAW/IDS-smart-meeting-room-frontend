// "use client";
//
// import React, { createContext, useContext, ReactNode } from 'react';
// import { useSession, SessionProvider } from 'next-auth/react';
//
// // Define the shape of our user, matching the session data
// interface User {
//     name?: string | null;
//     email?: string | null;
//     role?: string | null; // Roles might come from the token
// }
//
// interface AuthContextType {
//     user: User | null;
//     isLoading: boolean;
//     isAuthenticated: boolean;
// }
//
// const _________AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// // A new component that does the work of getting the session
// const AuthProviderContent = ({ children }: { children: ReactNode }) => {
//     const { data: session, status } = useSession();
//
//     const user: User | null = session?.user ? {
//         name: session.user.name,
//         email: session.user.email,
//         // Assuming your JWT from the backend includes a 'role' claim
//         // @ts-ignore
//         role: session.user.role || 'admin',
//     } : null;
//
//     const isAuthenticated = status === 'authenticated';
//     const isLoading = status === 'loading';
//
//     return (
//         <_________AuthContext.Provider value={{ user, isLoading, isAuthenticated }}>
//             {children}
//         </_________AuthContext.Provider>
//     );
// };
//
//
// // The main provider now wraps everything in NextAuth's SessionProvider
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     return (
//         <SessionProvider>
//             <AuthProviderContent>
//                 {children}
//             </AuthProviderContent>
//         </SessionProvider>
//     );
// };
//
// // The hook remains the same for all your components
// export const useAuth = () => {
//     const context = useContext(_________AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };