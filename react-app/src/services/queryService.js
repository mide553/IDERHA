// Database Queries Service

export const queries = {
    basic: {
        allConcepts: {
            name: 'Total Concepts',
            sql: `SELECT COUNT(concept_id) FROM concept`,
            description: 'Get total number of concepts in the database'
        },
        totalPersons: {
            name: 'Total Patients',
            sql: `SELECT COUNT(person_id) FROM person`,
            description: 'Get total number of patients in the database'
        },
        drugExposureCount: {
            name: 'Total Drug Exposures',
            sql: `SELECT COUNT(de.person_id) FROM drug_exposure de JOIN person p ON de.person_id = p.person_id`,
            description: 'Get total number of drug exposure records'
        },
        uniquePatientsWithDrugs: {
            name: 'Unique Patients with Drug Exposure',
            sql: `SELECT COUNT(DISTINCT de.person_id) FROM drug_exposure de JOIN person p ON de.person_id = p.person_id`,
            description: 'Get unique patients who have been exposed to drugs'
        },
        uniqueDrugs: {
            name: 'Unique Drugs',
            sql: `SELECT COUNT(DISTINCT de.drug_concept_id) FROM drug_exposure de JOIN person p ON de.person_id = p.person_id`,
            description: 'Get total number of unique drugs in drug exposure records'
        }
    },

    detailed: {
        drugExposureDetails: {
            name: 'Drug Exposure Details',
            sql: `
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
            description: 'Get detailed drug exposure information for first 10 records'
        },
        uniquePatients: {
            name: 'Patient Drug Exposure Analysis',
            sql: `
                SELECT
                    COUNT(DISTINCT de.person_id) AS somepersons,
                    (SELECT COUNT(person_id) FROM person) AS fullperson,
                    CASE 
                        WHEN (SELECT COUNT(person_id) FROM person) = 0 THEN '0 %'
                        ELSE ROUND((COUNT(DISTINCT de.person_id) * 100.0 / (SELECT COUNT(person_id) FROM person)), 3) || ' %'
                    END AS percentage
                FROM drug_exposure de
                JOIN person p ON de.person_id = p.person_id`,
            description: 'Analyze what percentage of patients have drug exposures'
        },
        topConditions: {
            name: 'Top 10 Conditions',
            sql: `
                SELECT
                    co.condition_concept_id, c.concept_name,
                    COUNT(*) AS condition_count
                FROM condition_occurrence co
                JOIN person p ON co.person_id = p.person_id
                JOIN concept c ON c.concept_id = co.condition_concept_id
                GROUP BY co.condition_concept_id, c.concept_name
                ORDER BY condition_count DESC
                LIMIT 10`,
            description: 'Get the top 10 most common conditions'
        },
        conditionsOverTime: {
            name: 'Top 10 Conditions Over Time',
            sql: `
                WITH overall_top_conditions AS (
                    SELECT
                        co.condition_concept_id,
                        c.concept_name,
                        COUNT(*) AS total_count
                    FROM condition_occurrence co
                    JOIN person p ON co.person_id = p.person_id
                    JOIN concept c ON c.concept_id = co.condition_concept_id
                    GROUP BY co.condition_concept_id, c.concept_name
                    ORDER BY total_count DESC
                    LIMIT 10
                )
                SELECT
                    DATE_PART('year', oc.condition_start_date) AS year,
                    oc.condition_concept_id,
                    c.concept_name,
                    COUNT(*) AS condition_count
                FROM condition_occurrence oc
                JOIN person p ON oc.person_id = p.person_id
                JOIN concept c ON c.concept_id = oc.condition_concept_id
                JOIN overall_top_conditions otc ON otc.condition_concept_id = oc.condition_concept_id
                GROUP BY year, oc.condition_concept_id, c.concept_name
                ORDER BY year, oc.condition_concept_id`,
            description: 'Show how top 10 conditions trend over time'
        }
    },

    analysis: {
        neoplasms: {
            name: 'Neoplasm Analysis',
            sql: `
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
                JOIN person p ON co.person_id = p.person_id
                JOIN diagnosed_condition c ON co.condition_concept_id = c.condition_concept_id
                GROUP BY c.concept_name
                ORDER BY conditioned_patients DESC`,
            description: 'Analysis of cancer and tumor-related conditions'
        }
    }
};

// Helper function to execute queries
export const executeQuery = async (query, database = 'hospital1') => {
    try {
        const endpoint = database === 'hospital2'
            ? 'http://localhost:8080/api/pg-query-hospital2'
            : 'http://localhost:8080/api/pg-query';

        const requestBody = database === 'hospital2'
            ? { query }
            : { query, database };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Database error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Query execution failed: ${error.message}`);
    }
};

// Helper function to check if user can access database
export const canAccessDatabase = async (database) => {
    try {
        const response = await fetch('http://localhost:8080/api/users/check-session', {
            credentials: 'include',
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Admin can access all databases
            if (data.role === 'admin') {
                return true;
            }
            
            // Hospital users can only access their assigned database
            if (data.role === 'hospital') {
                return data.assignedDatabase === database;
            }
            
            // Researchers can access all databases for viewing
            if (data.role === 'researcher') {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking database access:', error);
        return false;
    }
};

// Helper function to get all queries by category
export const getQueriesByCategory = (category) => {
    return queries[category] || {};
};

// Helper function to get all query categories
export const getQueryCategories = () => {
    return Object.keys(queries);
};