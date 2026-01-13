import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ isSignedIn, setIsSignedIn, userRole }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await fetch('/api/users/logout', {
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
                        {(userRole === 'admin' || userRole === 'hospital') && <Link to="/manage-users">Manage Users</Link>}
                        {(userRole === 'hospital' || userRole === 'admin') && <Link to="/upload-data">Upload Data</Link>}
                        {(userRole === 'hospital' || userRole === 'admin') && <Link to="/api">API Guide</Link>}
                        <button onClick={handleSignOut} className="nav-button">Sign Out</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;