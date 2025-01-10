-- First clear existing data
TRUNCATE TABLE condition_occurrence CASCADE;
TRUNCATE TABLE concept CASCADE;
TRUNCATE TABLE person CASCADE;
TRUNCATE TABLE drug_exposure CASCADE;

-- Insert people with fixed values instead of generate_series
INSERT INTO person (
    person_id, 
    gender_concept_id, 
    year_of_birth, 
    race_concept_id, 
    ethnicity_concept_id
) VALUES 
    (1, 8507, 1960, 8527, 38003564),  -- Male
    (2, 8532, 1965, 8527, 38003564),  -- Female
    (3, 8507, 1970, 8527, 38003564),  -- Male
    (4, 8532, 1975, 8527, 38003564),  -- Female
    (5, 8507, 1980, 8527, 38003564),  -- Male
    (6, 8532, 1985, 8527, 38003564),  -- Female
    (7, 8507, 1990, 8527, 38003564),  -- Male
    (8, 8532, 1995, 8527, 38003564),  -- Female
    (9, 8507, 2000, 8527, 38003564),  -- Male
    (10, 8532, 2005, 8527, 38003564); -- Female

-- Insert concepts
INSERT INTO concept (
    concept_id,
    concept_name,
    domain_id,
    vocabulary_id,
    concept_class_id,
    concept_code,
    valid_start_date,
    valid_end_date
) VALUES 
    (1001, 'Malignant neoplasm of breast', 'Condition', 'SNOMED', 'Clinical Finding', 'C50', '1970-01-01', '2099-12-31'),
    (1002, 'Lung cancer', 'Condition', 'SNOMED', 'Clinical Finding', 'C34', '1970-01-01', '2099-12-31'),
    (1003, 'Carcinoma of prostate', 'Condition', 'SNOMED', 'Clinical Finding', 'C61', '1970-01-01', '2099-12-31'),
    (1004, 'Malignant tumor of colon', 'Condition', 'SNOMED', 'Clinical Finding', 'C18', '1970-01-01', '2099-12-31'),
    (1005, 'Brain neoplasm', 'Condition', 'SNOMED', 'Clinical Finding', 'C71', '1970-01-01', '2099-12-31'),
    (1006, 'Skin tumour', 'Condition', 'SNOMED', 'Clinical Finding', 'C44', '1970-01-01', '2099-12-31'),
    (1007, 'Malignant melanoma', 'Condition', 'SNOMED', 'Clinical Finding', 'C43', '1970-01-01', '2099-12-31'),
    (1008, 'Common cold', 'Condition', 'SNOMED', 'Clinical Finding', 'J00', '1970-01-01', '2099-12-31'),
    (1009, 'Hypertension', 'Condition', 'SNOMED', 'Clinical Finding', 'I10', '1970-01-01', '2099-12-31'),
    (1010, 'Diabetes', 'Condition', 'SNOMED', 'Clinical Finding', 'E11', '1970-01-01', '2099-12-31'),
    (2001, 'Aspirin', 'Drug', 'RxNorm', 'Clinical Drug', 'R01', '1970-01-01', '2099-12-31'),
    (2002, 'Ibuprofen', 'Drug', 'RxNorm', 'Clinical Drug', 'R02', '1970-01-01', '2099-12-31'),
    (2003, 'Paracetamol', 'Drug', 'RxNorm', 'Clinical Drug', 'R03', '1970-01-01', '2099-12-31'),
    (2004, 'Amoxicillin', 'Drug', 'RxNorm', 'Clinical Drug', 'R04', '1970-01-01', '2099-12-31'),
    (2005, 'Omeprazole', 'Drug', 'RxNorm', 'Clinical Drug', 'R05', '1970-01-01', '2099-12-31');

-- Insert condition occurrences
INSERT INTO condition_occurrence (
    condition_occurrence_id,
    person_id,
    condition_concept_id,
    condition_start_date,
    condition_type_concept_id
) VALUES 
    (1, 1, 1001, '2020-01-01', 32020),  -- Person 1: breast cancer
    (2, 1, 1010, '2020-02-01', 32020),  -- Person 1: also has diabetes
    (3, 2, 1002, '2020-03-01', 32020),  -- Person 2: lung cancer
    (4, 3, 1003, '2020-04-01', 32020),  -- Person 3: prostate cancer
    (5, 4, 1004, '2020-05-01', 32020),  -- Person 4: colon cancer
    (6, 5, 1005, '2020-06-01', 32020),  -- Person 5: brain neoplasm
    (7, 6, 1006, '2020-07-01', 32020),  -- Person 6: skin tumour
    (8, 7, 1007, '2020-08-01', 32020),  -- Person 7: melanoma
    (9, 8, 1001, '2020-09-01', 32020),  -- Person 8: breast cancer
    (10, 9, 1002, '2020-10-01', 32020), -- Person 9: lung cancer
    (11, 10, 1003, '2020-11-01', 32020),-- Person 10: prostate cancer
    (12, 1, 1009, '2020-12-01', 32020), -- Person 1: also has hypertension
    (13, 2, 1008, '2021-01-01', 32020), -- Person 2: also has common cold
    (14, 3, 1010, '2021-02-01', 32020); -- Person 3: also has diabetes

-- Insert drug exposures
INSERT INTO drug_exposure (
    drug_exposure_id,
    person_id,
    drug_concept_id,
    drug_exposure_start_date,
    drug_exposure_end_date,
    drug_type_concept_id
) VALUES 
    (1, 1, 2001, '2020-01-01', '2020-01-30', 32020),  -- Person 1 on Aspirin
    (2, 1, 2002, '2020-02-01', '2020-02-14', 32020),  -- Person 1 on Ibuprofen
    (3, 2, 2003, '2020-03-01', '2020-03-07', 32020),  -- Person 2 on Paracetamol
    (4, 3, 2004, '2020-04-01', '2020-04-10', 32020),  -- Person 3 on Amoxicillin
    (5, 4, 2005, '2020-05-01', '2020-05-30', 32020),  -- Person 4 on Omeprazole
    (6, 5, 2001, '2020-06-01', '2020-06-30', 32020),  -- Person 5 on Aspirin
    (7, 6, 2002, '2020-07-01', '2020-07-14', 32020),  -- Person 6 on Ibuprofen
    (8, 7, 2003, '2020-08-01', '2020-08-07', 32020),  -- Person 7 on Paracetamol
    (9, 8, 2004, '2020-09-01', '2020-09-10', 32020),  -- Person 8 on Amoxicillin
    (10, 9, 2005, '2020-10-01', '2020-10-30', 32020); -- Person 9 on Omeprazole
