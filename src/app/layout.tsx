import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { Providers } from "./providers"; // Import the new client component

const inter_font = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap"
});

export const metadata: Metadata = {
    title: "SmartMeet - Meeting Room Management",
    description: "Smart Meeting Room & Minutes Management System",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
        <body className={`${inter_font.variable} antialiased`}>
        {/* Use the new Providers component to handle all client-side context */}
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}
