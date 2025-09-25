'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import { resetPassword } from '@/actions'; // We will create this action
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import Button from "@/app/(auth)/components/LoginButton";
import Input from "@/app/(auth)/components/LoginInput";
import Alert from "@/app/(auth)/components/LoginAlert";

function ResetPasswordFormComponent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, dispatch] = useFormState(resetPassword, undefined);
    const { pending } = useFormStatus();

    if (!token) {
        return <Alert type="error" message="Invalid or missing reset token. Please request a new link." />;
    }

    if (state?.success) {
        return (
            <div>
                <Alert type="success" message={state.message} />
                <Link href="/" className="mt-4 block text-center text-blue-400 hover:underline">
                    Proceed to Sign In
                </Link>
            </div>
        );
    }

    return (
        <form action={dispatch} className="flex flex-col gap-4">
            {state && !state.success && (
                <Alert type="error" message={state.message} />
            )}
            <input type="hidden" name="token" value={token} />
            <Input
                name="newPassword"
                placeholder="New Password"
                icon={<Lock className="w-4 h-4" />}
                type="password"
                disabled={pending}
                required
            />
            <Input
                name="confirmPassword"
                placeholder="Confirm New Password"
                icon={<Lock className="w-4 h-4" />}
                type="password"
                disabled={pending}
                required
            />
            <Button type="submit" className="w-full mt-2" disabled={pending}>
                {pending ? "Resetting..." : "Reset Password"}
            </Button>
        </form>
    );
}

// Suspense is needed because useSearchParams must be used in a Client Component.
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnimatedBackground />
            <div className="flex flex-col w-full max-w-md gap-6 relative z-10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl bg-white/10">
                <Link href="/" className="flex items-center text-sm text-slate-300 hover:text-white group">
                    <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
                    <p className="text-sm text-slate-300 mt-1">Choose a new, strong password.</p>
                </div>
                <ResetPasswordFormComponent />
            </div>
        </Suspense>
    );
}
