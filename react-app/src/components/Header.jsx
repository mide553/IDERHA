import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ isSignedIn, setIsSignedIn, userRole }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await fetch('http://localhost:8080/api/users/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setIsSignedIn(false);
            navigate('/signin');
        } catch (err) {
            console.error('Error during logout:', err);
        }
    };


    return (
        <header className="header">
            <div className="logo">
                <Link to={isSignedIn ? "/welcome" : "/"} className="logo-link">eHealth Insights</Link>
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
                        {userRole === 'admin' && <Link to="/manage-users">Manage Users</Link>}
                        <button onClick={handleSignOut} className="nav-button">Sign Out</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;