# eHealth Insights

A healthcare data management platform for hospitals to store, analyze, and share patient data securely.

## What it does

- Store patient data from multiple hospitals in separate databases
- Provide secure login and user management
- Offer data analytics and visualization
- Support healthcare data standards (OMOP CDM)

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Spring Boot (Java)
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

3. **Start everything**
```bash
# Start databases
docker-compose up -d

# Wait until databases are populated with patient data
# Check with command:
docker logs eHealth_Insights_postgres_hospital1 --tail 3

# After verifying that databases are populated and ready, run FDW setup:
.\setup-fdw.ps1

# Start backend (in new terminal)
cd backend
# Check if Maven is installed
mvn -v
mvn clean install
mvn spring-boot:run

# Start frontend (in another terminal)
cd react-app
# Check Node.js version
node -v
npm -v
npm install
npm run dev
```

4. **Open the app**
- Frontend: http://localhost:3000
- Login with admin credentials
- In order to use the Analytics page - Wait 5-10 Minutes for databases to be populated with patient data

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
