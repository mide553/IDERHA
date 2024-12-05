Main branch
Purpose: This is the production-ready branch. Stable and deployable version of the code.
Usage: Only merge fully tested and verified changes into the main branch.

Development branch
Purpose: The development branch serves as the integration branch for ongoing work.
Usage: Changes are commited regularly to this branch. It will contain all the latest changes from the team, including backend, frontend, and database work. This branch is used to test new features before merging into main.

Frontend branch
Purpose: This branch is specifically for the front-end work (React.js, UI).
Usage: Any changes related to the UI, will go directly into this branch. When it's stable, it can be merged into development.

Backend branch
Purpose: This branch holds all backend-related code (Java, Spring Boot, APIs).
Usage: Backend is commited to this branch. Once it's tested, it can be merged into development.

Database branch
Purpose: This branch is for database-related changes (schema updates, SQL scripts).
Usage: Any database-related tasks (e.g., creating tables or updating schemas) are handled here. When these tasks are completed and tested, they can be merged into development.
