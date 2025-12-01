# Setup Foreign Data Wrapper
# 1. Connects Hospital DBs to Vocab DB (for concepts)
# 2. Connects Hospital1 to Hospital2 (for unified patient data views)

Write-Host "Setting up Foreign Data Wrapper..." -ForegroundColor Green

# SQL to connect a hospital DB to Vocab DB
$vocabFdwScript = @'
-- Enable extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create server for vocab database
DROP SERVER IF EXISTS vocab_server CASCADE;
CREATE SERVER vocab_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'vocab', port '5432', dbname 'vocab_eHealth_Insights');

-- User mapping
DROP USER MAPPING IF EXISTS FOR postgres SERVER vocab_server;
CREATE USER MAPPING FOR postgres
    SERVER vocab_server
    OPTIONS (user 'postgres', password 'password');

-- Schema
DROP SCHEMA IF EXISTS vocab_fdw CASCADE;
CREATE SCHEMA vocab_fdw;

-- Import tables
IMPORT FOREIGN SCHEMA public
    FROM SERVER vocab_server
    INTO vocab_fdw;

-- Create local views for vocab tables so they appear as if they are local
CREATE OR REPLACE VIEW public.concept AS SELECT * FROM vocab_fdw.concept;
CREATE OR REPLACE VIEW public.vocabulary AS SELECT * FROM vocab_fdw.vocabulary;
CREATE OR REPLACE VIEW public.domain AS SELECT * FROM vocab_fdw.domain;
CREATE OR REPLACE VIEW public.concept_class AS SELECT * FROM vocab_fdw.concept_class;
CREATE OR REPLACE VIEW public.concept_relationship AS SELECT * FROM vocab_fdw.concept_relationship;
CREATE OR REPLACE VIEW public.relationship AS SELECT * FROM vocab_fdw.relationship;
CREATE OR REPLACE VIEW public.concept_synonym AS SELECT * FROM vocab_fdw.concept_synonym;
CREATE OR REPLACE VIEW public.concept_ancestor AS SELECT * FROM vocab_fdw.concept_ancestor;
CREATE OR REPLACE VIEW public.source_to_concept_map AS SELECT * FROM vocab_fdw.source_to_concept_map;
CREATE OR REPLACE VIEW public.drug_strength AS SELECT * FROM vocab_fdw.drug_strength;

GRANT USAGE ON SCHEMA vocab_fdw TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA vocab_fdw TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
'@

# Run on Hospital 1
Write-Host "Connecting Hospital1 to Vocab..."
$vocabFdwScript | docker exec -i eHealth_Insights_postgres_hospital1 psql -U postgres -d hospital1_eHealth_Insights
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to connect Hospital1 to Vocab. Ensure 'vocab' container is fully initialized." }

# Run on Hospital 2
Write-Host "Connecting Hospital2 to Vocab..."
$vocabFdwScript | docker exec -i eHealth_Insights_postgres_hospital2 psql -U postgres -d hospital2_eHealth_Insights
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to connect Hospital2 to Vocab." }


# SQL to connect Hospital1 to Hospital2 (Unified Views)
$hospitalFdwScript = @'
-- Enable extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create server for hospital2
DROP SERVER IF EXISTS hospital2_server CASCADE;
CREATE SERVER hospital2_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'hospital2', port '5432', dbname 'hospital2_eHealth_Insights');

-- User mapping
DROP USER MAPPING IF EXISTS FOR postgres SERVER hospital2_server;
CREATE USER MAPPING FOR postgres
    SERVER hospital2_server
    OPTIONS (user 'postgres', password 'password');

-- Schema
DROP SCHEMA IF EXISTS hospital2_fdw CASCADE;
CREATE SCHEMA hospital2_fdw;

-- Import tables
IMPORT FOREIGN SCHEMA public
    FROM SERVER hospital2_server
    INTO hospital2_fdw;

GRANT USAGE ON SCHEMA hospital2_fdw TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA hospital2_fdw TO postgres;

-- Unified Views
CREATE OR REPLACE VIEW unified_person AS
SELECT 'hospital1' as source_hospital, * FROM public.person
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.person;

CREATE OR REPLACE VIEW unified_condition_occurrence AS
SELECT 'hospital1' as source_hospital, * FROM public.condition_occurrence
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.condition_occurrence;

CREATE OR REPLACE VIEW unified_drug_exposure AS
SELECT 'hospital1' as source_hospital, * FROM public.drug_exposure
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.drug_exposure;

CREATE OR REPLACE VIEW unified_observation AS
SELECT 'hospital1' as source_hospital, * FROM public.observation
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.observation;

CREATE OR REPLACE VIEW unified_visit_occurrence AS
SELECT 'hospital1' as source_hospital, * FROM public.visit_occurrence
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.visit_occurrence;

CREATE OR REPLACE VIEW unified_procedure_occurrence AS
SELECT 'hospital1' as source_hospital, * FROM public.procedure_occurrence
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.procedure_occurrence;

CREATE OR REPLACE VIEW unified_measurement AS
SELECT 'hospital1' as source_hospital, * FROM public.measurement
UNION ALL
SELECT 'hospital2' as source_hospital, * FROM hospital2_fdw.measurement;

-- Unified Concept Views (just pass through the local view which points to vocab)
CREATE OR REPLACE VIEW unified_concept AS SELECT * FROM public.concept;
CREATE OR REPLACE VIEW unified_concept_relationship AS SELECT * FROM public.concept_relationship;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
'@

Write-Host "Connecting Hospital1 to Hospital2..."
$hospitalFdwScript | docker exec -i eHealth_Insights_postgres_hospital1 psql -U postgres -d hospital1_eHealth_Insights

Write-Host "FDW Setup Complete!"
