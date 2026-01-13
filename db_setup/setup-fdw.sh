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

# Automatically discover hospital databases from docker-compose
# This function detects all services that start with "hospital"
discover_hospitals() {
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        echo "Warning: docker-compose.yml not found. Using default hospitals." >&2
        echo "hospital1 hospital2"
        return
    fi
    
    # Extract hospital services from docker-compose.yml
    # Look for services named hospitalX (only top-level service definitions, not depends_on)
    hospitals=$(grep -E '^  hospital[0-9]+:$' docker-compose.yml 2>/dev/null | sed -E 's/^  ([^:]+):$/\1/' | tr '\n' ' ' | sed 's/ $//' || echo "")
    
    if [ -z "$hospitals" ]; then
        echo "Warning: No hospital services found in docker-compose.yml. Using defaults." >&2
        echo "hospital1 hospital2"
        return
    fi
    
    echo "$hospitals"
}

# Discover all hospital databases
HOSPITALS=$(discover_hospitals)
echo "Discovered hospitals: $HOSPITALS"

# Wait for vocab database
wait_for_db "vocab" "vocab_eHealth_Insights"

# Wait for all hospital databases
for hospital in $HOSPITALS; do
    wait_for_db "$hospital" "${hospital}_eHealth_Insights"
done

# Wait for vocab tables to be populated
echo "Waiting for vocab data to be populated..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "vocab" -U "$POSTGRES_USER" -d "vocab_eHealth_Insights" -c "SELECT 1 FROM concept LIMIT 1;" > /dev/null 2>&1; do
    echo "Vocab data not ready yet - sleeping"
    sleep 10
done
echo "Vocab data is ready!"

echo "All databases ready. Starting FDW setup..."

# Function to connect a hospital to vocab
connect_to_vocab() {
    local hospital="$1"
    
    echo "Connecting $hospital to Vocab..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -h "$hospital" -U "$POSTGRES_USER" -d "${hospital}_eHealth_Insights" <<EOF
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
}

# Connect all hospitals to vocab
for hospital in $HOSPITALS; do
    connect_to_vocab "$hospital"
done

# Create unified views on the first hospital (primary hospital for unified queries)
PRIMARY_HOSPITAL=$(echo $HOSPITALS | awk '{print $1}')
echo "Creating unified views on $PRIMARY_HOSPITAL..."

# Build the FDW connections and unified views dynamically
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$PRIMARY_HOSPITAL" -U "$POSTGRES_USER" -d "${PRIMARY_HOSPITAL}_eHealth_Insights" <<EOF
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Drop existing FDW schemas for other hospitals
DO \$\$
DECLARE
    schema_rec RECORD;
BEGIN
    FOR schema_rec IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'hospital%_fdw' AND schema_name != '${PRIMARY_HOSPITAL}_fdw'
    LOOP
        EXECUTE 'DROP SCHEMA IF EXISTS ' || schema_rec.schema_name || ' CASCADE';
    END LOOP;
END \$\$;

-- Drop existing servers for other hospitals
DO \$\$
DECLARE
    server_rec RECORD;
BEGIN
    FOR server_rec IN 
        SELECT srvname 
        FROM pg_foreign_server 
        WHERE srvname LIKE 'hospital%_server' AND srvname != '${PRIMARY_HOSPITAL}_server'
    LOOP
        EXECUTE 'DROP SERVER IF EXISTS ' || server_rec.srvname || ' CASCADE';
    END LOOP;
END \$\$;
EOF

# Set up FDW connections to all other hospitals
for hospital in $HOSPITALS; do
    if [ "$hospital" != "$PRIMARY_HOSPITAL" ]; then
        echo "Connecting $PRIMARY_HOSPITAL to $hospital..."
        
        PGPASSWORD=$POSTGRES_PASSWORD psql -h "$PRIMARY_HOSPITAL" -U "$POSTGRES_USER" -d "${PRIMARY_HOSPITAL}_eHealth_Insights" <<EOF
DROP SERVER IF EXISTS ${hospital}_server CASCADE;
CREATE SERVER ${hospital}_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host '$hospital', port '5432', dbname '${hospital}_eHealth_Insights');

DROP USER MAPPING IF EXISTS FOR postgres SERVER ${hospital}_server;
CREATE USER MAPPING FOR postgres
    SERVER ${hospital}_server
    OPTIONS (user '$POSTGRES_USER', password '$POSTGRES_PASSWORD');

DROP SCHEMA IF EXISTS ${hospital}_fdw CASCADE;
CREATE SCHEMA ${hospital}_fdw;

IMPORT FOREIGN SCHEMA public
    FROM SERVER ${hospital}_server
    INTO ${hospital}_fdw;

GRANT USAGE ON SCHEMA ${hospital}_fdw TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA ${hospital}_fdw TO postgres;
EOF
    fi
done

# Create unified views that union data from all hospitals
echo "Creating unified views..."

# Build UNION ALL statements for each table dynamically
build_union_query() {
    local table_name="$1"
    local first=true
    
    for hospital in $HOSPITALS; do
        if [ "$first" = true ]; then
            echo "SELECT '$hospital' as source_hospital, * FROM public.$table_name"
            first=false
        else
            echo "UNION ALL"
            echo "SELECT '$hospital' as source_hospital, * FROM ${hospital}_fdw.$table_name"
        fi
    done
}

PGPASSWORD=$POSTGRES_PASSWORD psql -h "$PRIMARY_HOSPITAL" -U "$POSTGRES_USER" -d "${PRIMARY_HOSPITAL}_eHealth_Insights" <<EOF
-- Create unified views for clinical tables
CREATE OR REPLACE VIEW unified_person AS
$(build_union_query "person");

CREATE OR REPLACE VIEW unified_condition_occurrence AS
$(build_union_query "condition_occurrence");

CREATE OR REPLACE VIEW unified_drug_exposure AS
$(build_union_query "drug_exposure");

CREATE OR REPLACE VIEW unified_observation AS
$(build_union_query "observation");

CREATE OR REPLACE VIEW unified_visit_occurrence AS
$(build_union_query "visit_occurrence");

CREATE OR REPLACE VIEW unified_procedure_occurrence AS
$(build_union_query "procedure_occurrence");

CREATE OR REPLACE VIEW unified_measurement AS
$(build_union_query "measurement");

-- Unified vocab views (no need for union, same across all hospitals)
CREATE OR REPLACE VIEW unified_concept AS SELECT * FROM public.concept;
CREATE OR REPLACE VIEW unified_concept_relationship AS SELECT * FROM public.concept_relationship;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
EOF

echo "=================================================="
echo "SETUP COMPLETE!"
echo "Configured FDW for hospitals: $HOSPITALS"
echo "Primary hospital (unified views): $PRIMARY_HOSPITAL"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8080"
echo "=================================================="
