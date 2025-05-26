-- Database schema for eHealth Insights private database

CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL
);

-- Insert initial admin and sample users
INSERT INTO users (email, password, firstname, lastname, role, created_by)
VALUES 
    ('admin@admin.com', 'admin', 'Admin', 'Admin', 'admin', 'admin'),
    ('hospital@ehealth.com', 'hospital', 'Hospital', 'Hospital', 'hospital', 'admin@admin.com'),
    ('johndoe@ehealth.com', 'johndoe', 'John', 'Doe', 'researcher', 'hospital@ehealth.com'),
    ('janedoe@ehealth.com', 'janedoe', 'Jane', 'Doe', 'researcher', 'hospital@ehealth.com');

-- Add index on created_by for better query performance
CREATE INDEX idx_users_created_by ON users(created_by);

-- Add index on role for better query performance  
CREATE INDEX idx_users_role ON users(role);