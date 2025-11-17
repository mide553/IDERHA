import { useState, useEffect } from 'react';
import '../css/Analytics.css';
import { queries, executeQuery, canAccessDatabase } from '../services/queryService';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
    Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';

const Analytics = () => {
    const [queryResult, setQueryResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('demographics');
    const [currentQueryName, setCurrentQueryName] = useState('');
    const [selectedDatabase, setSelectedDatabase] = useState('hospital1');
    const [chartType, setChartType] = useState('auto');
    const [filters, setFilters] = useState({
        ageGroup: 'all',
        gender: 'all',
        dateRange: 'all',
        customStartDate: '',
        customEndDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [dashboardView, setDashboardView] = useState('query');
    const [comparisonQueries, setComparisonQueries] = useState([]);
    const [savedQueries, setSavedQueries] = useState([]);
    const [queryHistory, setQueryHistory] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);

    // Load saved queries and history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedQueries');
        const history = localStorage.getItem('queryHistory');
        if (saved) setSavedQueries(JSON.parse(saved));
        if (history) setQueryHistory(JSON.parse(history));
    }, []);

    // Save query to history
    const addToHistory = (queryObj) => {
        const historyEntry = {
            ...queryObj,
            timestamp: new Date().toISOString(),
            database: selectedDatabase,
            filters: { ...filters }
        };
        const newHistory = [historyEntry, ...queryHistory.slice(0, 9)];
        setQueryHistory(newHistory);
        localStorage.setItem('queryHistory', JSON.stringify(newHistory));
    };

    // Save query for later use
    const saveQuery = (queryObj) => {
        const savedEntry = {
            ...queryObj,
            id: Date.now(),
            database: selectedDatabase,
            filters: { ...filters }
        };
        const newSaved = [...savedQueries, savedEntry];
        setSavedQueries(newSaved);
        localStorage.setItem('savedQueries', JSON.stringify(newSaved));
    };

    // Remove saved query
    const removeSavedQuery = (id) => {
        const newSaved = savedQueries.filter(q => q.id !== id);
        setSavedQueries(newSaved);
        localStorage.setItem('savedQueries', JSON.stringify(newSaved));
    };

    // Helper function to determine if a query can be filtered
    const isQueryFilterable = (queryObj) => {
        if (!queryObj) return false;

        const sql = queryObj.sql.toLowerCase();

        // Skip queries that already show demographic breakdowns
        const hasAgeBreakdown = sql.includes('age_group') ||
            sql.includes('pediatric') ||
            sql.includes('young adult');
        const hasGenderBreakdown = sql.includes('as gender') ||
            sql.includes('male') ||
            sql.includes('female');

        if (hasAgeBreakdown || hasGenderBreakdown) {
            return false;
        }

        // Only filterable if it has person joins - check for specific filterable queries
        const hasPersonJoin = sql.includes('join person p') || sql.includes('join person');
        const isFilterableQuery = hasPersonJoin &&
            !sql.includes('union') &&
            (queryObj.name.includes('Top Conditions') ||
                queryObj.name.includes('Top Medications') ||
                queryObj.description.toLowerCase().includes('demographic'));

        return isFilterableQuery;
    }; const applyFiltersToSql = (sql) => {
        // This function only gets called for queries that have already been determined as filterable

        let filteredSql = sql;
        const filterConditions = [];

        // Determine table prefix
        const tablePrefix = sql.toLowerCase().includes('person p') ? 'p.' : 'person.';

        // Apply age filter
        if (filters.ageGroup !== 'all') {
            if (filters.ageGroup === 'adult') {
                filterConditions.push(`(2025 - ${tablePrefix}year_of_birth) >= 18`);
            } else if (filters.ageGroup === 'child') {
                filterConditions.push(`(2025 - ${tablePrefix}year_of_birth) < 18`);
            }
        }

        // Apply gender filter
        if (filters.gender !== 'all') {
            const genderConceptId = filters.gender === 'male' ? '8507' : '8532';
            filterConditions.push(`${tablePrefix}gender_concept_id = ${genderConceptId}`);
        }

        // Insert filters
        if (filterConditions.length > 0) {
            const filterClause = filterConditions.join(' AND ');

            if (filteredSql.toLowerCase().includes('where')) {
                const whereIndex = filteredSql.toLowerCase().indexOf('where');
                const beforeWhere = filteredSql.substring(0, whereIndex + 5);
                const afterWhere = filteredSql.substring(whereIndex + 5);
                filteredSql = beforeWhere + ` (${filterClause}) AND ` + afterWhere;
            } else {
                filteredSql = filteredSql.replace(/GROUP BY/i, `WHERE ${filterClause} GROUP BY`);
            }
        }

        return filteredSql;
    }; const mergeDatabaseResults = (data1, data2) => {
        if (!data1 || !data2) return data1 || data2 || [];
        if (data1.length === 0) return data2;
        if (data2.length === 0) return data1;

        const firstRow = data1[0];

        // Simple count queries
        if (Object.keys(firstRow).length === 1 && typeof Object.values(firstRow)[0] === 'number') {
            const total = parseInt(Object.values(data1[0])[0]) + parseInt(Object.values(data2[0])[0]);
            return [{ [Object.keys(firstRow)[0]]: total }];
        }

        // Gender or age_group breakdown data
        if (firstRow.gender || firstRow.age_group) {
            const merged = {};
            [...data1, ...data2].forEach(row => {
                const key = row.gender || row.age_group;
                if (merged[key]) {
                    merged[key].count = parseInt(merged[key].count) + parseInt(row.count);
                } else {
                    merged[key] = { ...row, count: parseInt(row.count) };
                }
            });
            return Object.values(merged);
        }

        // Percentage queries
        if (firstRow.somepersons && firstRow.fullperson) {
            const totalSome = parseInt(data1[0].somepersons) + parseInt(data2[0].somepersons);
            const totalFull = parseInt(data1[0].fullperson) + parseInt(data2[0].fullperson);
            const percentage = totalFull === 0 ? '0 %' : ((totalSome * 100.0 / totalFull).toFixed(3) + ' %');
            return [{ somepersons: totalSome, fullperson: totalFull, percentage }];
        }

        // Aggregated data
        const merged = {};

        [...data1, ...data2].forEach(row => {
            const key = row.concept_name || row.table_name || JSON.stringify(row);

            if (merged[key]) {
                if (row.condition_count) merged[key].condition_count = (parseInt(merged[key].condition_count) + parseInt(row.condition_count)).toString();
                if (row.conditioned_patients) merged[key].conditioned_patients = (parseInt(merged[key].conditioned_patients) + parseInt(row.conditioned_patients)).toString();
                if (row.total_patients) merged[key].total_patients = (parseInt(merged[key].total_patients) + parseInt(row.total_patients)).toString();

                if (row.percentage && merged[key].conditioned_patients && merged[key].total_patients) {
                    const patients = parseInt(merged[key].conditioned_patients);
                    const total = parseInt(merged[key].total_patients);
                    merged[key].percentage = (patients * 100.0 / total).toFixed(2);
                }
            } else {
                merged[key] = { ...row };
            }
        });

        return Object.values(merged).sort((a, b) => {
            if (a.condition_count && b.condition_count) return parseInt(b.condition_count) - parseInt(a.condition_count);
            if (a.conditioned_patients && b.conditioned_patients) return parseInt(b.conditioned_patients) - parseInt(a.conditioned_patients);
            return 0;
        });
    };

    const runQuery = async (queryObj) => {
        setLoading(true);
        setError(null);
        setCurrentQueryName(queryObj.name);
        setSelectedQuery(queryObj);

        try {
            // Determine which SQL to use
            let sqlToUse = queryObj.sql;

            // For demographics with breakdown queries available
            if (activeCategory === 'demographics' && (queryObj.sqlWithBreakdown || queryObj.sqlWithAgeBreakdown)) {
                const hasAgeFilter = filters.ageGroup !== 'all';
                const hasGenderFilter = filters.gender !== 'all';

                if (hasGenderFilter && hasAgeFilter && queryObj.sqlWithCombinedBreakdown) {
                    sqlToUse = queryObj.sqlWithCombinedBreakdown;
                } else if (hasGenderFilter && queryObj.sqlWithBreakdown) {
                    sqlToUse = queryObj.sqlWithBreakdown;
                } else if (hasAgeFilter && queryObj.sqlWithAgeBreakdown) {
                    sqlToUse = queryObj.sqlWithAgeBreakdown;
                } else {
                    sqlToUse = queryObj.sql;
                }
            }

            // Apply filters only if query supports it
            const filteredSql = isQueryFilterable(queryObj) ? applyFiltersToSql(sqlToUse) : sqlToUse;

            // Execute query
            if (selectedDatabase === 'both') {
                const [data1, data2] = await Promise.all([
                    executeQuery(filteredSql, 'hospital1'),
                    executeQuery(filteredSql, 'hospital2')
                ]);

                const mergedData = mergeDatabaseResults(data1, data2);
                setQueryResult(mergedData);
            } else {
                const data = await executeQuery(filteredSql, selectedDatabase);
                setQueryResult(data);
            }

            // Add to history
            addToHistory(queryObj);

        } catch (err) {
            setError(err.message);
            console.error('Error executing PostgreSQL query:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-determine chart type based on data structure
    const getOptimalChartType = (data) => {
        if (!data || !data[0]) return 'bar';

        const firstRow = data[0];

        // Check for time series data
        if (firstRow.year || firstRow.month || firstRow.date) {
            return 'line';
        }

        // Check for categorical breakdown data
        if (firstRow.gender || firstRow.age_group) {
            return 'pie';
        }

        // Check for percentage/proportion data
        if (firstRow.percentage || (firstRow.somepersons && firstRow.fullperson)) {
            return 'pie';
        }

        // Default to bar chart for counts and other numeric data
        return 'bar';
    };

    const getChartComponent = (data, queryObj = null) => {
        if (!data || !data[0]) return null;

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

        const firstRow = data[0];

        // Use predefined chart type from query, or fall back to auto-detection
        let actualChartType = queryObj?.chartType || chartType;
        if (actualChartType === 'auto') {
            actualChartType = getOptimalChartType(data);
        }

        try {
            // Handle different chart types
            let chartComponent;
            switch (actualChartType) {
                case 'pie':
                    // Pie chart logic for various data structures
                    if (firstRow.gender || firstRow.age_group || firstRow.visit_type || firstRow.condition_type || firstRow.specialty || firstRow.drug_class || firstRow.category || firstRow.metric || firstRow.age_outcome || firstRow.complexity_level || firstRow.intervention_type || firstRow.patient_type) {
                        const pieData = data.map(row => ({
                            name: row.gender || row.age_group || row.visit_type || row.condition_type || row.specialty || row.drug_class || row.category || row.metric || row.age_outcome || row.complexity_level || row.intervention_type || row.patient_type,
                            value: parseInt(row.count || row.patient_count || row.unique_patients || row.total_visits || row.visit_count || row.total_count || row.count_value || row.intervention_count || row.utilization_count)
                        }));

                        chartComponent = (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
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
                        );
                    } else {
                        // Generic pie chart for any data with counts
                        const pieData = Object.entries(firstRow)
                            .filter(([key, value]) => typeof value === 'number' || !isNaN(parseInt(value)))
                            .map(([key, value]) => ({
                                name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                value: parseInt(value) || 0
                            }));

                        if (pieData.length > 0) {
                            chartComponent = (
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
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
                            );
                        }
                    }
                    break;

                case 'bar':
                    // Enhanced bar chart logic
                    let chartData = [];

                    if (firstRow.condition_name || firstRow.drug_name || firstRow.procedure_name) {
                        chartData = data.map(row => ({
                            name: (row.condition_name || row.drug_name || row.procedure_name)?.length > 25
                                ? (row.condition_name || row.drug_name || row.procedure_name).substring(0, 25) + '...'
                                : (row.condition_name || row.drug_name || row.procedure_name),
                            fullName: row.condition_name || row.drug_name || row.procedure_name,
                            count: parseInt(row.patient_count || row.prescription_count || row.total_occurrences || row.count),
                            secondary: parseInt(row.total_occurrences || row.avg_days_supply || row.avg_age || 0)
                        }));
                    } else if (firstRow.age_group || firstRow.medication_group || firstRow.stay_duration || firstRow.drug_class || firstRow.specialty || firstRow.visit_type || firstRow.category || firstRow.metric || firstRow.age_outcome || firstRow.complexity_level || firstRow.intervention_type || firstRow.patient_type) {
                        chartData = data.map(row => ({
                            name: row.age_group || row.medication_group || row.stay_duration || row.drug_class || row.specialty || row.visit_type || row.category || row.metric || row.age_outcome || row.complexity_level || row.intervention_type || row.patient_type,
                            fullName: row.age_group || row.medication_group || row.stay_duration || row.drug_class || row.specialty || row.visit_type || row.category || row.metric || row.age_outcome || row.complexity_level || row.intervention_type || row.patient_type,
                            count: parseInt(row.patient_count || row.visit_count || row.unique_patients || row.total_visits || row.count || row.total_count || row.count_value || row.intervention_count || row.utilization_count || row.treatment_count),
                            secondary: parseInt(row.avg_drug_count || row.avg_days || row.avg_age || row.medication_count || 0)
                        }));
                    } else {
                        // Generic handling for any data with counts
                        const nameField = Object.keys(firstRow).find(key => typeof firstRow[key] === 'string') || Object.keys(firstRow)[0];
                        const countField = Object.keys(firstRow).find(key => key.includes('count') || key.includes('patient')) || Object.keys(firstRow)[1];

                        chartData = data.map(row => ({
                            name: row[nameField]?.toString().length > 25 ? row[nameField].toString().substring(0, 25) + '...' : row[nameField],
                            fullName: row[nameField],
                            count: parseInt(row[countField] || 0)
                        }));
                    }

                    if (chartData.length > 0) {
                        chartComponent = (
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
                                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="custom-tooltip">
                                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.fullName}</p>
                                                        <p style={{ margin: '5px 0 0 0' }}>Count: {payload[0].value}</p>
                                                        {payload[0].payload.secondary && payload[0].payload.secondary > 0 && (
                                                            <p style={{ margin: '5px 0 0 0' }}>Secondary: {payload[0].payload.secondary}</p>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" name="Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        );
                    }
                    break; case 'line':
                    // Enhanced line chart for time series
                    if (firstRow.month) {
                        chartComponent = (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey={Object.keys(firstRow).find(key => key.includes('count') || key.includes('patients'))}
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    {firstRow.unique_patients && (
                                        <Line
                                            type="monotone"
                                            dataKey="unique_patients"
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    )}
                                    {firstRow.avg_length_of_stay && (
                                        <Line
                                            type="monotone"
                                            dataKey="avg_length_of_stay"
                                            stroke="#ff7300"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        );
                    }
                    break;

                case 'area':
                    // Area chart for stacked data
                    chartComponent = (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={Object.keys(firstRow)[0]} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="patient_count"
                                    stackId="1"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                />
                                {firstRow.avg_age && (
                                    <Area
                                        type="monotone"
                                        dataKey="avg_age"
                                        stackId="2"
                                        stroke="#82ca9d"
                                        fill="#82ca9d"
                                        fillOpacity={0.6}
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    );
                    break;

                case 'scatter':
                    // Scatter plot for age/gender correlation data
                    if (firstRow.age && firstRow.gender) {
                        chartComponent = (
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="age"
                                        type="number"
                                        domain={['dataMin', 'dataMax']}
                                        label={{ value: 'Age', position: 'insideBottom', offset: -10 }}
                                    />
                                    <YAxis
                                        label={{ value: 'Patient Count', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="custom-tooltip">
                                                        <p>Age: {payload[0].payload.age}</p>
                                                        <p>Gender: {payload[0].payload.gender}</p>
                                                        <p>Patients: {payload[0].payload.patient_count}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter name="Patients" dataKey="patient_count" fill="#8884d8" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        );
                    } else {
                        // Generic scatter plot
                        const xKey = Object.keys(firstRow)[0];
                        const yKey = Object.keys(firstRow)[1];

                        chartComponent = (
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey={xKey} type="number" />
                                    <YAxis dataKey={yKey} type="number" />
                                    <Tooltip />
                                    <Scatter name="Data" dataKey={Object.keys(firstRow)[2] || yKey} fill="#8884d8" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        );
                    }
                    break;

                case 'radar':
                    // Radar chart for multi-dimensional data
                    chartComponent = (
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={data}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey={Object.keys(firstRow)[0]} />
                                <PolarRadiusAxis />
                                <Tooltip />
                                <Legend />
                                <Radar
                                    name="Patient Count"
                                    dataKey="patient_count"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                {firstRow.emergency_visits && (
                                    <Radar
                                        name="Emergency Visits"
                                        dataKey="emergency_visits"
                                        stroke="#82ca9d"
                                        fill="#82ca9d"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                    />
                                )}
                            </RadarChart>
                        </ResponsiveContainer>
                    );
                    break;

                case 'composed':
                    // Composed chart for mixed data types
                    chartComponent = (
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={Object.keys(firstRow)[0]} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {firstRow.male_count && (
                                    <Bar dataKey="male_count" fill="#8884d8" name="Male" />
                                )}
                                {firstRow.female_count && (
                                    <Bar dataKey="female_count" fill="#82ca9d" name="Female" />
                                )}
                                {firstRow.diagnostic_count && (
                                    <Bar dataKey="diagnostic_count" fill="#8884d8" name="Diagnostic" />
                                )}
                                {firstRow.therapeutic_count && (
                                    <Line type="monotone" dataKey="therapeutic_count" stroke="#ff7300" name="Therapeutic" />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    );
                    break;

                case 'treemap':
                    // Treemap chart for hierarchical data
                    const treemapData = data.map(row => ({
                        name: row.condition_name || row.drug_name || row.drug_class || row.category,
                        value: parseInt(row.patient_count || row.count),
                        size: parseInt(row.patient_count || row.count)
                    }));

                    chartComponent = (
                        <ResponsiveContainer width="100%" height={400}>
                            <Treemap
                                data={treemapData}
                                dataKey="size"
                                ratio={4/3}
                                stroke="#fff"
                                fill="#8884d8"
                            >
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="custom-tooltip">
                                                <p>{payload[0].payload.name}</p>
                                                <p>Count: {payload[0].payload.value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                            </Treemap>
                        </ResponsiveContainer>
                    );
                    break;

                case 'funnel':
                    // Funnel chart for conversion-style data
                    const funnelData = data.map((row, index) => ({
                        name: row.gender || row.intervention_type || row.procedure_name || row.category,
                        value: parseInt(row.patient_count || row.count || row.intervention_count),
                        fill: COLORS[index % COLORS.length]
                    }));

                    chartComponent = (
                        <ResponsiveContainer width="100%" height={400}>
                            <FunnelChart>
                                <Funnel
                                    data={funnelData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                >
                                    <LabelList position="center" fill="#fff" fontSize="12" />
                                </Funnel>
                                <Tooltip />
                                <Legend />
                            </FunnelChart>
                        </ResponsiveContainer>
                    );
                    break;

                default:
                    // Fallback for simple numeric display
                    chartComponent = (
                        <div className="result-card">
                            <div className="result-value">
                                {typeof Object.values(firstRow)[0] === 'number'
                                    ? Object.values(firstRow)[0].toLocaleString()
                                    : parseInt(Object.values(firstRow)[0] || 0).toLocaleString()
                                }
                            </div>
                        </div>
                    );
            }

            return chartComponent;

        } catch (error) {
            console.error('Error rendering chart:', error);
            return (
                <div className="chart-error">
                    <h3>Chart Rendering Error</h3>
                    <p>Unable to render chart with selected type: {actualChartType}</p>
                    <p>Error: {error.message}</p>
                </div>
            );
        }
    };

    const renderSidebar = () => {
        return (
            <div className={`analytics-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                    {!sidebarCollapsed && <h3>Query Options</h3>}
                </div>

                {!sidebarCollapsed && (
                    <>
                        {/* Dashboard View Tabs */}
                        <div className="dashboard-tabs">
                            <button
                                className={dashboardView === 'query' ? 'active' : ''}
                                onClick={() => setDashboardView('query')}
                            >
                                Queries
                            </button>
                            <button
                                className={dashboardView === 'comparison' ? 'active' : ''}
                                onClick={() => setDashboardView('comparison')}
                            >
                                Saved
                            </button>
                            <button
                                className={dashboardView === 'insights' ? 'active' : ''}
                                onClick={() => setDashboardView('insights')}
                            >
                                History
                            </button>
                        </div>

                        {/* Database Selector */}
                        <div className="sidebar-section">
                            <label>Database:</label>
                            <select
                                value={selectedDatabase}
                                onChange={(e) => {
                                    setSelectedDatabase(e.target.value);
                                    setQueryResult(null);
                                    setError(null);
                                }}
                            >
                                <option value="hospital1">Hospital 1</option>
                                <option value="hospital2">Hospital 2</option>
                                <option value="both">Both (Combined)</option>
                            </select>
                        </div>

                        {/* Query Categories and Queries */}
                        {dashboardView === 'query' && (
                            <div className="queries-section">
                                <div className="category-tabs">
                                    {Object.keys(queries).map(category => (
                                        <button
                                            key={category}
                                            className={activeCategory === category ? 'active' : ''}
                                            onClick={() => setActiveCategory(category)}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="query-list">
                                    {queries[activeCategory] && Object.keys(queries[activeCategory]).map(queryKey => {
                                        const query = queries[activeCategory][queryKey];
                                        return (
                                            <div key={queryKey} className="query-item">
                                                <div className="query-item-header">
                                                    <span className="query-name">{query.name}</span>
                                                    <div className="query-actions">
                                                        <button
                                                            className="run-query"
                                                            onClick={() => runQuery(query)}
                                                            disabled={loading}
                                                        >
                                                            {loading && selectedQuery?.name === query.name ? '⏳' : '▶'}
                                                        </button>
                                                        <button
                                                            className="save-query"
                                                            onClick={() => saveQuery(query)}
                                                        >
                                                            ⭐
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="query-description">{query.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Saved Queries */}
                        {dashboardView === 'comparison' && (
                            <div className="sidebar-section">
                                <h4>Saved Queries</h4>
                                <div className="saved-queries">
                                    {savedQueries.length === 0 ? (
                                        <p>No saved queries yet</p>
                                    ) : (
                                        savedQueries.map(query => (
                                            <div key={query.id} className="saved-query-item">
                                                <span>{query.name}</span>
                                                <div className="query-actions">
                                                    <button onClick={() => runQuery(query)}>▶</button>
                                                    <button onClick={() => removeSavedQuery(query.id)}>🗑</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Query History */}
                        {dashboardView === 'insights' && (
                            <div className="sidebar-section">
                                <h4>Recent Queries</h4>
                                <div className="query-history">
                                    {queryHistory.length === 0 ? (
                                        <p>No query history yet</p>
                                    ) : (
                                        queryHistory.map((query, index) => (
                                            <div key={index} className="history-item">
                                                <span>{query.name}</span>
                                                <small>{new Date(query.timestamp).toLocaleString()}</small>
                                                <button onClick={() => runQuery(query)}>▶</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="analytics-dashboard">
            {renderSidebar()}

            <div className="analytics-main-content">
                <div className="dashboard-header">
                    <h1>Advanced Analytics Dashboard</h1>
                    <div className="status-indicators">
                        {loading && <div className="loading-indicator">Processing...</div>}
                        {error && <div className="error-indicator">Error: {error}</div>}
                    </div>
                </div>

                <div className="chart-area">
                    {queryResult ? (
                        <div className="query-result-container">
                            <div className="result-header">
                                <h2>{currentQueryName}</h2>
                                <p className="query-description">{selectedQuery?.description}</p>
                                <div className="result-metadata">
                                    <span>Database: {selectedDatabase}</span>
                                    <span>Chart Type: {selectedQuery?.chartType || 'Auto'}</span>
                                    {selectedQuery && isQueryFilterable(selectedQuery) && (
                                        <>
                                            <span>
                                                Age:
                                                <select
                                                    value={filters.ageGroup}
                                                    onChange={(e) => {
                                                        setFilters({ ...filters, ageGroup: e.target.value });
                                                        runQuery(selectedQuery);
                                                    }}
                                                    style={{ marginLeft: '5px' }}
                                                >
                                                    <option value="all">All</option>
                                                    <option value="adult">Adults (18+)</option>
                                                    <option value="child">Children (&lt;18)</option>
                                                </select>
                                            </span>
                                            <span>
                                                Gender:
                                                <select
                                                    value={filters.gender}
                                                    onChange={(e) => {
                                                        setFilters({ ...filters, gender: e.target.value });
                                                        runQuery(selectedQuery);
                                                    }}
                                                    style={{ marginLeft: '5px' }}
                                                >
                                                    <option value="all">All</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="chart-container">
                                {getChartComponent(queryResult, selectedQuery)}
                            </div>

                            {/* Data Table */}
                            {queryResult.length > 0 && (
                                <div className="data-table-container">
                                    <h3>Raw Data</h3>
                                    <div className="data-table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    {Object.keys(queryResult[0]).map(key => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {queryResult.slice(0, 50).map((row, index) => (
                                                    <tr key={index}>
                                                        {Object.values(row).map((value, i) => (
                                                            <td key={i}>{value}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {queryResult.length > 50 && (
                                            <p className="table-note">Showing first 50 rows of {queryResult.length} results</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3>Select a query to get started</h3>
                            <p>Choose from the sidebar to run analytics and visualize your data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;