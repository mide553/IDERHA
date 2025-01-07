import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ isSignedIn, setIsSignedIn }) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        setIsSignedIn(false);
        navigate('/');
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to={isSignedIn ? "/welcome" : "/"} className="logo-link">IDERHA</Link>
            </div>
            <nav className="nav">
                {!isSignedIn ? (
                    <Link to="/signin">Sign In</Link>
                ) : (
                    <>
                        <Link to="/welcome">Home</Link>
                        <Link to="/analytics">Analytics</Link>
                        <Link to="/help">Help</Link>
                        <Link to="/about-us">About Us</Link>
                        <button onClick={handleSignOut} className="nav-button">Sign Out</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;