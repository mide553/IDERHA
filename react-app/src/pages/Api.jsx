import React, { useState, useEffect } from 'react';
import '../css/Api.css';
import ProtectedRoute from '../components/ProtectedRoute';

const ApiDocumentation = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState([]);
    const [newApiKey, setNewApiKey] = useState('');
    const [keyForm, setKeyForm] = useState({
        keyName: '',
        assignedDatabase: 'hospital1',
        description: ''
    });
    const [generating, setGenerating] = useState(false);

    // Helper function to highlight customizable parts in code
    const highlightCode = (code) => {
        return code
            .replace(/your-api-key/g, '<span class="highlight">your-api-key</span>')
            .replace(/your-file\.sql/g, '<span class="highlight">your-file.sql</span>')
            .replace(/@your-file\.sql/g, '@<span class="highlight">your-file.sql</span>');
    };

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser && currentUser.role === 'admin') {
            loadApiKeys();
        }
    }, [currentUser]);

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

    const loadApiKeys = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/api-keys', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setApiKeys(data.apiKeys || []);
            }
        } catch (err) {
            console.error('Failed to load API keys:', err);
            // Don't show an alert here, just log the error
        }
    };

    const generateApiKey = async () => {
        if (!keyForm.keyName.trim()) {
            alert('Please enter a key name');
            return;
        }

        setGenerating(true);
        try {
            // Auto-generate hospital ID based on key name and timestamp
            const timestamp = Date.now();
            const sanitizedKeyName = keyForm.keyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            const autoHospitalId = `${sanitizedKeyName}_${timestamp}`;

            const requestData = {
                ...keyForm,
                hospitalId: autoHospitalId
            };

            const response = await fetch('http://localhost:8080/api/admin/api-keys/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                setNewApiKey(data.apiKey);
                setKeyForm({ keyName: '', assignedDatabase: 'hospital1', description: '' });
                loadApiKeys(); // Refresh the list
            } else {
                const error = await response.text();
                alert('Failed to generate API key: ' + error);
            }
        } catch (err) {
            console.error('Failed to generate API key:', err);
            alert('Failed to generate API key');
        } finally {
            setGenerating(false);
        }
    };

    const deactivateApiKey = async (keyId) => {
        if (!confirm('Are you sure you want to deactivate this API key?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/api-keys/deactivate-by-id`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ id: keyId }),
            });

            if (response.ok) {
                loadApiKeys(); // Refresh the list
            } else {
                const error = await response.text();
                alert('Failed to deactivate API key: ' + error);
            }
        } catch (err) {
            console.error('Failed to deactivate API key:', err);
            alert('Failed to deactivate API key');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <ProtectedRoute
            allowedRoles={['hospital', 'admin']}
            fallbackMessage="You need 'hospital' or 'admin' role to access the API Documentation."
        >
            <div className="api-main">
                <h1>API Guide</h1>

                {loading ? (
                    <div className="content">
                        <p>Loading user information...</p>
                    </div>
                ) : !currentUser ? (
                    <div className="content">
                        <p>Unable to load user information. Please try refreshing the page.</p>
                    </div>
                ) : (
                    <>
                        {currentUser && currentUser.role === 'admin' && (
                            <div className="api-management-container">
                                <div className="api-management-section">
                                    <h2>API Key Management</h2>

                                    <div className="generate-key-section">
                                        <h3>Generate New API Key</h3>
                                        <div className="api-key-form">
                                            <div className="form-group">
                                                <label htmlFor="keyName">Key Name *</label>
                                                <input
                                                    type="text"
                                                    id="keyName"
                                                    value={keyForm.keyName}
                                                    onChange={(e) => setKeyForm({ ...keyForm, keyName: e.target.value })}
                                                    placeholder="e.g., City General API Key"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="assignedDatabase">Assigned Database *</label>
                                                <select
                                                    id="assignedDatabase"
                                                    value={keyForm.assignedDatabase}
                                                    onChange={(e) => setKeyForm({ ...keyForm, assignedDatabase: e.target.value })}
                                                >
                                                    <option value="hospital1">Hospital 1</option>
                                                    <option value="hospital2">Hospital 2</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="description">Description</label>
                                                <textarea
                                                    id="description"
                                                    value={keyForm.description}
                                                    onChange={(e) => setKeyForm({ ...keyForm, description: e.target.value })}
                                                    placeholder="Purpose or additional notes for this API key"
                                                />
                                            </div>
                                            <button
                                                className="generate-button"
                                                onClick={generateApiKey}
                                                disabled={generating}
                                            >
                                                {generating ? 'Generating...' : 'Generate API Key'}
                                            </button>
                                        </div>

                                        {newApiKey && (
                                            <div className="generated-key-result">
                                                <h4>API Key Generated Successfully!</h4>
                                                <div className="key-value">
                                                    <strong>API Key:</strong>
                                                    <code>{newApiKey}</code>
                                                    <button
                                                        className="copy-button"
                                                        onClick={() => copyToClipboard(newApiKey)}
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                                <div className="warning">
                                                    Save this API key securely! It won't be shown again.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="existing-keys-section">
                                        <h3>Existing API Keys</h3>
                                        <div className="api-keys-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Key Name</th>
                                                        <th>Hospital ID</th>
                                                        <th>Database</th>
                                                        <th>Description</th>
                                                        <th>Created</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {apiKeys.map((key) => (
                                                        <tr key={key.id}>
                                                            <td>{key.keyName}</td>
                                                            <td>{key.hospitalId}</td>
                                                            <td>{key.assignedDatabase}</td>
                                                            <td>{key.description || '-'}</td>
                                                            <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <span className={`status ${key.isActive ? 'active' : 'inactive'}`}>
                                                                    {key.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {key.isActive && (
                                                                    <button
                                                                        className="deactivate-button"
                                                                        onClick={() => deactivateApiKey(key.id)}
                                                                    >
                                                                        Deactivate
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="api-documentation-container">
                            <p className="api-subtitle">Using an API you can upload SQL files directly to IDERHA without accessing the web interface.</p>

                            <div className="quick-start">
                                <h2>Quick Start Guide</h2>

                                <div className="step">
                                    <h3>Step 1: Get Your API Key</h3>
                                    <p>Contact your administrator to get an API key for your hospital.</p>
                                </div>

                                <div className="step">
                                    <h3>Step 2: Upload Your SQL Files</h3>
                                    <p>Use any of these methods to upload your existing SQL files using an API:</p>

                                    <div className="example-response">
                                        <h4>Command Line (curl)</h4>
                                        <pre className="code-block" dangerouslySetInnerHTML={{
                                            __html: highlightCode(`curl -X POST "http://localhost:8080/api/data/sql" \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: text/plain" \\
  --data-binary @your-file.sql \\
  -w "HTTP Status: %{http_code}\\n" \\
  -s -S || echo "Request failed"`)
                                        }}>
                                        </pre>
                                    </div>

                                    <div className="example-response">
                                        <h4>PowerShell</h4>
                                        <pre className="code-block" dangerouslySetInnerHTML={{
                                            __html: highlightCode(`$apiKey = "your-api-key"
$sqlContent = Get-Content "your-file.sql" -Raw
$headers = @{ "X-API-Key" = $apiKey; "Content-Type" = "text/plain" }

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/data/sql" -Method POST -Body $sqlContent -Headers $headers
    
    # Success - show results
    Write-Host "Upload successful!" -ForegroundColor Green
    $response | Select-Object status, successRate, statementsExecuted, totalStatements, database
    $response.details | Format-Table -AutoSize
    
} catch {
    # Error handling
    Write-Host "Upload failed!" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Yellow
        
        switch ($statusCode) {
            401 { Write-Host "Error: Invalid or expired API key" }
            400 { Write-Host "Error: Invalid SQL file or syntax error" }
            403 { Write-Host "Error: Access denied for this database" }
            500 { Write-Host "Error: Server error or database connection failed" }
            default { Write-Host "Error: $($_.Exception.Message)" }
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)"
    }
}`)
                                        }}>
                                        </pre>
                                    </div>

                                    <div className="example-response">
                                        <h4>Python</h4>
                                        <pre className="code-block" dangerouslySetInnerHTML={{
                                            __html: highlightCode(`import requests

try:
    with open('your-file.sql', 'r') as file:
        sql_content = file.read()

    headers = {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'text/plain'
    }

    response = requests.post(
        'http://localhost:8080/api/data/sql',
        headers=headers,
        data=sql_content
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Upload successful!")
        print(f"Status: {result['status']}")
        print(f"Success Rate: {result['successRate']}%")
        print(f"Executed: {result['statementsExecuted']}/{result['totalStatements']}")
        print(f"Database: {result['database']}")
        print(f"Execution Time: {result['totalExecutionTimeMs']}ms")
    else:
        # Error handling
        print(f"Upload failed! HTTP {response.status_code}")
        
        if response.status_code == 401:
            print("Error: Invalid or expired API key")
        elif response.status_code == 400:
            print("Error: Invalid SQL file or syntax error")
        elif response.status_code == 403:
            print("Error: Access denied for this database")
        elif response.status_code == 500:
            print("Error: Server error or database connection failed")
        else:
            print(f"Error: {response.text}")
            
except FileNotFoundError:
    print("Error: SQL file not found")
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")`)
                                        }}>
                                        </pre>
                                    </div>
                                </div>

                                <div className="step">
                                    <h5>Example use</h5>
                                    <pre className="code-block" dangerouslySetInnerHTML={{
                                        __html: highlightCode(`your-api-key: iderha_YUMGqR2SaHEbVQCSo6NKusJpq0VE57UTJaxXeRR3Hpc
your-file.sql: C:/Users/Admin/Desktop/data.sql`)
                                    }}>
                                    </pre>
                                </div>

                                <div className="step">
                                    <h3>Step 3: Check Results</h3>
                                    <p>The API will return comprehensive execution details:</p>
                                    <p><strong>successRate:</strong> Percentage of statements executed successfully</p>
                                    <p><strong>statementsExecuted:</strong> Number of SQL statements that ran successfully</p>
                                    <p><strong>totalStatements:</strong> Total number of statements processed</p>
                                    <p><strong>failedStatements:</strong> Number of statements that failed</p>
                                    <p><strong>statementTypeSummary:</strong> Breakdown by statement type (INSERT, TRUNCATE, etc.)</p>
                                    <p><strong>affectedTables:</strong> Which OMOP tables were modified and operation counts</p>
                                    <p><strong>totalExecutionTimeMs:</strong> Total processing time in milliseconds</p>
                                    <p><strong>details:</strong> Individual results for each statement with execution times</p>
                                    <p><strong>status:</strong> "success", "partial_success", or "error"</p>
                                    <p><strong>database:</strong> Which hospital database was used</p>
                                    <p><strong>timestamp:</strong> When the upload was processed</p>

                                    <div className="example-response">
                                        <h4>Example Response:</h4>
                                        <pre className="code-block">
                                            {`successRate          : 100
totalStatements      : 8
message              : Processed 8/8 SQL statements successfully
failedStatements     : 0
statementsExecuted   : 8
statementTypeSummary : @{INSERT=4; TRUNCATE=4}
database             : hospital1
totalExecutionTimeMs : 145
affectedTables       : @{condition_occurrence=2; drug_exposure=2; person=2; concept=2}
details              : {@{result=Executed successfully; success=True; executionTimeMs=32; 
                        statement=TRUNCATE TABLE condition_occurrence CASCADE; type=TRUNCATE; table=condition_occurrence}, 
                       @{result=Executed successfully; success=True; executionTimeMs=34; 
                        statement=TRUNCATE TABLE concept CASCADE; type=TRUNCATE; table=concept}, 
                       @{result=Executed successfully; success=True; executionTimeMs=22; 
                        statement=INSERT INTO person (...) VALUES (...); type=INSERT; table=person}, 
                       @{result=Executed successfully; success=True; executionTimeMs=31; 
                        statement=INSERT INTO condition_occurrence (...) VALUES (...); type=INSERT; table=condition_occurrence}}
uploadedBy           : HOSPITAL_1@api.hospital
status               : success
timestamp            : Sun Oct 12 14:34:47 CEST 2025`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="important-notes">
                                <br /><h2>Important Notes</h2>
                                <div className="note-card">
                                    <h4>Authentication</h4>
                                    <p>Always include your API key in the <code>X-API-Key</code> header.</p>
                                </div>
                                <div className="note-card">
                                    <h4>SQL File Name</h4>
                                    <p>Always include your SQL file name in the request body.</p>
                                </div>
                                <div className="note-card">
                                    <h4>File Format</h4>
                                    <p>Your existing SQL files work as-is. Multi-line statements are supported.</p>
                                </div>
                                <div className="note-card">
                                    <h4>OMOP CDM Compatible</h4>
                                    <p>The API supports all OMOP CDM tables: person, condition_occurrence, drug_exposure, etc.</p>
                                </div>
                            </div>

                            <div className="endpoints-summary">
                                <br /><h2>Available Endpoints</h2>
                                <table className="endpoints-table">
                                    <thead>
                                        <tr>
                                            <th>Method</th>
                                            <th>Endpoint</th>
                                            <th>Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>POST</td>
                                            <td>/api/data/sql</td>
                                            <td>Upload SQL files (recommended)</td>
                                        </tr>
                                        <tr>
                                            <td>POST</td>
                                            <td>/api/data/patients</td>
                                            <td>Upload patient data (JSON)</td>
                                        </tr>
                                        <tr>
                                            <td>POST</td>
                                            <td>/api/data/conditions</td>
                                            <td>Upload condition data (JSON)</td>
                                        </tr>
                                        <tr>
                                            <td>POST</td>
                                            <td>/api/data/drugs</td>
                                            <td>Upload drug exposure data (JSON)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="endpoints-summary">
                                <br /><h2>Need Help?</h2>
                                <h4>Contact your system administrator if you need:</h4>

                                <p>API key generation or renewal</p>
                                <p>Database access permissions</p>
                                <p>Technical support with uploads</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default ApiDocumentation;