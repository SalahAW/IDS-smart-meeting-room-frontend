import React from "react";

interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    glow?: boolean
    fullWidth?: boolean
    disabled?: boolean
    onClick?: () => void
    className?: string
}

export default function Button({
                                   children,
                                   variant = 'primary',
                                   size = 'md',
                                   glow = false,
                                   fullWidth = false,
                                   disabled = false,
                                   onClick,
                                   className = ''
                               }: ButtonProps) {
    const baseStyles = `
    font-semibold rounded-xl transition-all duration-300 ease-in-out hover:scale-100 transform 
    focus:outline-none active:scale-95 cursor-pointer
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}
  `

    const variants = {
        primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 text-white 
      hover:shadow-xl focus:ring-blue-500
      ${glow ? 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40' : ''}
    `,
        secondary: `
      bg-slate-100 text-slate-700 hover:bg-slate-200 
      focus:ring-slate-500
    `,
        ghost: `
      text-slate-600 hover:text-blue-600 hover:bg-blue-50
      focus:ring-blue-500
    `,
        outline: `
      border-2 border-slate-300 text-slate-700 hover:bg-slate-50
      focus:ring-slate-500
    `,
        darkBlue: `
      bg-[#0f172a] text-white hover:bg-[#172340]
      focus:ring-slate-500
        `
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    )
}