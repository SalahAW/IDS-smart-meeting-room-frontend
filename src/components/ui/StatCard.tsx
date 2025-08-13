import React from "react";
import Card from "@/components/ui/Card";

interface StatCardProps {
    label: string
    value: string
    icon: React.ReactNode
    trend?: {
        value: string
        isPositive: boolean
    }
}

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
    return (
        <Card hover className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-200 hover:scale-110">
                <div className="text-blue-600">{icon}</div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-800 transition-colors duration-200 group-hover:text-blue-600">
                    {value}
                </h3>
                <p className="text-slate-600">{label}</p>
                {trend && (
                    <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '↗️' : '↘️'} {trend.value}
                    </p>
                )}
            </div>
        </Card>
    )
}