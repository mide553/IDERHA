import React, { useEffect, useState } from 'react';
import '../css/Analytics.css';

const Analytics = () => {
    const [healthData, setHealthData] = useState([]);
    const [queryResult, setQueryResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHealthData = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/healthdata');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setHealthData(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching health data:', err);
        } finally {
            setLoading(false);
        }
    };

    const runQuery = async (query) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setQueryResult(data);
        } catch (err) {
            setError(err.message);
            console.error('Error running query:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
    }, []);

    return (
        <div className="analytics-main">
            <h1>Analytics Dashboard</h1>
            <p>Monitor and analyze your health data with advanced visualization tools and real-time insights.</p>

            <div className="analytics-content">
                {error && <div className="error-message">Error: {error}</div>}
                {loading && <div className="loading">Loading...</div>}

                <ul>
                    {healthData.map(item => (
                        <li key={item.id}>{item.data}</li>
                    ))}
                </ul>

                <div className="query-buttons">
                    <button
                        onClick={() => runQuery('SELECT * FROM person LIMIT 10')}
                        disabled={loading}
                    >
                        Select Persons (Limited)
                    </button>
                    <button
                        onClick={() => runQuery('SELECT COUNT(*) as count FROM person')}
                        disabled={loading}
                    >
                        Count Persons
                    </button>
                    <button
                        onClick={() => runQuery('SELECT COUNT(*) as count FROM concept')}
                        disabled={loading}
                    >
                        Count Concepts
                    </button>
                    <button
                        onClick={() => runQuery('SELECT p.* FROM person p INNER JOIN drug_exposure d ON p.person_id = d.person_id LIMIT 10')}
                        disabled={loading}
                    >
                        Persons with Drug Exposure
                    </button>
                </div>

                {queryResult && (
                    <div className="query-result">
                        <h2>Query Result</h2>
                        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;