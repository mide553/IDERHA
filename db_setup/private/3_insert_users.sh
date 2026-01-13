#!/bin/bash
# This script runs after PostgreSQL initialization to insert users dynamically

# Wait a bit for PostgreSQL to be fully ready
sleep 5

# Function to BCrypt hash a password
hash_password() {
    local password=$1
    # Use Python to generate BCrypt hash (compatible with Spring Security BCrypt)
    python3 -c "import bcrypt; print(bcrypt.hashpw('$password'.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8'))"
}

# Build SQL dynamically by checking for user patterns
SQL_VALUES=""
COUNTER=0

# Function to add user if all required fields exist
add_user() {
    local prefix=$1
    local email_var="${prefix}_EMAIL"
    local password_var="${prefix}_PASSWORD"
    local firstname_var="${prefix}_FIRSTNAME"
    local lastname_var="${prefix}_LASTNAME"
    
    local email="${!email_var}"
    local password="${!password_var}"
    local firstname="${!firstname_var}"
    local lastname="${!lastname_var}"
    
    if [ ! -z "$email" ] && [ ! -z "$password" ] && [ ! -z "$firstname" ] && [ ! -z "$lastname" ]; then
        # Hash the password using BCrypt
        local hashed_password=$(hash_password "$password")
        # Determine role and database assignment
        local role="researcher"
        local created_by="${ADMIN_EMAIL}"
        local assigned_db="NULL"
        
        if [ "$prefix" = "ADMIN" ]; then
            role="admin"
            created_by="admin"
        elif [[ "$prefix" == HOSPITAL* ]]; then
            role="hospital"
            assigned_db="'$(echo $prefix | tr '[:upper:]' '[:lower:]')'"
        fi
        
        # Add comma if not first entry
        if [ $COUNTER -gt 0 ]; then
            SQL_VALUES+=", "
        fi
        
        SQL_VALUES+="('$email', '$hashed_password', '$firstname', '$lastname', '$role', '$created_by', $assigned_db)"
        COUNTER=$((COUNTER + 1))
        echo "Added user: $email ($role)"
    fi
}

# Check for all possible user prefixes by looking at environment variables
for var in $(env | grep '_EMAIL=' | cut -d= -f1); do
    prefix=$(echo $var | sed 's/_EMAIL$//')
    add_user "$prefix"
done

# Insert users if any were found
if [ $COUNTER -gt 0 ]; then
    PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} << EOF
INSERT INTO users (email, password, firstname, lastname, role, created_by, assigned_database)
VALUES $SQL_VALUES
ON CONFLICT (email) DO NOTHING;
\echo '$COUNTER users inserted successfully'
EOF
else
    echo "No valid users found in environment variables"
fi