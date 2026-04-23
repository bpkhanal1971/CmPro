# ConPro — Backend API

REST API for the ConPro Construction Management system.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **Auth:** JWT + bcryptjs
- **File uploads:** Multer

## Quick Start

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and a JWT secret
```

### 3. Create the database

```sql
CREATE DATABASE conpro;
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Seed sample data (optional)

```bash
npm run seed
```

### 6. Start the server

```bash
npm run dev      # development (auto-reload)
npm start        # production
```

Server starts at `http://localhost:5000`.

---

## Folder Structure

```
server/
├── db/
│   ├── migrations/    SQL schema + runner
│   └── seeds/         Sample data seeder
├── src/
│   ├── config/        Database pool
│   ├── middleware/     JWT auth & role guard
│   ├── modules/
│   │   ├── auth/          Register, Login, Free Trial, Me
│   │   ├── projects/      CRUD + search/filter
│   │   ├── tasks/         CRUD + priority/status filter
│   │   ├── schedule/      Activities + Milestones per project
│   │   ├── risks/         Risk register + auto score
│   │   ├── budget/        Expenses + summary per project
│   │   ├── documents/     File upload/download/delete
│   │   └── reports/       Aggregated read-only reports
│   ├── utils/         API response helpers, risk score calc
│   ├── app.js         Express app setup
│   ├── routes.js      Central route index
│   └── server.js      Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path           | Auth | Description        |
|--------|----------------|------|--------------------|
| POST   | `/register`    | No   | Create account     |
| POST   | `/login`       | No   | Get JWT token      |
| POST   | `/free-trial`  | No   | Start free trial   |
| GET    | `/me`          | Yes  | Current user info  |

### Projects — `/api/projects`

| Method | Path     | Auth | Role Required            |
|--------|----------|------|--------------------------|
| GET    | `/`      | Yes  | Any                      |
| GET    | `/:id`   | Yes  | Any                      |
| POST   | `/`      | Yes  | Admin, Project Manager   |
| PUT    | `/:id`   | Yes  | Admin, Project Manager   |
| DELETE | `/:id`   | Yes  | Admin                    |

### Tasks — `/api/tasks`

| Method | Path     | Auth | Description              |
|--------|----------|------|--------------------------|
| GET    | `/`      | Yes  | List (filter by project, status, priority) |
| GET    | `/:id`   | Yes  | Get single task          |
| POST   | `/`      | Yes  | Create task              |
| PUT    | `/:id`   | Yes  | Update task              |
| DELETE | `/:id`   | Yes  | Delete task              |

### Schedule — `/api/schedule`

| Method | Path                           | Auth |
|--------|--------------------------------|------|
| GET    | `/:projectId/activities`       | Yes  |
| POST   | `/:projectId/activities`       | Yes  |
| PUT    | `/activities/:id`              | Yes  |
| DELETE | `/activities/:id`              | Yes  |
| GET    | `/:projectId/milestones`       | Yes  |
| POST   | `/:projectId/milestones`       | Yes  |
| DELETE | `/milestones/:id`              | Yes  |

### Risks — `/api/risks`

| Method | Path     | Auth | Notes                    |
|--------|----------|------|--------------------------|
| GET    | `/`      | Yes  | Filter by project, status |
| POST   | `/`      | Yes  | Auto-calculates risk score |
| PUT    | `/:id`   | Yes  | Re-calculates score      |
| DELETE | `/:id`   | Yes  |                          |

### Budget — `/api/budget`

| Method | Path        | Auth | Notes                    |
|--------|-------------|------|--------------------------|
| GET    | `/`         | Yes  | `?project_id=` required  |
| GET    | `/summary`  | Yes  | `?project_id=` required  |
| POST   | `/`         | Yes  | Create expense           |
| PUT    | `/:id`      | Yes  | Update expense           |
| DELETE | `/:id`      | Yes  | Delete expense           |

### Documents — `/api/documents`

| Method | Path              | Auth | Notes              |
|--------|-------------------|------|--------------------|
| GET    | `/`               | Yes  | Filter by project, category, search |
| POST   | `/`               | Yes  | Multipart upload (`file` field) |
| GET    | `/:id/download`   | Yes  | Download file      |
| DELETE | `/:id`            | Yes  | Delete file + record |

### Reports — `/api/reports`

| Method | Path              | Auth |
|--------|-------------------|------|
| GET    | `/progress`       | Yes  |
| GET    | `/budget`         | Yes  |
| GET    | `/risks`          | Yes  |
| GET    | `/delayed-tasks`  | Yes  |
| GET    | `/safety`         | Yes  |

---

## Authentication Flow

1. Client sends `POST /api/auth/login` with `{ email, password }`.
2. Server validates credentials, returns `{ user, token }`.
3. Client stores the JWT and sends it in the `Authorization: Bearer <token>` header on every subsequent request.
4. The `authenticate` middleware verifies the token and attaches `req.user`.
5. The `authorize(...roles)` middleware checks `req.user.role` for protected routes.
