import React, { useState, useEffect } from 'react';
import '../css/UploadData.css';
import ProtectedRoute from '../components/ProtectedRoute';

const UploadData = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);
    const [sqlContent, setSqlContent] = useState('');
    const [selectedDatabase, setSelectedDatabase] = useState('hospital1');

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
            case 'hospital1': return 'Hospital 1 (Port 5433)';
            case 'hospital2': return 'Hospital 2 (Port 5434)';
            default: return 'Unknown Database';
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/sql' || file.name.endsWith('.sql')) {
                setSelectedFile(file);
                setError(null);
                
                // Read file content for preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSqlContent(e.target.result);
                };
                reader.readAsText(file);
            } else {
                setError('Please select a valid SQL file (.sql)');
                setSelectedFile(null);
                setSqlContent('');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        if (currentUser?.role === 'hospital' && !currentUser?.assignedDatabase) {
            setError('No database assigned to your account. Please contact an administrator.');
            return;
        }

        setUploadLoading(true);
        setError(null);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            // For hospital users, use their assigned database; for admin, use selected database
            const targetDatabase = currentUser?.role === 'hospital' 
                ? currentUser.assignedDatabase 
                : selectedDatabase;

            formData.append('database', targetDatabase);

            const response = await fetch('http://localhost:8080/api/upload/sql', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok) {
                setUploadResult(result);
                setSelectedFile(null);
                setSqlContent('');
                // Reset file input
                document.getElementById('fileInput').value = '';
            } else {
                setError(result.message || 'Upload failed');
            }
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally {
            setUploadLoading(false);
        }
    };

    const clearResults = () => {
        setUploadResult(null);
        setError(null);
    };

    return (
        <ProtectedRoute
            allowedRoles={['hospital', 'admin']}
            fallbackMessage="You need 'hospital' or 'admin' role to access the Upload Data page."
        >
            <div className="upload-main">
                <h1>Upload Data</h1>
                <div className="content">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
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
                                    <div className="database-selector">
                                        <label htmlFor="admin-database-select">Select Target Database:</label>
                                        <select
                                            id="admin-database-select"
                                            value={selectedDatabase}
                                            onChange={(e) => setSelectedDatabase(e.target.value)}
                                        >
                                            <option value="hospital1">Hospital 1 (Port 5433)</option>
                                            <option value="hospital2">Hospital 2 (Port 5434)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="upload-section">
                                <h3>Upload SQL File</h3>
                                <div className="file-input-section">
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".sql"
                                        onChange={handleFileSelect}
                                        className="file-input"
                                    />
                                    <label htmlFor="fileInput" className="file-input-label">
                                        Choose SQL File
                                    </label>
                                    {selectedFile && (
                                        <span className="file-name">{selectedFile.name}</span>
                                    )}
                                </div>

                                {selectedFile && (
                                    <div className="file-preview">
                                        <h4>File Preview:</h4>
                                        <pre className="sql-preview">{sqlContent.substring(0, 500)}{sqlContent.length > 500 ? '...' : ''}</pre>
                                        <p className="file-info">File size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                )}

                                <button 
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploadLoading || (currentUser?.role === 'hospital' && !currentUser?.assignedDatabase)}
                                    className="upload-button"
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload and Execute SQL'}
                                </button>
                            </div>

                            {error && (
                                <div className="error-section">
                                    <h4>Error:</h4>
                                    <p className="error-message">{error}</p>
                                    <button onClick={clearResults} className="clear-button">Clear</button>
                                </div>
                            )}

                            {uploadResult && (
                                <div className="result-section">
                                    <h4>Upload Results:</h4>
                                    <div className="result-content">
                                        <p><strong>Status:</strong> {uploadResult.status}</p>
                                        <p><strong>Database:</strong> {getDatabaseDisplayName(uploadResult.database)}</p>
                                        <p><strong>Statements Executed:</strong> {uploadResult.statementsExecuted}</p>
                                        {uploadResult.message && (
                                            <p><strong>Message:</strong> {uploadResult.message}</p>
                                        )}
                                        {uploadResult.details && uploadResult.details.length > 0 && (
                                            <div className="execution-details">
                                                <h5>Execution Details:</h5>
                                                <ul>
                                                    {uploadResult.details.map((detail, index) => (
                                                        <li key={index} className={detail.success ? 'success' : 'error'}>
                                                            {detail.statement}: {detail.result}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={clearResults} className="clear-button">Clear Results</button>
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