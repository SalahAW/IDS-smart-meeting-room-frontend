'use client'
import React, { useEffect, useRef, useState } from 'react'

interface AnimatedSectionProps {
    children: React.ReactNode
    className?: string
    animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right'
    delay?: number
}

export default function AnimatedSection({
                                            children,
                                            className = '',
                                            animation = 'fade-up',
                                            delay = 0
                                        }: AnimatedSectionProps) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const timeoutId = setTimeout(() => setIsVisible(true), delay ?? 0)
                    return () => clearTimeout(timeoutId)
                }
            },
            { threshold: 0.1 }
        )

        const currentRef = ref.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            observer.disconnect()
        }
    }, [delay])

    const animations = {
        'fade-up': `transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`,
        'fade-in': `transition-opacity duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`,
        'slide-left': `transform transition-all duration-700 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
        }`,
        'slide-right': `transform transition-all duration-700 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
        }`
    }

    return (
        <div ref={ref} className={`${animations[animation]} ${className}`}>
            {children}
        </div>
    )
}