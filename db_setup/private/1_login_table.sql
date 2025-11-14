-- Database schema for eHealth Insights private database
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    assigned_database VARCHAR(255) NULL
);

-- Add index on created_by for better query performance
CREATE INDEX idx_users_created_by ON users(created_by);

-- Add index on role for better query performance  
CREATE INDEX idx_users_role ON users(role);