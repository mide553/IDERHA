#!/bin/bash
set -e

echo "Loading CONCEPT.csv..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    COPY public.concept FROM '/docker-entrypoint-initdb.d/data/CONCEPT.csv' WITH (FORMAT csv, HEADER, DELIMITER E'\t', QUOTE '"', NULL 'NULL');
EOSQL
echo "CONCEPT.csv loaded successfully."
