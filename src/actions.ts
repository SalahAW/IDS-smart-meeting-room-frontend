'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
): Promise<string> { // Changed to always return a string for clarity
    try {
        await signIn('credentials', formData);
        // This line will likely not be reached if signIn is successful, as it usually redirects.
        // But in case of non-redirect success, you can handle it.
        return 'Success';

    } catch (error) {
        // First, check for our custom errors from the 'authorize' function
        if (error instanceof Error) {
            switch (error.message) {
                case 'ConnectionFailed':
                    return 'Server is offline. Please try again later.';
                // You could add more custom errors here in the future
                default:
                    return 'An unexpected error occurred.';
            }
        }

        // Then, handle NextAuth's own specific errors
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials. Please check your email and password.';
                default:
                    return 'Something went wrong with authentication.';
            }
        }

        // If it's an error we don't recognize, re-throw it.
        throw error;
    }
}