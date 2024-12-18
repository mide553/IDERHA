import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">IDERHA</div>
            <nav className="nav">
                <Link to="/">Home</Link>
                <Link to="/signin">Sign In</Link>
            </nav>
        </header>
    );
};

export default Header;