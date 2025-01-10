-- Disable foreign key constraints temporarily
SET CONSTRAINTS ALL DEFERRED;

-- Truncate all tables in correct order
TRUNCATE TABLE
    drug_exposure,
    condition_occurrence,
    visit_occurrence,
    observation,
    measurement,
    procedure_occurrence,
    device_exposure,
    specimen,
    death,
    note,
    cost,
    note_nlp,
    location,
    care_site,
    provider,
    person,
    observation_period,
    visit_detail,
    concept,
    concept_ancestor,
    concept_relationship,
    concept_synonym,
    vocabulary,
    domain,
    concept_class,
    drug_strength,
    source_to_concept_map,
    cohort_definition,
    cohort
CASCADE;

-- Re-enable foreign key constraints
SET CONSTRAINTS ALL IMMEDIATE;
