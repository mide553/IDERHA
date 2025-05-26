import { useState } from 'react';
import '../css/Analytics.css';
import { queries, executeQuery, getQueriesByCategory } from '../services/queryService';

const Analytics = () => {
    const [queryResult, setQueryResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [currentQueryName, setCurrentQueryName] = useState('');
    const [selectedDatabase, setSelectedDatabase] = useState('public');

    const runQuery = async (queryObj) => {
        setLoading(true);
        setError(null);
        setCurrentQueryName(queryObj.name);

        try {
            const data = await executeQuery(queryObj.sql, selectedDatabase);
            setQueryResult(data);
        } catch (err) {
            setError(err.message);
            console.error('Error executing PostgreSQL query:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatQueryResult = (result) => {
        if (!result || !result[0]) return null;

        if (result[0].table_name) {
            return (
                <div className="table-result">
                    <table>
                        <thead>
                            <tr>
                                <th>Table Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.table_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Handle drug exposure details
        if (result[0].person_id && result[0].drug_concept_id) {
            return (
                <div className="table-result">
                    <table>
                        <thead>
                            <tr>
                                <th>Person ID</th>
                                <th>Drug Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.person_id}</td>
                                    <td>{row.concept_name}</td>
                                    <td>{new Date(row.drug_exposure_start_date).toLocaleDateString()}</td>
                                    <td>{new Date(row.drug_exposure_end_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (result[0].condition_count) {
            return (
                <div className="table-result">
                    <table>
                        <thead>
                            <tr>
                                <th>Condition</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.concept_name}</td>
                                    <td>{row.condition_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (result[0].percentage) {
            return (
                <div className="result-card">
                    <div className="result-value">{result[0].percentage}</div>
                    <div className="result-details">
                        <p>of patients have drug exposure</p>
                        <p>({result[0].somepersons} out of {result[0].fullperson} patients)</p>
                    </div>
                </div>
            );
        }

        if (result[0].conditioned_patients) {
            return (
                <div className="table-result">
                    <table>
                        <thead>
                            <tr>
                                <th>Condition</th>
                                <th>Patients</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.concept_name}</td>
                                    <td>{row.conditioned_patients}</td>
                                    <td>{row.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div className="result-card">
                <div className="result-value">
                    {parseInt(Object.values(result[0])[0]).toLocaleString()}
                </div>
            </div>
        );
    };

    return (
        <div className="analytics-main">
            <h1>Analytics Dashboard</h1>

            <div className="analytics-content">
                <div className="database-selector">
                    <label htmlFor="database-select">Select Database:</label>
                    <select
                        id="database-select"
                        value={selectedDatabase}
                        onChange={(e) => {
                            setSelectedDatabase(e.target.value);
                            setQueryResult(null);
                            setError(null);
                        }}
                    >
                        <option value="public">Hospital 1 (5433)</option>
                        <option value="public2">Hospital 2 (5434)</option>
                    </select>
                </div>

                <div className="tab-navigation">
                    <button
                        className={activeTab === 'basic' ? 'active' : ''}
                        onClick={() => setActiveTab('basic')}
                    >
                        Basic Statistics
                    </button>
                    <button
                        className={activeTab === 'detailed' ? 'active' : ''}
                        onClick={() => setActiveTab('detailed')}
                    >
                        Detailed Analysis
                    </button>
                    <button
                        className={activeTab === 'analysis' ? 'active' : ''}
                        onClick={() => setActiveTab('analysis')}
                    >
                        Special Analysis
                    </button>
                </div>



                <div className="query-buttons">
                    {activeTab === 'basic' && (
                        <>
                            <button onClick={() => runQuery(queries.basic.allConcepts)}>
                                {queries.basic.allConcepts.name}
                            </button>
                            <button onClick={() => runQuery(queries.basic.drugExposureCount)}>
                                {queries.basic.drugExposureCount.name}
                            </button>
                        </>
                    )}

                    {activeTab === 'detailed' && (
                        <>
                            <button onClick={() => runQuery(queries.detailed.drugExposureDetails)}>
                                {queries.detailed.drugExposureDetails.name}
                            </button>
                            <button onClick={() => runQuery(queries.detailed.uniquePatients)}>
                                {queries.detailed.uniquePatients.name}
                            </button>
                            <button onClick={() => runQuery(queries.detailed.topConditions)}>
                                {queries.detailed.topConditions.name}
                            </button>
                        </>
                    )}

                    {activeTab === 'analysis' && (
                        <>
                            <button onClick={() => runQuery(queries.analysis.neoplasms)}>
                                {queries.analysis.neoplasms.name}
                            </button>
                        </>
                    )}
                </div>

                {queryResult && (
                    <div className="query-result">
                        <h2>{currentQueryName}</h2>
                        {formatQueryResult(queryResult)}
                    </div>
                )}
                <div className="status-container">
                    {error && <div className="error-message">Error: {error}</div>}
                    {loading && <div className="loading">Loading...</div>}
                </div>
            </div>
        </div>
    );
};

export default Analytics;