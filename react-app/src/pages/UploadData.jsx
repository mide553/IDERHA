import React, { useState, useEffect } from 'react';
import '../css/UploadData.css';
import ProtectedRoute from '../components/ProtectedRoute';

const UploadData = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/check-session', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            }
        } catch (err) {
            console.error('Failed to get current user:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDatabaseDisplayName = (dbName) => {
        switch(dbName) {
            case 'public': return 'Hospital 1 (Port 5433)';
            case 'public2': return 'Hospital 2 (Port 5434)';
            default: return 'Unknown Database';
        }
    };

    return (
        <ProtectedRoute
            allowedRoles={['hospital', 'admin']}
            fallbackMessage="You need 'hospital' or 'admin' role to access the Upload Data page."
        >
            <div className="home-main">
                <h1>Upload Data</h1>
                <div className="content">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <p>This page is under construction</p>
                            <p>Welcome! You have the required permissions to upload data.</p>
                            {currentUser && currentUser.role === 'hospital' && currentUser.assignedDatabase && (
                                <div className="assigned-database">
                                    <h3>Your Assigned Database:</h3>
                                    <p><strong>{getDatabaseDisplayName(currentUser.assignedDatabase)}</strong></p>
                                    <p>You can only upload data to this database.</p>
                                </div>
                            )}
                            {currentUser && currentUser.role === 'hospital' && !currentUser.assignedDatabase && (
                                <div className="no-database">
                                    <p><strong>Warning:</strong> No database has been assigned to your account. Please contact an administrator.</p>
                                </div>
                            )}
                            {currentUser && currentUser.role === 'admin' && (
                                <div className="admin-access">
                                    <p>As an admin, you have access to all databases.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default UploadData;