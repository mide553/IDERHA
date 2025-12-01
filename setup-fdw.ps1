# Setup Foreign Data Wrapper
# This creates FDW ONLY between hospital databases - private DB stays isolated for security
# Run this script to enable cross-hospital queries

Write-Host "Setting up Foreign Data Wrapper (Hospital1 -> Hospital2)..." -ForegroundColor Green
Write-Host "Note: Private database will remain isolated for security" -ForegroundColor Yellow

$sqlScript = @'
-- Enable the postgres_fdw extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create foreign server for hospital2 database
DROP SERVER IF EXISTS hospital2_server CASCADE;

CREATE SERVER hospital2_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'hospital2', port '5432', dbname 'hospital2_eHealth_Insights');

-- Create user mapping
DROP USER MAPPING IF EXISTS FOR postgres SERVER hospital2_server;

CREATE USER MAPPING FOR postgres
    SERVER hospital2_server
    OPTIONS (user 'postgres', password 'password');

-- Create schema to organize foreign tables
DROP SCHEMA IF EXISTS hospital2_fdw CASCADE;

CREATE SCHEMA hospital2_fdw;

-- Import all tables from hospital2 database
IMPORT FOREIGN SCHEMA public
    FROM SERVER hospital2_server
    INTO hospital2_fdw;

-- Grant access
GRANT USAGE ON SCHEMA hospital2_fdw TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA hospital2_fdw TO postgres;

-- Create unified views (hospital1 local data + hospital2 foreign data)
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

CREATE OR REPLACE VIEW unified_concept AS
SELECT DISTINCT ON (concept_id) * FROM public.concept;

CREATE OR REPLACE VIEW unified_concept_relationship AS
SELECT DISTINCT ON (concept_id_1, concept_id_2, relationship_id) * 
FROM public.concept_relationship;

-- Grant access to views
GRANT SELECT ON unified_person TO postgres;
GRANT SELECT ON unified_condition_occurrence TO postgres;
GRANT SELECT ON unified_drug_exposure TO postgres;
GRANT SELECT ON unified_observation TO postgres;
GRANT SELECT ON unified_visit_occurrence TO postgres;
GRANT SELECT ON unified_procedure_occurrence TO postgres;
GRANT SELECT ON unified_measurement TO postgres;
GRANT SELECT ON unified_concept TO postgres;
GRANT SELECT ON unified_concept_relationship TO postgres;

\echo 'Foreign Data Wrapper setup completed successfully!'
'@

# Execute the FDW setup script in hospital1 database container (NOT private!)
$sqlScript | docker exec -i eHealth_Insights_postgres_hospital1 psql -U postgres -d hospital1_eHealth_Insights

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "FDW Setup Complete!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "FDW Setup Failed!" -ForegroundColor Red
    Write-Host "Make sure all Docker containers are running." -ForegroundColor Yellow
}
