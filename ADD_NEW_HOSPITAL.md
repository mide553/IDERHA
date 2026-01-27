# How to Add a New Hospital Database

## Quick Start - 3 Simple Steps

Adding a new hospital requires editing 2 configuration files and creating a data folder. The FDW (Foreign Data Wrapper) setup automatically detects and configures the new hospital.

---

## Step-by-Step Guide

### Step 1: Edit `docker-compose.yml`

Copy the `hospital2` service and modify for `hospital3`:

```yaml
  hospital3:
    image: postgres:15
    container_name: eHealth_Insights_postgres_hospital3
    restart: always
    mem_limit: 512m
    command: postgres -c shared_buffers=128MB
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: hospital3_eHealth_Insights
    ports:
      - "5436:5432"  # New port!
    volumes:
      - postgres_hospital3:/var/lib/postgresql/data
      - ./db_setup/clinical/:/docker-entrypoint-initdb.d/
      - ./patient_data/hospital3/1_persons.sql:/docker-entrypoint-initdb.d/16_persons.sql
      - ./patient_data/hospital3/2_conditions.sql:/docker-entrypoint-initdb.d/17_conditions.sql
      - ./patient_data/hospital3/3_drugs.sql:/docker-entrypoint-initdb.d/18_drugs.sql
      - ./patient_data/hospital3/4_visits.sql:/docker-entrypoint-initdb.d/19_visits.sql
      - ./patient_data/hospital3/5_observations.sql:/docker-entrypoint-initdb.d/20_observations.sql
    depends_on:
      - vocab
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Also add the volume at the bottom:**
```yaml
volumes:
  postgres_vocab:
  postgres_private:
  postgres_hospital1:
  postgres_hospital2:
  postgres_hospital3:  # Add this line
```

**IMPORTANT: Update backend and setup dependencies:**

Add hospital3 to backend dependencies:
```yaml
  backend:
    depends_on:
      hospital3:
        condition: service_healthy
```

Add hospital3 to setup dependencies:
```yaml
  setup:
    depends_on:
      hospital3:
        condition: service_healthy
```

---

### Step 2: Edit `application.properties`

**File:** `backend/src/main/resources/application.properties`

Add these lines:

```properties
# Hospital 3 Database
hospital3.datasource.url=${HOSPITAL3_DB_URL:jdbc:postgresql://hospital3:5432/hospital3_eHealth_Insights}
hospital3.datasource.username=${POSTGRES_USER:postgres}
hospital3.datasource.password=${POSTGRES_PASSWORD:password}
hospital3.datasource.driver-class-name=org.postgresql.Driver
```

**Note:** Use service name `hospital3` and internal port `5432` for Docker networking.

---

### Step 3: Create Patient Data Folder

Create the folder and add your patient data SQL files:

```bash
mkdir -p patient_data/hospital3

# Add your SQL files:
# - patient_data/hospital3/1_persons.sql
# - patient_data/hospital3/2_conditions.sql
# - patient_data/hospital3/3_drugs.sql
# - patient_data/hospital3/4_visits.sql
# - patient_data/hospital3/5_observations.sql
```

---

### Step 4: Restart the Application

```bash
# On Windows
.\start-app.ps1

# On Linux/Mac
./start-app.sh
```

**Done!**

---

## What Happens Automatically

The FDW setup script automatically:

1. Detects hospital3 from docker-compose.yml
2. Connects hospital3 to vocab database  
3. Creates FDW links between all hospitals
4. Updates unified views to include hospital3


---

## Quick Reference

**Files to Edit:**
- `docker-compose.yml` - Add hospital3 service + volume
- `application.properties` - Add hospital3.datasource config
- Create `patient_data/hospital3/` folder with SQL files

**Port Convention:**
- hospital1 → 5433
- hospital2 → 5434  
- (vocab    → 5435)
- hospital3 → 5436
- hospitalN → 5432 + N + 1

---

## Verify Setup

Check the logs:

```bash
docker logs eHealth_Insights_setup
```

You should see:
```
Discovered hospitals: hospital1 hospital2 hospital3
SETUP COMPLETE!
```

(Optional) Test a unified query:
```sql
SELECT source_hospital, COUNT(*) 
FROM unified_person 
GROUP BY source_hospital;
```

---

## Troubleshooting

**Hospital not appearing in backend?**
- Check application.properties has hospital3 config
- Restart backend: `docker-compose restart backend`

**FDW not working?**
- Check setup logs: `docker logs eHealth_Insights_setup`
- Verify service name follows pattern: `hospitalX`
- Database name must be: `hospitalX_eHealth_Insights`

---

## Adding Multiple Hospitals

You can add multiple hospitals at once - just repeat the steps for hospital3, hospital4, hospital5, etc. The FDW script will automatically detect and configure all of them!