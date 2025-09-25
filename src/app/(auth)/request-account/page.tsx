'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Mail, User, ArrowLeft } from 'lucide-react';
import { requestAccount } from '@/actions';
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import Button from "@/app/(auth)/components/LoginButton";
import Input from "@/app/(auth)/components/LoginInput";
import Alert from "@/app/(auth)/components/LoginAlert";

function RequestFormContent({ state }: { state: any }) {
    const { pending } = useFormStatus();

    if (state?.success) {
        return (
            <Alert
                type="success"
                message={state.message}
            />
        );
    }

    return (
        <>
            {state && !state.success && (
                <Alert type="error" message={state.message} />
            )}
            <div className="flex flex-col gap-4">
                <Input
                    name="name"
                    placeholder="Full Name"
                    icon={<User className="w-4 h-4" />}
                    type="text"
                    disabled={pending}
                    required
                />
                <Input
                    name="email"
                    placeholder="Work Email"
                    icon={<Mail className="w-4 h-4" />}
                    type="email"
                    disabled={pending}
                    required
                />
                <Button type="submit" className="w-full mt-2" disabled={pending}>
                    {pending ? "Submitting..." : "Submit Request"}
                </Button>
            </div>
        </>
    );
}

export default function RequestAccountPage() {
    const [state, dispatch] = useFormState(requestAccount, undefined);

    return (
        <>
            <AnimatedBackground />
            <form action={dispatch} className="flex flex-col w-full max-w-md gap-6 relative z-10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl bg-white/10">
                <Link href="/" className="flex items-center text-sm text-slate-300 hover:text-white group">
                    <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">Request an Account</h1>
                    <p className="text-sm text-slate-300 mt-1">Your request will be sent to an administrator for approval.</p>
                </div>
                <RequestFormContent state={state} />
            </form>
        </>
    );
}