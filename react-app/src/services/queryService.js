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
                ORDER BY count DESC`,
            description: 'Shows how many male and female patients are in the database'
        },

        ageDistribution: {
            name: 'Age Distribution',
            chartType: 'bar',
            sql: `
                SELECT 
                    CASE 
                        WHEN (2025 - year_of_birth) BETWEEN 0 AND 17 THEN '0-17'
                        WHEN (2025 - year_of_birth) BETWEEN 18 AND 34 THEN '18-34'
                        WHEN (2025 - year_of_birth) BETWEEN 35 AND 49 THEN '35-49'
                        WHEN (2025 - year_of_birth) BETWEEN 50 AND 64 THEN '50-64'
                        WHEN (2025 - year_of_birth) BETWEEN 65 AND 79 THEN '65-79'
                        ELSE '80+' 
                    END as age_group,
                    COUNT(*) as patient_count
                FROM person 
                WHERE year_of_birth IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN (2025 - year_of_birth) BETWEEN 0 AND 17 THEN '0-17'
                        WHEN (2025 - year_of_birth) BETWEEN 18 AND 34 THEN '18-34'
                        WHEN (2025 - year_of_birth) BETWEEN 35 AND 49 THEN '35-49'
                        WHEN (2025 - year_of_birth) BETWEEN 50 AND 64 THEN '50-64'
                        WHEN (2025 - year_of_birth) BETWEEN 65 AND 79 THEN '65-79'
                        ELSE '80+' 
                    END
                ORDER BY patient_count DESC`,
            description: 'Breaks down patients by age ranges to see population demographics'
        },

        ageGenderMatrix: {
            name: 'Age-Gender Demographics Matrix',
            chartType: 'scatter',
            sql: `
                SELECT 
                    (2025 - year_of_birth) as age,
                    CASE 
                        WHEN gender_concept_id = 8507 THEN 'Male'
                        WHEN gender_concept_id = 8532 THEN 'Female'
                        ELSE 'Unknown'
                    END as gender,
                    COUNT(*) as patient_count
                FROM person
                WHERE year_of_birth IS NOT NULL 
                  AND gender_concept_id IS NOT NULL
                  AND (2025 - year_of_birth) BETWEEN 0 AND 100
                GROUP BY (2025 - year_of_birth), gender_concept_id
                ORDER BY age`,
            description: 'Compare patient ages and gender in a detailed view'
        },

        populationPyramid: {
            name: 'Population Pyramid',
            chartType: 'composed',
            sql: `
                SELECT 
                    CASE 
                        WHEN (2025 - year_of_birth) BETWEEN 0 AND 9 THEN '0-9'
                        WHEN (2025 - year_of_birth) BETWEEN 10 AND 19 THEN '10-19'
                        WHEN (2025 - year_of_birth) BETWEEN 20 AND 29 THEN '20-29'
                        WHEN (2025 - year_of_birth) BETWEEN 30 AND 39 THEN '30-39'
                        WHEN (2025 - year_of_birth) BETWEEN 40 AND 49 THEN '40-49'
                        WHEN (2025 - year_of_birth) BETWEEN 50 AND 59 THEN '50-59'
                        WHEN (2025 - year_of_birth) BETWEEN 60 AND 69 THEN '60-69'
                        WHEN (2025 - year_of_birth) BETWEEN 70 AND 79 THEN '70-79'
                        ELSE '80+' 
                    END as age_group,
                    COUNT(CASE WHEN gender_concept_id = 8507 THEN 1 END) as male_count,
                    COUNT(CASE WHEN gender_concept_id = 8532 THEN 1 END) as female_count
                FROM person 
                WHERE year_of_birth IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN (2025 - year_of_birth) BETWEEN 0 AND 9 THEN '0-9'
                        WHEN (2025 - year_of_birth) BETWEEN 10 AND 19 THEN '10-19'
                        WHEN (2025 - year_of_birth) BETWEEN 20 AND 29 THEN '20-29'
                        WHEN (2025 - year_of_birth) BETWEEN 30 AND 39 THEN '30-39'
                        WHEN (2025 - year_of_birth) BETWEEN 40 AND 49 THEN '40-49'
                        WHEN (2025 - year_of_birth) BETWEEN 50 AND 59 THEN '50-59'
                        WHEN (2025 - year_of_birth) BETWEEN 60 AND 69 THEN '60-69'
                        WHEN (2025 - year_of_birth) BETWEEN 70 AND 79 THEN '70-79'
                        ELSE '80+' 
                    END
                ORDER BY age_group`,
            description: 'Classic population pyramid view splitting males and females by age'
        }
    },

    conditions: {
        topConditions: {
            name: 'Most Common Conditions',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 30) as condition_name,
                    COUNT(DISTINCT co.person_id) as patient_count,
                    COUNT(*) as total_occurrences
                FROM condition_occurrence co
                JOIN concept c ON co.condition_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY c.concept_name
                ORDER BY patient_count DESC
                LIMIT 15`,
            description: 'What conditions are diagnosed most often in patients'
        },

        conditionsByGender: {
            name: 'Conditions by Gender',
            chartType: 'bar',
            sql: `
                SELECT 
                    CASE 
                        WHEN p.gender_concept_id = 8507 THEN 'Male'
                        WHEN p.gender_concept_id = 8532 THEN 'Female'
                        ELSE 'Unknown'
                    END as gender,
                    COUNT(DISTINCT co.person_id) as patient_count,
                    COUNT(*) as condition_count
                FROM condition_occurrence co
                JOIN person p ON co.person_id = p.person_id
                WHERE p.gender_concept_id IS NOT NULL
                GROUP BY p.gender_concept_id
                ORDER BY patient_count DESC`,
            description: 'Compare how conditions affect men vs women'
        },

        conditionsFilterable: {
            name: 'Top Conditions',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 30) as condition_name,
                    COUNT(DISTINCT co.person_id) as patient_count
                FROM condition_occurrence co
                JOIN concept c ON co.condition_concept_id = c.concept_id
                JOIN person p ON co.person_id = p.person_id
                WHERE c.concept_name IS NOT NULL
                  AND p.year_of_birth IS NOT NULL
                  AND p.gender_concept_id IS NOT NULL
                GROUP BY c.concept_name
                ORDER BY patient_count DESC
                LIMIT 10`,
            description: 'Most common conditions with options to filter by demographics'
        },

        conditionsByAge: {
            name: 'Conditions by Age Group',
            chartType: 'area',
            sql: `
                SELECT 
                    CASE 
                        WHEN EXTRACT(YEAR FROM co.condition_start_date) - p.year_of_birth < 18 THEN 'Pediatric (0-17)'
                        WHEN EXTRACT(YEAR FROM co.condition_start_date) - p.year_of_birth BETWEEN 18 AND 39 THEN 'Young Adult (18-39)'
                        WHEN EXTRACT(YEAR FROM co.condition_start_date) - p.year_of_birth BETWEEN 40 AND 64 THEN 'Middle Age (40-64)'
                        ELSE 'Senior (65+)'
                    END as age_group,
                    COUNT(DISTINCT co.person_id) as patient_count,
                    ROUND(AVG(EXTRACT(YEAR FROM co.condition_start_date) - p.year_of_birth), 1) as avg_age
                FROM condition_occurrence co
                JOIN person p ON co.person_id = p.person_id
                WHERE p.year_of_birth IS NOT NULL 
                  AND co.condition_start_date IS NOT NULL
                GROUP BY age_group
                ORDER BY avg_age`,
            description: 'See how conditions vary across different age groups'
        },

        chronicVsAcute: {
            name: 'Chronic vs Acute Conditions',
            chartType: 'pie',
            sql: `
                SELECT 
                    CASE 
                        WHEN c.concept_name ILIKE ANY (ARRAY['%diabetes%', '%hypertension%', '%heart failure%', '%copd%', '%chronic%', '%arthritis%']) 
                        THEN 'Chronic Conditions'
                        ELSE 'Acute Conditions'
                    END as condition_type,
                    COUNT(DISTINCT co.person_id) as patient_count
                FROM condition_occurrence co
                JOIN concept c ON co.condition_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY condition_type`,
            description: 'Split between long-term chronic conditions and short-term acute ones'
        }
    },

    medications: {
        topMedications: {
            name: 'Most Prescribed Medications',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 25) as drug_name,
                    COUNT(DISTINCT de.person_id) as patient_count,
                    COUNT(*) as prescription_count,
                    ROUND(AVG(COALESCE(de.days_supply, 30)), 1) as avg_days_supply
                FROM drug_exposure de
                JOIN concept c ON de.drug_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY c.concept_name
                ORDER BY patient_count DESC
                LIMIT 15`,
            description: 'Which medications are prescribed to the most patients'
        },

        medicationsByGender: {
            name: 'Medications by Gender',
            chartType: 'bar',
            sql: `
                SELECT 
                    CASE 
                        WHEN p.gender_concept_id = 8507 THEN 'Male'
                        WHEN p.gender_concept_id = 8532 THEN 'Female'
                        ELSE 'Unknown'
                    END as gender,
                    COUNT(DISTINCT de.person_id) as patient_count,
                    COUNT(*) as prescription_count
                FROM drug_exposure de
                JOIN person p ON de.person_id = p.person_id
                WHERE p.gender_concept_id IS NOT NULL
                GROUP BY p.gender_concept_id
                ORDER BY patient_count DESC`,
            description: 'Compare medication patterns between men and women'
        },

        medicationsFilterable: {
            name: 'Top Medications',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 25) as drug_name,
                    COUNT(DISTINCT de.person_id) as patient_count
                FROM drug_exposure de
                JOIN concept c ON de.drug_concept_id = c.concept_id
                JOIN person p ON de.person_id = p.person_id
                WHERE c.concept_name IS NOT NULL
                  AND p.year_of_birth IS NOT NULL
                  AND p.gender_concept_id IS NOT NULL
                GROUP BY c.concept_name
                ORDER BY patient_count DESC
                LIMIT 10`,
            description: 'Most prescribed medications with demographic filtering options'
        },

        polypharmacy: {
            name: 'Polypharmacy Analysis',
            chartType: 'area',
            sql: `
                SELECT 
                    CASE 
                        WHEN drug_count = 1 THEN '1 medication'
                        WHEN drug_count BETWEEN 2 AND 4 THEN '2-4 medications'
                        WHEN drug_count BETWEEN 5 AND 9 THEN '5-9 medications'
                        ELSE '10+ medications'
                    END as medication_group,
                    COUNT(*) as patient_count,
                    ROUND(AVG(drug_count), 1) as avg_drug_count
                FROM (
                    SELECT 
                        person_id,
                        COUNT(DISTINCT drug_concept_id) as drug_count
                    FROM drug_exposure
                    GROUP BY person_id
                ) medication_counts
                GROUP BY medication_group
                ORDER BY avg_drug_count`,
            description: 'How many medications patients take - from single drugs to complex regimens'
        },

        drugClassDistribution: {
            name: 'Drug Class Distribution',
            chartType: 'pie',
            sql: `
                SELECT 
                    CASE 
                        WHEN LOWER(c.concept_name) LIKE '%antibiotic%' OR LOWER(c.concept_name) LIKE '%penicillin%' THEN 'Antibiotics'
                        WHEN LOWER(c.concept_name) LIKE '%pain%' OR LOWER(c.concept_name) LIKE '%analgesic%' THEN 'Pain Management'
                        WHEN LOWER(c.concept_name) LIKE '%diabetes%' OR LOWER(c.concept_name) LIKE '%insulin%' THEN 'Diabetes Care'
                        WHEN LOWER(c.concept_name) LIKE '%pressure%' OR LOWER(c.concept_name) LIKE '%hypertension%' THEN 'Cardiovascular'
                        WHEN LOWER(c.concept_name) LIKE '%vitamin%' OR LOWER(c.concept_name) LIKE '%supplement%' THEN 'Supplements'
                        ELSE 'Other'
                    END as drug_class,
                    COUNT(DISTINCT de.person_id) as patient_count
                FROM drug_exposure de
                JOIN concept c ON de.drug_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN LOWER(c.concept_name) LIKE '%antibiotic%' OR LOWER(c.concept_name) LIKE '%penicillin%' THEN 'Antibiotics'
                        WHEN LOWER(c.concept_name) LIKE '%pain%' OR LOWER(c.concept_name) LIKE '%analgesic%' THEN 'Pain Management'
                        WHEN LOWER(c.concept_name) LIKE '%diabetes%' OR LOWER(c.concept_name) LIKE '%insulin%' THEN 'Diabetes Care'
                        WHEN LOWER(c.concept_name) LIKE '%pressure%' OR LOWER(c.concept_name) LIKE '%hypertension%' THEN 'Cardiovascular'
                        WHEN LOWER(c.concept_name) LIKE '%vitamin%' OR LOWER(c.concept_name) LIKE '%supplement%' THEN 'Supplements'
                        ELSE 'Other'
                    END
                ORDER BY patient_count DESC`,
            description: 'Groups medications by type - antibiotics, pain meds, vitamins, etc.'
        }
    },

    procedures: {
        diagnosticProcedures: {
            name: 'Common Medical Conditions',
            chartType: 'bar',
            sql: `
                SELECT 
                    SUBSTRING(c.concept_name, 1, 30) as procedure_name,
                    COUNT(DISTINCT co.person_id) as patient_count
                FROM condition_occurrence co
                JOIN concept c ON co.condition_concept_id = c.concept_id
                WHERE c.concept_name IS NOT NULL
                GROUP BY c.concept_name
                ORDER BY patient_count DESC
                LIMIT 10`,
            description: 'The conditions doctors diagnose most frequently'
        },

        therapeuticProcedures: {
            name: 'Therapeutic Interventions',
            chartType: 'pie',
            sql: `
                SELECT 
                    'Condition Treatments' as intervention_type,
                    COUNT(*) as intervention_count
                FROM condition_occurrence
                UNION ALL
                SELECT 
                    'Drug Therapies' as intervention_type,
                    COUNT(*) as intervention_count
                FROM drug_exposure`,
            description: 'Comparison of different treatment approaches used'
        }
    },

    outcomes: {
        healthcareUtilization: {
            name: 'Healthcare Utilization',
            chartType: 'pie',
            sql: `
                SELECT 
                    CASE 
                        WHEN gender_concept_id = 8507 THEN 'Male Patients'
                        WHEN gender_concept_id = 8532 THEN 'Female Patients'
                        ELSE 'Unknown Gender'
                    END as patient_type,
                    COUNT(DISTINCT co.person_id) as utilization_count
                FROM person p
                JOIN condition_occurrence co ON p.person_id = co.person_id
                WHERE p.gender_concept_id IS NOT NULL
                GROUP BY p.gender_concept_id
                ORDER BY utilization_count DESC`,
            description: 'Do men or women use healthcare services more often'
        },

        treatmentOutcomes: {
            name: 'Treatment Outcomes by Age',
            chartType: 'bar',
            sql: `
                SELECT 
                    CASE 
                        WHEN (2025 - p.year_of_birth) BETWEEN 0 AND 17 THEN 'Pediatric'
                        WHEN (2025 - p.year_of_birth) BETWEEN 18 AND 39 THEN 'Young Adult'
                        WHEN (2025 - p.year_of_birth) BETWEEN 40 AND 64 THEN 'Middle Age'
                        ELSE 'Senior'
                    END as age_outcome,
                    COUNT(DISTINCT co.person_id) as treatment_count,
                    COUNT(DISTINCT de.person_id) as medication_count
                FROM person p
                LEFT JOIN condition_occurrence co ON p.person_id = co.person_id
                LEFT JOIN drug_exposure de ON p.person_id = de.person_id
                WHERE p.year_of_birth IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN (2025 - p.year_of_birth) BETWEEN 0 AND 17 THEN 'Pediatric'
                        WHEN (2025 - p.year_of_birth) BETWEEN 18 AND 39 THEN 'Young Adult'
                        WHEN (2025 - p.year_of_birth) BETWEEN 40 AND 64 THEN 'Middle Age'
                        ELSE 'Senior'
                    END
                ORDER BY treatment_count DESC`,
            description: 'How treatment needs differ from kids to seniors'
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