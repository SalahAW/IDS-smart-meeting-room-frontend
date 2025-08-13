interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }

    return (
        <div className={`
      bg-white rounded-xl border border-slate-200 
      ${hover ? 'hover:shadow-lg transition-all duration-200 cursor-pointer' : ''}
      ${paddings[padding]} ${className}
    `}>
            {children}
        </div>
    )
}