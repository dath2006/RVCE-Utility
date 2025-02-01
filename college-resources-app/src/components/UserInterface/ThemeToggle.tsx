Sure, here's the contents for the file `/college-resources-app/college-resources-app/src/components/UserInterface/ThemeToggle.tsx`:

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="theme-toggle">
            <button onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'dark' : 'light'} mode
            </button>
        </div>
    );
};

export default ThemeToggle;