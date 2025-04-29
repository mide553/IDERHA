CREATE TABLE public.USERS (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    job VARCHAR(255) NOT NULL
);

TRUNCATE TABLE users CASCADE;

INSERT INTO users (email, password, name, surname, job)
VALUES ('admin@admin.com', 'admin', 'Admin', 'Admin', 'Admin');