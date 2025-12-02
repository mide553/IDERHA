# eHealth Insights

A healthcare data management platform for hospitals to store, analyze, and share patient data securely.

## What it does

- Store patient data from multiple hospitals in separate databases
- Provide secure login and user management
- Offer data analytics and visualization
- Support healthcare data standards (OMOP CDM)

## Tech Stack

- **Frontend**: React with Vite (Port 3000)
- **Backend**: Spring Boot (Java) (Port 8080)
- **Database**: PostgreSQL
- **Deployment**: Docker Compose

## Quick Setup

### What you need
- [Docker and Docker Compose](https://docs.docker.com/get-started/get-docker/)
- [Git with LFS support](https://git-lfs.github.io/)
- [Node.js](https://nodejs.org/) (for frontend)
- [Maven](https://maven.apache.org/) (for backend)

### Get started

1. **Clone and setup**
```bash
git clone https://github.com/mide553/IDERHA.git
cd IDERHA
# Pull large OMOP Concept SQL files if missing
git lfs pull
```

2. **Create essential .env file (see .env.example)** 
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=Admin
```

2. **Create essential application.properties file (see backend/src/main/resources/application.properties.example )** 
```application.properties
server.port=8080

# Private Database (User-related data)
private.datasource.url=jdbc:postgresql://localhost:5432/private_eHealth_Insights
private.datasource.username=postgres
private.datasource.password=password
private.datasource.driver-class-name=org.postgresql.Driver

# Hospital 1 Database
hospital1.datasource.url=jdbc:postgresql://localhost:5433/hospital1_eHealth_Insights
hospital1.datasource.username=postgres
hospital1.datasource.password=password
hospital1.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=none
```

4. **Start everything**

**Option A: Using the helper script (Recommended)**
- **Windows**:
  ```powershell
  ./start-app.ps1
  ```
- **Linux/Mac**:
  ```bash
  bash start-app.sh
  ```
*(This automatically starts the app, waits for the database setup to finish, and cleans up the setup container.)*

**Option B: Manual (Standard Docker way)**
```bash
# Build and start all services
docker-compose up -d --build

# Watch the setup progress
# Vocab container - OMOP Concepts database
docker logs -f eHealth_Insights_postgres_vocab

# Backend container - runs backend 
docker logs -f eHealth_Insights_backend

# Frontend container - runs react-app
docker logs -f eHealth_Insights_frontend

# Hospital1&2 containers - hospital patient_data databases
docker logs -f eHealth_Insights_postgres_hospital1
docker logs -f eHealth_Insights_postgres_hospital2

# Private container - private database
docker logs -f eHealth_Insights_postgres_private

# Setup container - waits for everything then runs FDW setup
docker logs -f eHealth_Insights_setup
```

5. **Open the app**
- The setup is complete when you see "SETUP COMPLETE" in the logs above.
- Website: http://localhost:3000
- Login with admin/hospital/researcher credentials

## Troubleshooting

**Missing OMOP Concept SQL files?**
```bash
git lfs pull
```

**Database connection issues - Connect to databases directly?** 
```bash
docker exec -it eHealth_Insights_postgres_private psql -U postgres -d private_eHealth_Insights
docker exec -it eHealth_Insights_postgres_hospital1 psql -U postgres -d hospital1_eHealth_Insights
docker exec -it eHealth_Insights_postgres_hospital2 psql -U postgres -d hospital2_eHealth_Insights
```

**Frontend build issues?**
```bash
cd react-app
npm install -g vite
```

## Testing

Run frontend tests:
```bash
cd react-app
npm install vitest jsdom --save-dev
npm test
```

## Project Structure

```
IDERHA/
├── backend/           # Spring Boot API
├── react-app/         # React frontend
├── db_setup/          # Database schemas
├── documentation/     # Documentation
├── patient_data/      # Sample data
├── docker-compose.yml # Database setup
└── .env               # Private settings
```
