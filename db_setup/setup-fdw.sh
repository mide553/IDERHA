#!/bin/bash
set -e

echo "Waiting for databases to be ready..."

# Function to wait for a database
wait_for_db() {
    local host="$1"
    local dbname="$2"
    
    echo "Waiting for $dbname on $host..."
    until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$POSTGRES_USER" -d "$dbname" -c '\q'; do
        echo "$host is unavailable - sleeping"
        sleep 5
    done
    echo "$host is up!"
}

# Wait for databases to be ready
wait_for_db "vocab" "vocab_eHealth_Insights"
wait_for_db "hospital1" "hospital1_eHealth_Insights"
wait_for_db "hospital2" "hospital2_eHealth_Insights"

# Wait for vocab tables to be populated (check if concept table has data)
echo "Waiting for vocab data to be populated..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "vocab" -U "$POSTGRES_USER" -d "vocab_eHealth_Insights" -c "SELECT 1 FROM concept LIMIT 1;" > /dev/null 2>&1; do
    echo "Vocab data not ready yet - sleeping"
    sleep 10
done
echo "Vocab data is ready!"

echo "All databases ready. Starting FDW setup..."

# 1. Connect Hospital1 to Vocab
echo "Connecting Hospital1 to Vocab..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h hospital1 -U $POSTGRES_USER -d hospital1_eHealth_Insights <<EOF
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

DROP SERVER IF EXISTS vocab_server CASCADE;
CREATE SERVER vocab_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'vocab', port '5432', dbname 'vocab_eHealth_Insights');

DROP USER MAPPING IF EXISTS FOR postgres SERVER vocab_server;
CREATE USER MAPPING FOR postgres
    SERVER vocab_server
    OPTIONS (user '$POSTGRES_USER', password '$POSTGRES_PASSWORD');

DROP SCHEMA IF EXISTS vocab_fdw CASCADE;
CREATE SCHEMA vocab_fdw;

IMPORT FOREIGN SCHEMA public
    FROM SERVER vocab_server
    INTO vocab_fdw;

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
EOF

# 2. Connect Hospital2 to Vocab
echo "Connecting Hospital2 to Vocab..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h hospital2 -U $POSTGRES_USER -d hospital2_eHealth_Insights <<EOF
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

DROP SERVER IF EXISTS vocab_server CASCADE;
CREATE SERVER vocab_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'vocab', port '5432', dbname 'vocab_eHealth_Insights');

DROP USER MAPPING IF EXISTS FOR postgres SERVER vocab_server;
CREATE USER MAPPING FOR postgres
    SERVER vocab_server
    OPTIONS (user '$POSTGRES_USER', password '$POSTGRES_PASSWORD');

DROP SCHEMA IF EXISTS vocab_fdw CASCADE;
CREATE SCHEMA vocab_fdw;

IMPORT FOREIGN SCHEMA public
    FROM SERVER vocab_server
    INTO vocab_fdw;

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
EOF

# 3. Connect Hospital1 to Hospital2 (Unified Views)
echo "Connecting Hospital1 to Hospital2..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h hospital1 -U $POSTGRES_USER -d hospital1_eHealth_Insights <<EOF
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

DROP SERVER IF EXISTS hospital2_server CASCADE;
CREATE SERVER hospital2_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'hospital2', port '5432', dbname 'hospital2_eHealth_Insights');

DROP USER MAPPING IF EXISTS FOR postgres SERVER hospital2_server;
CREATE USER MAPPING FOR postgres
    SERVER hospital2_server
    OPTIONS (user '$POSTGRES_USER', password '$POSTGRES_PASSWORD');

DROP SCHEMA IF EXISTS hospital2_fdw CASCADE;
CREATE SCHEMA hospital2_fdw;

IMPORT FOREIGN SCHEMA public
    FROM SERVER hospital2_server
    INTO hospital2_fdw;

GRANT USAGE ON SCHEMA hospital2_fdw TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA hospital2_fdw TO postgres;

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

CREATE OR REPLACE VIEW unified_concept AS SELECT * FROM public.concept;
CREATE OR REPLACE VIEW unified_concept_relationship AS SELECT * FROM public.concept_relationship;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
EOF

echo "=================================================="
echo "SETUP COMPLETE!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8080"
echo "=================================================="
