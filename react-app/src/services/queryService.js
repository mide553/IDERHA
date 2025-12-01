// Query Service with FDW Support

// Helper function to execute queries with FDW support
export const executeQuery = async (query, database = 'unified', useUnified = true) => {
    try {
        const endpoint = 'http://localhost:8080/api/pg-query';

        // Build request body
        const requestBody = {
            query: query
        };

        // Determine how to execute the query based on database selection
        if (database === 'unified' || database === 'both') {
            // Use FDW unified views - replace table names with unified_ prefix
            requestBody.query = query.replace(/\bperson\b/g, 'unified_person')
                .replace(/\bcondition_occurrence\b/g, 'unified_condition_occurrence')
                .replace(/\bdrug_exposure\b/g, 'unified_drug_exposure')
                .replace(/\bobservation\b/g, 'unified_observation')
                .replace(/\bvisit_occurrence\b/g, 'unified_visit_occurrence')
                .replace(/\bprocedure_occurrence\b/g, 'unified_procedure_occurrence')
                .replace(/\bmeasurement\b/g, 'unified_measurement')
                .replace(/\bconcept\b/g, 'unified_concept')
                .replace(/\bconcept_relationship\b/g, 'unified_concept_relationship');
            requestBody.unified = 'true';
        } else {
            // Query specific hospital database
            requestBody.database = database;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include'
        });

        if (!response.ok) {
            let errorMessage = `Database error: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If parsing error response fails, use status text
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        // Handle new response format with success/data structure
        if (result.success === true && result.data) {
            return result.data;
        }

        // Fallback for old format (array response)
        return result;
    } catch (error) {
        console.error('Query execution error:', error);
        throw new Error(`Query execution failed: ${error.message}`);
    }
};

// Check available unified views
export const checkUnifiedViews = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/unified-views', {
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return data.views || [];
        }

        return [];
    } catch (error) {
        console.error('Error checking unified views:', error);
        return [];
    }
};

// OMOP CDM-based queries - table names will be automatically adjusted based on database selection
export const queries = {
    demographics: {
        genderDistribution: {
            name: 'Gender Distribution',
            chartType: 'pie',
            sql: `
                SELECT 
                    CASE 
                        WHEN gender_concept_id = 8507 THEN 'Male'
                        WHEN gender_concept_id = 8532 THEN 'Female'
                        ELSE 'Unknown'
                    END as gender,
                    COUNT(*) as count
                FROM person
                WHERE gender_concept_id IS NOT NULL
                GROUP BY gender_concept_id
                ORDER BY count DESC`
        },

        ageDistribution: {
            name: 'Age Distribution',
            chartType: 'bar',
            sql: `
                SELECT 
                    age_group,
                    COUNT(*) as count
                FROM (
                    SELECT 
                        CASE 
                            WHEN (2025 - year_of_birth) BETWEEN 0 AND 17 THEN '0-17'
                            WHEN (2025 - year_of_birth) BETWEEN 18 AND 34 THEN '18-34'
                            WHEN (2025 - year_of_birth) BETWEEN 35 AND 49 THEN '35-49'
                            WHEN (2025 - year_of_birth) BETWEEN 50 AND 64 THEN '50-64'
                            WHEN (2025 - year_of_birth) BETWEEN 65 AND 79 THEN '65-79'
                            ELSE '80+' 
                        END as age_group
                    FROM person
                    WHERE year_of_birth IS NOT NULL
                ) subq
                GROUP BY age_group
                ORDER BY 
                    CASE age_group
                        WHEN '0-17' THEN 1
                        WHEN '18-34' THEN 2
                        WHEN '35-49' THEN 3
                        WHEN '50-64' THEN 4
                        WHEN '65-79' THEN 5
                        ELSE 6
                    END`
        },

        populationPyramid: {
            name: 'Population Pyramid',
            chartType: 'composed',
            sql: `
                SELECT 
                    age_group,
                    SUM(CASE WHEN gender_concept_id = 8507 THEN 1 ELSE 0 END) as male_count,
                    SUM(CASE WHEN gender_concept_id = 8532 THEN 1 ELSE 0 END) as female_count
                FROM (
                    SELECT 
                        CASE 
                            WHEN (2025 - year_of_birth) BETWEEN 0 AND 17 THEN '0-17'
                            WHEN (2025 - year_of_birth) BETWEEN 18 AND 34 THEN '18-34'
                            WHEN (2025 - year_of_birth) BETWEEN 35 AND 54 THEN '35-54'
                            WHEN (2025 - year_of_birth) BETWEEN 55 AND 74 THEN '55-74'
                            ELSE '75+'
                        END as age_group,
                        gender_concept_id
                    FROM person
                    WHERE year_of_birth IS NOT NULL AND gender_concept_id IS NOT NULL
                ) subq
                GROUP BY age_group
                ORDER BY 
                    CASE age_group
                        WHEN '0-17' THEN 1
                        WHEN '18-34' THEN 2
                        WHEN '35-54' THEN 3
                        WHEN '55-74' THEN 4
                        ELSE 5
                    END`
        },

        totalPatients: {
            name: 'Total Patients',
            chartType: 'metric',
            sql: `SELECT COUNT(*) as total FROM person`
        }
    },

    conditions: {
        topConditions: {
            name: 'Top 15 Conditions',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 40) as condition,
                    COUNT(DISTINCT co.person_id) as patient_count
                FROM condition_occurrence co
                JOIN concept c ON co.condition_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY c.concept_id, c.concept_name
                ORDER BY patient_count DESC
                LIMIT 15`
        },

        conditionsByGender: {
            name: 'Conditions by Gender',
            chartType: 'pie',
            sql: `
                SELECT 
                    CASE 
                        WHEN p.gender_concept_id = 8507 THEN 'Male'
                        WHEN p.gender_concept_id = 8532 THEN 'Female'
                        ELSE 'Unknown'
                    END as gender,
                    COUNT(DISTINCT co.person_id) as patient_count
                FROM condition_occurrence co
                JOIN person p ON co.person_id = p.person_id
                WHERE p.gender_concept_id IS NOT NULL
                GROUP BY p.gender_concept_id
                ORDER BY patient_count DESC`
        },

        conditionsByAge: {
            name: 'Conditions by Age Group',
            chartType: 'pie',
            sql: `
                SELECT 
                    age_group,
                    COUNT(DISTINCT co.person_id) as patient_count
                FROM condition_occurrence co
                JOIN (
                    SELECT 
                        person_id,
                        CASE 
                            WHEN (2025 - year_of_birth) < 18 THEN 'Pediatric (0-17)'
                            WHEN (2025 - year_of_birth) BETWEEN 18 AND 39 THEN 'Young Adult (18-39)'
                            WHEN (2025 - year_of_birth) BETWEEN 40 AND 64 THEN 'Middle Age (40-64)'
                            ELSE 'Senior (65+)'
                        END as age_group
                    FROM person
                    WHERE year_of_birth IS NOT NULL
                ) p ON co.person_id = p.person_id
                GROUP BY age_group
                ORDER BY 
                    CASE age_group
                        WHEN 'Pediatric (0-17)' THEN 1
                        WHEN 'Young Adult (18-39)' THEN 2
                        WHEN 'Middle Age (40-64)' THEN 3
                        ELSE 4
                    END`
        },

        chronicConditions: {
            name: 'Chronic vs Acute by Age Group',
            chartType: 'radar',
            sql: `
                SELECT 
                    age_group,
                    SUM(CASE WHEN is_chronic = 1 THEN 1 ELSE 0 END) as chronic_count,
                    SUM(CASE WHEN is_chronic = 0 THEN 1 ELSE 0 END) as acute_count
                FROM (
                    SELECT DISTINCT
                        co.person_id,
                        CASE 
                            WHEN (2025 - p.year_of_birth) < 18 THEN 'Pediatric'
                            WHEN (2025 - p.year_of_birth) BETWEEN 18 AND 39 THEN 'Young Adult'
                            WHEN (2025 - p.year_of_birth) BETWEEN 40 AND 64 THEN 'Middle Age'
                            ELSE 'Senior'
                        END as age_group,
                        CASE 
                            WHEN LOWER(c.concept_name) SIMILAR TO '%(chronic|diabetes|hypertension|arthritis|asthma|copd|heart disease|kidney disease|cancer|epilepsy)%' THEN 1
                            ELSE 0
                        END as is_chronic
                    FROM condition_occurrence co
                    JOIN person p ON co.person_id = p.person_id
                    JOIN concept c ON co.condition_concept_id = c.concept_id
                    WHERE p.year_of_birth IS NOT NULL AND c.concept_name IS NOT NULL
                ) subq
                GROUP BY age_group,
                    CASE 
                        WHEN age_group = 'Pediatric' THEN 1
                        WHEN age_group = 'Young Adult' THEN 2
                        WHEN age_group = 'Middle Age' THEN 3
                        ELSE 4
                    END
                ORDER BY 
                    CASE 
                        WHEN age_group = 'Pediatric' THEN 1
                        WHEN age_group = 'Young Adult' THEN 2
                        WHEN age_group = 'Middle Age' THEN 3
                        ELSE 4
                    END`
        },

        totalConditions: {
            name: 'Total Conditions',
            chartType: 'metric',
            sql: `SELECT COUNT(DISTINCT person_id) as total FROM condition_occurrence`
        }
    },

    medications: {
        topMedications: {
            name: 'Top 15 Medications',
            chartType: 'treemap',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 40) as drug_name,
                    COUNT(DISTINCT de.person_id) as patient_count,
                    COUNT(*) as total_prescriptions
                FROM drug_exposure de
                JOIN concept c ON de.drug_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY c.concept_id, c.concept_name
                ORDER BY patient_count DESC
                LIMIT 15`
        },

        medicationsByGender: {
            name: 'Top Medication Classes',
            chartType: 'area',
            sql: `
                SELECT 
                    CASE 
                        WHEN LOWER(c.concept_name) LIKE '%ibuprofen%' OR LOWER(c.concept_name) LIKE '%aspirin%' THEN 'Pain Relief'
                        WHEN LOWER(c.concept_name) LIKE '%celecoxib%' OR LOWER(c.concept_name) LIKE '%diclofenac%' THEN 'Anti-Inflammatory'
                        WHEN LOWER(c.concept_name) LIKE '%lisinopril%' OR LOWER(c.concept_name) LIKE '%amlodipine%' THEN 'Blood Pressure'
                        WHEN LOWER(c.concept_name) LIKE '%metformin%' OR LOWER(c.concept_name) LIKE '%insulin%' THEN 'Diabetes'
                        WHEN LOWER(c.concept_name) LIKE '%atorvastatin%' OR LOWER(c.concept_name) LIKE '%simvastatin%' THEN 'Cholesterol'
                        WHEN LOWER(c.concept_name) LIKE '%omeprazole%' OR LOWER(c.concept_name) LIKE '%pantoprazole%' THEN 'Gastric'
                        WHEN LOWER(c.concept_name) LIKE '%antibiotic%' OR LOWER(c.concept_name) LIKE '%amoxicillin%' THEN 'Antibiotics'
                        ELSE 'Other'
                    END as medication_class,
                    COUNT(DISTINCT de.person_id) as patient_count
                FROM drug_exposure de
                JOIN concept c ON de.drug_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY medication_class
                HAVING COUNT(DISTINCT de.person_id) > 10
                ORDER BY patient_count DESC`
        },

        medicationsByAge: {
            name: 'Medications by Age',
            chartType: 'composed',
            sql: `
                SELECT 
                    age_group,
                    SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_count,
                    SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_count,
                    COUNT(DISTINCT person_id) as patient_count
                FROM (
                    SELECT DISTINCT
                        de.person_id,
                        CASE 
                            WHEN (2025 - p.year_of_birth) < 18 THEN 'Pediatric (0-17)'
                            WHEN (2025 - p.year_of_birth) BETWEEN 18 AND 39 THEN 'Young Adult (18-39)'
                            WHEN (2025 - p.year_of_birth) BETWEEN 40 AND 64 THEN 'Middle Age (40-64)'
                            ELSE 'Senior (65+)'
                        END as age_group,
                        CASE 
                            WHEN p.gender_concept_id = 8507 THEN 'Male'
                            WHEN p.gender_concept_id = 8532 THEN 'Female'
                            ELSE 'Unknown'
                        END as gender
                    FROM drug_exposure de
                    JOIN person p ON de.person_id = p.person_id
                    WHERE p.year_of_birth IS NOT NULL AND p.gender_concept_id IS NOT NULL
                ) subq
                GROUP BY age_group
                ORDER BY 
                    CASE age_group
                        WHEN 'Pediatric (0-17)' THEN 1
                        WHEN 'Young Adult (18-39)' THEN 2
                        WHEN 'Middle Age (40-64)' THEN 3
                        ELSE 4
                    END`
        },

        polypharmacy: {
            name: 'Polypharmacy Distribution',
            chartType: 'composed',
            sql: `
                SELECT 
                    med_group,
                    COUNT(*) as patient_count,
                    AVG(drug_count)::numeric(10,1) as avg_medications,
                    SUM(CASE WHEN drug_count >= 5 THEN 1 ELSE 0 END) as high_risk_count
                FROM (
                    SELECT 
                        person_id,
                        COUNT(DISTINCT drug_concept_id) as drug_count,
                        CASE 
                            WHEN COUNT(DISTINCT drug_concept_id) = 1 THEN '1 Medication'
                            WHEN COUNT(DISTINCT drug_concept_id) BETWEEN 2 AND 4 THEN '2-4 Medications'
                            WHEN COUNT(DISTINCT drug_concept_id) BETWEEN 5 AND 9 THEN '5-9 Medications (Polypharmacy)'
                            ELSE '10+ Medications (Severe Polypharmacy)'
                        END as med_group
                    FROM drug_exposure
                    GROUP BY person_id
                ) subq
                GROUP BY med_group, 
                    CASE 
                        WHEN med_group = '1 Medication' THEN 1
                        WHEN med_group = '2-4 Medications' THEN 2
                        WHEN med_group = '5-9 Medications (Polypharmacy)' THEN 3
                        ELSE 4
                    END
                ORDER BY 
                    CASE 
                        WHEN med_group = '1 Medication' THEN 1
                        WHEN med_group = '2-4 Medications' THEN 2
                        WHEN med_group = '5-9 Medications (Polypharmacy)' THEN 3
                        ELSE 4
                    END`
        },

        totalMedications: {
            name: 'Total Medications',
            chartType: 'metric',
            sql: `SELECT COUNT(DISTINCT person_id) as total FROM drug_exposure`
        }
    },

    visits: {
        totalVisits: {
            name: 'Total Visits',
            chartType: 'metric',
            sql: `SELECT COUNT(*) as total FROM visit_occurrence`
        },

        visitsByType: {
            name: 'Visits by Type',
            chartType: 'pie',
            sql: `
                SELECT 
                    COALESCE(c.concept_name, 'Unknown') as visit_type,
                    COUNT(*) as count
                FROM visit_occurrence vo
                LEFT JOIN concept c ON vo.visit_concept_id = c.concept_id
                GROUP BY c.concept_id, c.concept_name
                HAVING COUNT(*) > 0
                ORDER BY count DESC`
        },

        visitsByGender: {
            name: 'Visit Frequency Distribution',
            chartType: 'bar',
            sql: `
                SELECT 
                    visit_group,
                    COUNT(DISTINCT person_id) as patient_count,
                    AVG(visit_count)::numeric(10,1) as avg_visits
                FROM (
                    SELECT 
                        person_id,
                        COUNT(*) as visit_count,
                        CASE 
                            WHEN COUNT(*) = 1 THEN '1 Visit'
                            WHEN COUNT(*) BETWEEN 2 AND 3 THEN '2-3 Visits'
                            WHEN COUNT(*) BETWEEN 4 AND 6 THEN '4-6 Visits'
                            WHEN COUNT(*) BETWEEN 7 AND 10 THEN '7-10 Visits'
                            ELSE '10+ Visits'
                        END as visit_group
                    FROM visit_occurrence
                    GROUP BY person_id
                ) subq
                GROUP BY visit_group,
                    CASE 
                        WHEN visit_group = '1 Visit' THEN 1
                        WHEN visit_group = '2-3 Visits' THEN 2
                        WHEN visit_group = '4-6 Visits' THEN 3
                        WHEN visit_group = '7-10 Visits' THEN 4
                        ELSE 5
                    END
                ORDER BY 
                    CASE 
                        WHEN visit_group = '1 Visit' THEN 1
                        WHEN visit_group = '2-3 Visits' THEN 2
                        WHEN visit_group = '4-6 Visits' THEN 3
                        WHEN visit_group = '7-10 Visits' THEN 4
                        ELSE 5
                    END`
        }
    },

    observations: {
        totalObservations: {
            name: 'Total Observations',
            chartType: 'metric',
            sql: `SELECT COUNT(*) as total FROM observation`
        },

        topObservations: {
            name: 'Top Observation Types',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(COALESCE(c.concept_name, 'Unknown'), 1, 40) as observation_type,
                    COUNT(*) as count
                FROM observation o
                LEFT JOIN concept c ON o.observation_concept_id = c.concept_id
                GROUP BY c.concept_id, c.concept_name
                ORDER BY count DESC
                LIMIT 15`
        }
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

            if (data.role === 'admin') {
                return true;
            }

            if (data.role === 'hospital') {
                return data.assignedDatabase === database;
            }

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
