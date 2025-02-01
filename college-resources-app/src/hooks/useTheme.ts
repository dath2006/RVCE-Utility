Sure, here's the contents for the file `/college-resources-app/college-resources-app/src/hooks/useTheme.ts`:

import { useState, useEffect } from 'react';

const useTheme = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return { theme, toggleTheme };
};

export default useTheme;