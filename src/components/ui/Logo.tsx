import { Calendar } from 'lucide-react'

interface LogoProps {
    theme?: 'light' | 'dark'
}

export default function Logo({ theme = 'light' }: LogoProps) {
    return (
        <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transition-transform duration-200">
                <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} transition-colors duration-200`}>
                    SmartMeet
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Meeting Room Management
                </p>
            </div>
        </div>
    )
}