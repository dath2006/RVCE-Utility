Sure, here's the contents for the file `/college-resources-app/college-resources-app/src/components/Navigation/Navbar.tsx`:

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Assuming you have a CSS file for styling

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">College Resources</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/resources">Resources</Link>
                </li>
                <li>
                    <Link to="/contributors">Contributors</Link>
                </li>
                <li>
                    <Link to="/quizzes">Quizzes</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;