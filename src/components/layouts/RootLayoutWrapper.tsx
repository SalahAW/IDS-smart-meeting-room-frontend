"use client";

import {usePathname} from "next/navigation";
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";


export default function RootLayoutWrapper({children} : {children: React.ReactNode})
{
    const path = usePathname() ?? "";
    const isLogin = path.startsWith("/");

    return(
        <>
            {isLogin ?
                {children}
                :
                <DashboardLayout>
                    {children}
                </DashboardLayout>
            }
        </>
    );
}
