
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL
  );

INSERT INTO users (email, password, firstname, lastname, role)
VALUES 
    ('admin@admin.com', 'admin', 'Admin', 'Admin', 'admin'),
    ('johndoe@ehealth.com', 'johndoe', 'John', 'Doe', 'researcher'),
    ('janedoe@ehealth.com', 'janedoe', 'Jane', 'Doe', 'researcher');