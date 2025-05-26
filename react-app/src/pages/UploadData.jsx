import React from 'react';
import '../css/UploadData.css';
import ProtectedRoute from '../components/ProtectedRoute';

const UploadData = () => {
    return (<ProtectedRoute
        allowedRoles={['hospital', 'admin']}
        fallbackMessage="You need 'hospital' or 'admin' role to access the Upload Data page."
    >
        <div className="home-main">
            <h1>UploadData</h1>
            <div className="content">
                <p>This page is under construction</p>
                <p>Welcome! You have the required permissions to upload data.</p>
            </div>
        </div>
    </ProtectedRoute>
    );
};

export default UploadData;