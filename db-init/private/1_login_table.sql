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

-- Insert initial admin and sample users
INSERT INTO users (email, password, firstname, lastname, role, created_by, assigned_database)
VALUES 
    ('admin@admin.com', 'admin', 'Admin', 'Admin', 'admin', 'admin', NULL),
    ('hospital@ehealth.com', 'hospital', 'Hospital', 'Hospital', 'hospital', 'admin@admin.com', 'hospital1'),
    ('hospital2@ehealth.com', 'hospital2', 'Hospital2', 'Hospital2', 'hospital', 'admin@admin.com', 'hospital2'),
    ('johndoe@ehealth.com', 'johndoe', 'John', 'Doe', 'researcher', 'hospital@ehealth.com', NULL),
    ('janedoe@ehealth.com', 'janedoe', 'Jane', 'Doe', 'researcher', 'hospital@ehealth.com', NULL);

-- Add index on created_by for better query performance
CREATE INDEX idx_users_created_by ON users(created_by);

-- Add index on role for better query performance  
CREATE INDEX idx_users_role ON users(role);