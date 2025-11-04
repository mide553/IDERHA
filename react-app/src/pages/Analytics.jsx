import { useState } from 'react';
import '../css/Analytics.css';
import { queries, executeQuery } from '../services/queryService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
    const [queryResult, setQueryResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [currentQueryName, setCurrentQueryName] = useState('');
    const [selectedDatabase, setSelectedDatabase] = useState('public');
    const [filters, setFilters] = useState({
        ageGroup: 'all', // 'all', 'adult', 'child'
        gender: 'all' // 'all', 'male', 'female'
    });
    const [showFilters, setShowFilters] = useState(false);

    const runQuery = async (queryObj) => {
        setLoading(true);
        setError(null);
        setCurrentQueryName(queryObj.name);

        try {
            // Apply filters to SQL query
            let filteredSql = queryObj.sql;

            // Calculate current year for age calculation (2025)
            const currentYear = new Date().getFullYear();

            // Build WHERE clauses for filters
            const filterConditions = [];

            if (filters.ageGroup !== 'all') {
                if (filters.ageGroup === 'adult') {
                    // Adults: 18 or older (born in 2007 or earlier)
                    filterConditions.push(`p.year_of_birth <= ${currentYear - 18}`);
                } else if (filters.ageGroup === 'child') {
                    // Children: younger than 18 (born after 2007)
                    filterConditions.push(`p.year_of_birth > ${currentYear - 18}`);
                }
            }

            if (filters.gender !== 'all') {
                const genderConceptId = filters.gender === 'male' ? '8507' : '8532';
                filterConditions.push(`p.gender_concept_id = ${genderConceptId}`);
            }

            // Apply filters if any are selected
            if (filterConditions.length > 0) {
                const filterClause = filterConditions.join(' AND ');

                // Check if query involves person table joins
                if (filteredSql.toLowerCase().includes('from person') ||
                    filteredSql.toLowerCase().includes('join person')) {

                    // For queries with person table, add WHERE or AND clause
                    if (filteredSql.toLowerCase().includes('where')) {
                        // Already has WHERE, add AND
                        filteredSql = filteredSql.replace(/WHERE/i, `WHERE ${filterClause} AND`);
                    } else if (filteredSql.toLowerCase().includes('group by')) {
                        // Add WHERE before GROUP BY
                        filteredSql = filteredSql.replace(/GROUP BY/i, `WHERE ${filterClause} GROUP BY`);
                    } else if (filteredSql.toLowerCase().includes('order by')) {
                        // Add WHERE before ORDER BY
                        filteredSql = filteredSql.replace(/ORDER BY/i, `WHERE ${filterClause} ORDER BY`);
                    } else if (filteredSql.toLowerCase().includes('limit')) {
                        // Add WHERE before LIMIT
                        filteredSql = filteredSql.replace(/LIMIT/i, `WHERE ${filterClause} LIMIT`);
                    }
                } else if (filteredSql.toLowerCase().includes('drug_exposure') ||
                          filteredSql.toLowerCase().includes('condition_occurrence')) {
                    // For queries without person table, we need to add a JOIN
                    // This handles queries that only query drug_exposure or condition_occurrence
                    if (filteredSql.toLowerCase().includes('from drug_exposure')) {
                        filteredSql = filteredSql.replace(
                            /FROM drug_exposure/i,
                            `FROM drug_exposure de JOIN person p ON de.person_id = p.person_id`
                        );
                    } else if (filteredSql.toLowerCase().includes('from condition_occurrence')) {
                        filteredSql = filteredSql.replace(
                            /FROM condition_occurrence/i,
                            `FROM condition_occurrence co JOIN person p ON co.person_id = p.person_id`
                        );
                    }

                    // Now add WHERE clause
                    if (filteredSql.toLowerCase().includes('where')) {
                        filteredSql = filteredSql.replace(/WHERE/i, `WHERE ${filterClause} AND`);
                    } else if (filteredSql.toLowerCase().includes('group by')) {
                        filteredSql = filteredSql.replace(/GROUP BY/i, `WHERE ${filterClause} GROUP BY`);
                    } else if (filteredSql.toLowerCase().includes('order by')) {
                        filteredSql = filteredSql.replace(/ORDER BY/i, `WHERE ${filterClause} ORDER BY`);
                    }
                }
            }

            const data = await executeQuery(filteredSql, selectedDatabase);
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

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

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

        // Handle drug exposure details with Bar Chart
        if (result[0].person_id && result[0].drug_concept_id) {
            // Count occurrences of each drug
            const drugCounts = result.reduce((acc, row) => {
                const drugName = row.concept_name;
                acc[drugName] = (acc[drugName] || 0) + 1;
                return acc;
            }, {});

            const chartData = Object.entries(drugCounts).map(([name, count]) => ({
                name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                fullName: name,
                count: count
            }));

            return (
                <div className="chart-result">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={120}
                                interval={0}
                            />
                            <YAxis label={{ value: 'Number of Exposures', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="custom-tooltip" style={{
                                                backgroundColor: 'white',
                                                padding: '10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px'
                                            }}>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.fullName}</p>
                                                <p style={{ margin: '5px 0 0 0' }}>Exposures: {payload[0].value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Drug Exposures" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Handle neoplasm/cancer analysis (conditioned_patients with percentage)
        if (result[0].conditioned_patients && result[0].total_patients) {
            const chartData = result.map(row => ({
                name: row.concept_name.length > 30 ? row.concept_name.substring(0, 30) + '...' : row.concept_name,
                fullName: row.concept_name,
                patients: parseInt(row.conditioned_patients),
                percentage: parseFloat(row.percentage)
            }));

            return (
                <div className="chart-result">
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 150 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={150}
                                interval={0}
                            />
                            <YAxis label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="custom-tooltip" style={{
                                                backgroundColor: 'white',
                                                padding: '10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px'
                                            }}>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.fullName}</p>
                                                <p style={{ margin: '5px 0 0 0' }}>Patients: {payload[0].value}</p>
                                                <p style={{ margin: '5px 0 0 0' }}>Percentage: {payload[0].payload.percentage}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="patients" fill="#FF8042" name="Number of Patients" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Handle top conditions (condition_count without total_patients)
        if (result[0].condition_count && !result[0].total_patients) {
            const chartData = result.map(row => ({
                name: row.concept_name.length > 25 ? row.concept_name.substring(0, 25) + '...' : row.concept_name,
                fullName: row.concept_name,
                count: parseInt(row.condition_count)
            }));

            return (
                <div className="chart-result">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={120}
                                interval={0}
                            />
                            <YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="custom-tooltip" style={{
                                                backgroundColor: 'white',
                                                padding: '10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px'
                                            }}>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.fullName}</p>
                                                <p style={{ margin: '5px 0 0 0' }}>Count: {payload[0].value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Condition Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        if (result[0].percentage && result[0].somepersons) {
            const withExposure = parseInt(result[0].somepersons);
            const withoutExposure = parseInt(result[0].fullperson) - withExposure;

            const pieData = [
                { name: 'With Drug Exposure', value: withExposure },
                { name: 'Without Drug Exposure', value: withoutExposure }
            ];

            return (
                <div className="chart-result">
                    <div className="result-summary" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h3>{result[0].percentage}</h3>
                        <p>of patients have drug exposure</p>
                        <p>({result[0].somepersons} out of {result[0].fullperson} patients)</p>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Handle time series data (conditions over time)
        if (result[0].year && result[0].condition_count) {
            // Transform data for line chart - group by condition
            const conditionMap = {};
            const years = new Set();

            result.forEach(row => {
                const year = parseInt(row.year);
                const condition = row.concept_name;
                years.add(year);

                if (!conditionMap[condition]) {
                    conditionMap[condition] = {};
                }
                conditionMap[condition][year] = parseInt(row.condition_count);
            });

            // Create chart data with year as x-axis
            const sortedYears = Array.from(years).sort();
            const chartData = sortedYears.map(year => {
                const dataPoint = { year };
                Object.keys(conditionMap).forEach(condition => {
                    dataPoint[condition] = conditionMap[condition][year] || 0;
                });
                return dataPoint;
            });

            const conditions = Object.keys(conditionMap);

            return (
                <div className="chart-result">
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="year"
                                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {conditions.map((condition, index) => (
                                <Line
                                    key={condition}
                                    type="monotone"
                                    dataKey={condition}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
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
                <div className="top-controls">
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
                            <option value="hospital1">Hospital 1 (5433)</option>
                            <option value="hospital2">Hospital 2 (5434)</option>
                        </select>
                    </div>

                    <div className="filters-section">
                        <button
                            className="filters-toggle-btn"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <span>Filters</span>
                            <span className={`arrow ${showFilters ? 'open' : ''}`}>▼</span>
                        </button>

                        {showFilters && (
                            <div className="filters-container">
                                <div className="filter-group">
                                    <label htmlFor="age-filter">Age Group:</label>
                                    <select
                                        id="age-filter"
                                        value={filters.ageGroup}
                                        onChange={(e) => {
                                            setFilters({ ...filters, ageGroup: e.target.value });
                                            setQueryResult(null);
                                        }}
                                    >
                                        <option value="all">All Ages</option>
                                        <option value="adult">Adults (18+)</option>
                                        <option value="child">Children (&lt;18)</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="gender-filter">Gender:</label>
                                    <select
                                        id="gender-filter"
                                        value={filters.gender}
                                        onChange={(e) => {
                                            setFilters({ ...filters, gender: e.target.value });
                                            setQueryResult(null);
                                        }}
                                    >
                                        <option value="all">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                {(filters.ageGroup !== 'all' || filters.gender !== 'all') && (
                                    <button
                                        className="clear-filters-btn"
                                        onClick={() => {
                                            setFilters({ ageGroup: 'all', gender: 'all' });
                                            setQueryResult(null);
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
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
                            <button onClick={() => runQuery(queries.basic.totalPersons)}>
                                {queries.basic.totalPersons.name}
                            </button>
                            <button onClick={() => runQuery(queries.basic.allConcepts)}>
                                {queries.basic.allConcepts.name}
                            </button>
                            <button onClick={() => runQuery(queries.basic.drugExposureCount)}>
                                {queries.basic.drugExposureCount.name}
                            </button>
                            <button onClick={() => runQuery(queries.basic.uniquePatientsWithDrugs)}>
                                {queries.basic.uniquePatientsWithDrugs.name}
                            </button>
                            <button onClick={() => runQuery(queries.basic.uniqueDrugs)}>
                                {queries.basic.uniqueDrugs.name}
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
                            <button onClick={() => runQuery(queries.detailed.conditionsOverTime)}>
                                {queries.detailed.conditionsOverTime.name}
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