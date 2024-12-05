-- SQL queries - Part I

-- select all columns from the table "person"
SELECT * FROM person;

-- count all rows of the select result of person_id from person
SELECT COUNT(person_id) FROM person;

-- count all rows of select result of concept_id from concept
SELECT COUNT(concept_id) FROM concept;


-- Sample query - Part II

-- select persons who have been exposed to drugs
SELECT person_id, drug_concept_id FROM drug_exposure
    ORDER BY person_id ASC;

-- add concept names from table concept
SELECT person_id, drug_concept_id, concept_name
    FROM drug_exposure
    JOIN concept on concept_id = drug_concept_id
    ORDER BY person_id ASC;

-- Sample query - Part III

-- count amount of links between persons and drugs they have been exposed to (multiple drugs per person possible)
SELECT COUNT(person_id) FROM drug_exposure;

-- use distinct to get unique persons who have been exposed to certain drugs
SELECT COUNT(DISTINCT person_id) FROM drug_exposure;

-- use distinct to get unique drugs of records from all persons
SELECT COUNT(DISTINCT drug_concept_id) FROM drug_exposure;

-- Sample query - Part IV

-- Receive percentage of persons that have been exposed to any drug
SELECT
    COUNT(DISTINCT person_id) AS somepersons,
    (SELECT COUNT(person_id) FROM person) AS fullperson,
    CASE 
        WHEN (SELECT COUNT(person_id) FROM person) = 0 THEN '0 %'  -- Avoid division by zero
        ELSE ROUND((COUNT(DISTINCT person_id) * 100.0 / (SELECT COUNT(person_id) FROM person)), 3) || ' %'
    END AS percentage
FROM
    drug_exposure as personcount;


-- Sample query - Part V

-- count all unique persons who have been exposed to a certain drug
SELECT COUNT(DISTINCT person_id)
    FROM drug_exposure
    WHERE drug_concept_id = 1367500;

-- Sample query - Part VI

-- add concept names from table concept
SELECT COUNT(DISTINCT person_id), concept_name
    FROM drug_exposure
    JOIN concept ON concept_id = drug_concept_id
    WHERE drug_concept_id = 1367500
    GROUP BY concept_name;

-- Sample query - Part VII

-- show all infos about one specific person incl. conditions and condition names (which are in table concept)
SELECT * FROM condition_era AS ce
    JOIN person AS p ON p.person_id = ce.person_id
    JOIN concept ON concept_id = condition_concept_id
    WHERE p.person_id = 9724083;

-- Sample query for visualization

-- show top 10 most common conditions among patients
SELECT
    condition_concept_id, concept_name,
    COUNT(*) AS condition_count
FROM condition_occurrence
    JOIN concept ON concept_id = condition_concept_id
GROUP BY condition_concept_id, concept_name
ORDER BY condition_count DESC
LIMIT 10;

-- Sample query for visualization

-- show top 10 most common conditions over time
WITH overall_top_conditions AS (
    SELECT
        condition_concept_id,
        concept_name,
        COUNT(*) AS total_count
    FROM condition_occurrence
    JOIN concept ON concept.concept_id = condition_occurrence.condition_concept_id
    GROUP BY condition_concept_id, concept_name
    ORDER BY total_count DESC
    LIMIT 10
)
SELECT
    DATE_PART('year', condition_start_date) AS year,
    oc.condition_concept_id,
    c.concept_name,
    COUNT(*) AS condition_count
FROM condition_occurrence oc
JOIN concept c ON c.concept_id = oc.condition_concept_id
JOIN overall_top_conditions otc ON otc.condition_concept_id = oc.condition_concept_id
GROUP BY year, oc.condition_concept_id, c.concept_name
ORDER BY year, oc.condition_concept_id;

-- Number of Patients Diagnosed with Different Types of Neoplasms
WITH diagnosed_condition AS (
    SELECT
        concept_id AS condition_concept_id,
        concept_name
    FROM concept
    WHERE concept_name LIKE '%neoplasm%'
)
SELECT
    c.concept_name,
    COUNT(DISTINCT co.person_id) AS conditioned_patients,
    (SELECT COUNT(DISTINCT person_id) FROM person) AS total_patients
FROM condition_occurrence co
JOIN diagnosed_condition c ON co.condition_concept_id = c.condition_concept_id
GROUP BY c.concept_name
ORDER BY c.concept_name;
