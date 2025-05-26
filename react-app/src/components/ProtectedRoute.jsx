import React, { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles = [], fallbackMessage = "Access Denied" }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUserSession();
    }, []);

    const checkUserSession = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/check-session', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setError('Not authenticated');
            }
        } catch (err) {
            setError('Failed to check authentication');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    if (error || !user || user.status === 'error') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '18px',
                color: '#e74c3c'
            }}>
                <h2>Access Denied</h2>
                <p>You need to be logged in to access this page.</p>
                <p>Please <a href="/login" style={{ color: '#3498db' }}>login</a> to continue.</p>
            </div>
        );
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '18px',
                color: '#e74c3c'
            }}>
                <h2>Access Denied</h2>
                <p>{fallbackMessage}</p>
                <p>Your role: <strong>{user.role}</strong></p>
                <p>Required roles: <strong>{allowedRoles.join(', ')}</strong></p>
            </div>
        );
    }

    // User is authenticated and has the right role
    return children;
};

export default ProtectedRoute;