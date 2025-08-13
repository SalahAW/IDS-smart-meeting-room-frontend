import React, {useEffect, useState} from "react";

export default function Typewriter({ text, delay = 100, className }) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(currentIndex + 1);
            }, delay);

            return () => clearTimeout(timeout);
        } else {
            // Hide cursor after text is complete
            const timeout = setTimeout(() => {
                setShowCursor(false);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text]);

    return (
        <span className={className}>
            {displayText}
            {showCursor && <span className="animate-pulse">|</span>}
        </span>
    );
}
