import React, { useState } from 'react';
import '../css/Analytics.css';

const Analytics = () => {
    const [queryResult, setQueryResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [currentQueryName, setCurrentQueryName] = useState('');

    const runQuery = async (query, queryName) => {
        setLoading(true);
        setError(null);
        setCurrentQueryName(queryName);
        try {
            const response = await fetch('http://localhost:8080/api/pg-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Database error: ${response.statusText}`);
            }

            const data = await response.json();
            setQueryResult(data);
        } catch (err) {
            setError(`Query error: ${err.message}`);
            console.error('Error executing PostgreSQL query:', err);
        } finally {
            setLoading(false);
        }
    };

    const queries = {
        basic: {
            showTables: `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name`,
            allPersons: `SELECT COUNT(person_id) FROM person`,
            allConcepts: `SELECT COUNT(concept_id) FROM concept`,
            drugExposureCount: `SELECT COUNT(person_id) FROM drug_exposure`
        },
        detailed: {
            drugExposureDetails: `
                SELECT 
                    p.person_id,
                    d.drug_concept_id,
                    c.concept_name,
                    d.drug_exposure_start_date,
                    d.drug_exposure_end_date
                FROM drug_exposure d
                JOIN person p ON p.person_id = d.person_id
                JOIN concept c ON c.concept_id = d.drug_concept_id
                ORDER BY p.person_id ASC, d.drug_exposure_start_date ASC
                LIMIT 10`,
            uniquePatients: `
                SELECT
                    COUNT(DISTINCT person_id) AS somepersons,
                    (SELECT COUNT(person_id) FROM person) AS fullperson,
                    CASE 
                        WHEN (SELECT COUNT(person_id) FROM person) = 0 THEN '0 %'
                        ELSE ROUND((COUNT(DISTINCT person_id) * 100.0 / (SELECT COUNT(person_id) FROM person)), 3) || ' %'
                    END AS percentage
                FROM drug_exposure`,
            topConditions: `
                SELECT
                    condition_concept_id, concept_name,
                    COUNT(*) AS condition_count
                FROM condition_occurrence
                JOIN concept ON concept_id = condition_concept_id
                GROUP BY condition_concept_id, concept_name
                ORDER BY condition_count DESC
                LIMIT 10`
        },
        analysis: {
            neoplasms: `
                WITH diagnosed_condition AS (
                    SELECT concept_id AS condition_concept_id, concept_name
                    FROM concept 
                    WHERE concept_name ILIKE '%neoplasm%'
                       OR concept_name ILIKE '%cancer%'
                       OR concept_name ILIKE '%tumor%'
                       OR concept_name ILIKE '%tumour%'
                )
                SELECT 
                    c.concept_name,
                    COUNT(DISTINCT co.person_id) AS conditioned_patients,
                    (SELECT COUNT(DISTINCT person_id) FROM person) AS total_patients,
                    ROUND((COUNT(DISTINCT co.person_id) * 100.0 / 
                        NULLIF((SELECT COUNT(DISTINCT person_id) FROM person), 0)), 2) as percentage
                FROM condition_occurrence co
                JOIN diagnosed_condition c ON co.condition_concept_id = c.condition_concept_id
                GROUP BY c.concept_name
                ORDER BY conditioned_patients DESC`
        }
    };

    const formatQueryResult = (result) => {
        if (!result || !result[0]) return null;

        // Add handler for table list
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

        // Handle conditions table
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

        // Handle percentage display
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

        // Add handler for neoplasm analysis
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

        // Default number display
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

                <div className="status-container">
                    {error && <div className="error-message">Error: {error}</div>}
                    {loading && <div className="loading">Loading...</div>}
                </div>

                <div className="query-buttons">
                    {activeTab === 'basic' && (
                        <>
                            <button onClick={() => runQuery(queries.basic.showTables, 'Database Tables')}>
                                All Tables
                            </button>
                            <button onClick={() => runQuery(queries.basic.allPersons, 'Total Persons')}>
                                Total Persons
                            </button>
                            <button onClick={() => runQuery(queries.basic.allConcepts, 'Total Concepts')}>
                                Total Concepts
                            </button>
                            <button onClick={() => runQuery(queries.basic.drugExposureCount, 'Total Drug Exposures')}>
                                Total Drug Exposures
                            </button>
                        </>
                    )}

                    {activeTab === 'detailed' && (
                        <>
                            <button onClick={() => runQuery(queries.detailed.drugExposureDetails, 'Drug Exposure Details')}>
                                Drug Exposure Details
                            </button>
                            <button onClick={() => runQuery(queries.detailed.uniquePatients, 'Patient Drug Exposure Analysis')}>
                                Patient Drug Exposure Analysis
                            </button>
                            <button onClick={() => runQuery(queries.detailed.topConditions, 'Top 10 Conditions')}>
                                Top 10 Conditions
                            </button>
                        </>
                    )}

                    {activeTab === 'analysis' && (
                        <button onClick={() => runQuery(queries.analysis.neoplasms, 'Neoplasm Analysis')}>
                            Neoplasm Analysis
                        </button>
                    )}
                </div>

                {queryResult && (
                    <div className="query-result">
                        <h2>{currentQueryName}</h2>
                        {formatQueryResult(queryResult)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;