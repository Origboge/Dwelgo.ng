import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: 'fade-in' | 'fade-in-right' | 'fade-in-left' | 'fade-in-up' | 'fade-in-down';
    delay?: number;
    className?: string;
    threshold?: number;
    once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    animation = 'fade-in-up',
    delay = 0,
    className = '',
    threshold = 0.1,
    once = true,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, once]);

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible ? `animate-${animation}` : 'opacity-0'}`}
            style={{
                animationDelay: isVisible ? `${delay}ms` : '0ms',
                animationFillMode: 'forwards',
            }}
        >
            {children}
        </div>
    );
};
