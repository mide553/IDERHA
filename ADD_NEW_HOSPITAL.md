# How to Add a New Hospital Database (e.g., Hospital 3)

This guide explains how to add a new hospital node (e.g., `hospital3`) to the IDERHA project. This involves updates to Docker, the Database Setup scripts, the Backend, and the Frontend.

---

## 1. Prepare Data
1.  Create a new folder for the hospital's data:
    ```bash
    mkdir patient_data/hospital3
    ```
2.  Add your SQL data files (`1_persons.sql`, `2_conditions.sql`, etc.) into this folder.
    *   *Note: Ensure these files use the same structure as hospital1/hospital2.*

---

## 2. Update Docker Compose
Edit `docker-compose.yml` to add the new service.

1.  **Copy the `hospital1` service block** and paste it below `hospital2`.
2.  **Rename** it to `hospital3`.
3.  **Update Ports**: Change `"5433:5432"` (or 5434) to a new port, e.g., `"5436:5432"`.
4.  **Update Environment**: Change `POSTGRES_DB` to `hospital3_eHealth_Insights`.
5.  **Update Volumes**:
    *   Change `postgres_hospital1` to `postgres_hospital3`.
    *   Update the `./patient_data/hospital1/...` paths to `./patient_data/hospital3/...`.
6.  **Add Volume**: Scroll to the bottom `volumes:` section and add `postgres_hospital3:`.
7.  **Update Dependencies**:
    *   Add `hospital3` to the `depends_on` list for the `backend` and `setup` services.

---

## 3. Update Database Setup (FDW)
Edit `db_setup/setup-fdw.sh` to include the new hospital in the Foreign Data Wrapper configuration.

1.  **Wait for DB**: Add a wait command at the top:
    ```bash
    wait_for_db "hospital3" "hospital3_eHealth_Insights"
    ```
2.  **Connect to Vocab**: Copy the "Connect Hospital1 to Vocab" block, paste it, and update references to `hospital3`.
3.  **Unified Views**:
    *   In the "Connect Hospital1 to Hospital2" section (Step 3), you need to also connect `hospital3`.
    *   You will need to create a server mapping for `hospital3` inside `hospital1` (and potentially `hospital2` if you want full mesh, but usually `hospital1` acts as the aggregator).
    *   **Crucially**, update the `CREATE OR REPLACE VIEW unified_...` statements to include a third `UNION ALL`:
        ```sql
        UNION ALL
        SELECT 'hospital3' as source_hospital, * FROM hospital3_fdw.person;
        ```

---

## 4. Update Backend (Spring Boot)
1.  **Application Properties**: Edit `backend/src/main/resources/application.properties`.
    *   Add the configuration for the new database:
        ```properties
        # Hospital 3 Database
        hospital3.datasource.url=jdbc:postgresql://hospital3:5432/hospital3_eHealth_Insights
        hospital3.datasource.username=${POSTGRES_USER}
        hospital3.datasource.password=${POSTGRES_PASSWORD}
        hospital3.datasource.driver-class-name=org.postgresql.Driver
        ```
        *(Note: Use the container name `hospital3` as the host if running inside Docker, or `localhost` and the external port `5436` if running locally).*

2.  **Java Config**:
    *   Go to `backend/src/main/java/com/example/demo/config/`.
    *   Copy `Hospital1DataSourceConfig.java` and name it `Hospital3DataSourceConfig.java`.
    *   Open the new file and Find/Replace "Hospital1" with "Hospital3" (and "hospital1" with "hospital3").
    *   Ensure the `@ConfigurationProperties(prefix = "hospital3.datasource")` matches your properties file.

---

## 5. Update Frontend (React)
You need to update the dropdowns and logic in the React app to recognize the new hospital.

Edit the following files in `react-app/src/pages/`:

1.  **`UploadData.jsx`**:
    *   Add `<option value="hospital3">Hospital 3</option>` to the dropdown.
    *   Update the switch case to return the correct label/port.
2.  **`ManageUsers.jsx`**:
    *   Add the option to the hospital selection dropdowns.
3.  **`Api.jsx`**:
    *   Add the option to the database selection dropdown.
4.  **`Analytics.jsx`**:
    *   Add the option to the filter dropdowns.

---

## 6. Apply Changes
1.  **Rebuild and Restart**:
    ```powershell
    docker-compose down -v
    docker-compose up -d --build
    ```
2.  **Verify**:
    *   Check logs: `docker logs eHealth_Insights_setup` to ensure FDW setup worked.
    *   Check Frontend: Go to `http://localhost:3000` and try to select Hospital 3.
