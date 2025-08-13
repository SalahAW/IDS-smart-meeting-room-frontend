import React from "react";
import Card from "@/components/ui/Card";

interface FeatureCardProps {
    icon: React.ReactNode
    title: string
    description: string
    isActive?: boolean
    onClick?: () => void
}

export default function FeatureCard({ icon, title, description, isActive = false, onClick }: FeatureCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-all duration-300 ${
                isActive
                    ? 'shadow-xl border-l-4 border-blue-500 transform scale-105'
                    : 'hover:shadow-lg hover:scale-102'
            }`}
            onClick={onClick}
            padding="lg"
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-600">{description}</p>
                </div>
            </div>
        </Card>
    )
}