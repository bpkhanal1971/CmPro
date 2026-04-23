-- ============================================================
--  ConPro — Full Database Schema
--  PostgreSQL migration for all core modules
-- ============================================================

-- ── Extensions ──
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM types ──
CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'site_engineer', 'contractor', 'client');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
CREATE TYPE risk_probability AS ENUM ('rare', 'unlikely', 'possible', 'likely', 'certain');
CREATE TYPE risk_impact AS ENUM ('negligible', 'minor', 'moderate', 'major', 'catastrophic');
CREATE TYPE risk_status AS ENUM ('open', 'mitigated', 'closed');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ============================================================
--  1. USERS
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    role            user_role       NOT NULL DEFAULT 'client',
    company         VARCHAR(160),
    phone           VARCHAR(30),
    is_trial        BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  2. PROJECTS
-- ============================================================
CREATE TABLE projects (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200)    NOT NULL,
    client          VARCHAR(200),
    location        VARCHAR(250),
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    status          project_status  NOT NULL DEFAULT 'planning',
    progress        SMALLINT        NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    budget          NUMERIC(15,2)   DEFAULT 0,
    created_by      INT             REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);

-- Junction: project members
CREATE TABLE project_members (
    project_id  INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(60),
    PRIMARY KEY (project_id, user_id)
);

-- ============================================================
--  3. TASKS
-- ============================================================
CREATE TABLE tasks (
    id              SERIAL PRIMARY KEY,
    project_id      INT             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(250)    NOT NULL,
    description     TEXT,
    assigned_to     INT             REFERENCES users(id) ON DELETE SET NULL,
    priority        task_priority   NOT NULL DEFAULT 'medium',
    status          task_status     NOT NULL DEFAULT 'pending',
    deadline        DATE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status  ON tasks(status);

-- ============================================================
--  4. SCHEDULE / ACTIVITIES & MILESTONES
-- ============================================================
CREATE TABLE activities (
    id              SERIAL PRIMARY KEY,
    project_id      INT             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(250)    NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    assigned_to     INT             REFERENCES users(id) ON DELETE SET NULL,
    status          task_status     NOT NULL DEFAULT 'pending',
    dependency_id   INT             REFERENCES activities(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE milestones (
    id              SERIAL PRIMARY KEY,
    project_id      INT             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(200)    NOT NULL,
    due_date        DATE            NOT NULL,
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  5. RISK MANAGEMENT
-- ============================================================
CREATE TABLE risks (
    id              SERIAL PRIMARY KEY,
    project_id      INT             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(250)    NOT NULL,
    description     TEXT,
    probability     risk_probability NOT NULL DEFAULT 'possible',
    impact          risk_impact      NOT NULL DEFAULT 'moderate',
    risk_score      SMALLINT        NOT NULL DEFAULT 0,
    mitigation_plan TEXT,
    owner_id        INT             REFERENCES users(id) ON DELETE SET NULL,
    status          risk_status     NOT NULL DEFAULT 'open',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risks_project ON risks(project_id);

-- ============================================================
--  6. BUDGET / EXPENSES
-- ============================================================
CREATE TABLE expenses (
    id              SERIAL PRIMARY KEY,
    project_id      INT             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category        VARCHAR(120)    NOT NULL,
    planned_cost    NUMERIC(15,2)   NOT NULL DEFAULT 0,
    actual_cost     NUMERIC(15,2)   NOT NULL DEFAULT 0,
    description     TEXT,
    date            DATE            NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_project ON expenses(project_id);

-- ============================================================
--  7. DOCUMENTS
-- ============================================================
CREATE TABLE documents (
    id              SERIAL PRIMARY KEY,
    project_id      INT             REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(250)    NOT NULL,
    category        VARCHAR(80)     NOT NULL DEFAULT 'General',
    file_path       TEXT            NOT NULL,
    file_type       VARCHAR(20),
    file_size       INT,
    uploaded_by     INT             REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  8. SAFETY INCIDENTS
-- ============================================================
CREATE TABLE safety_incidents (
    id              SERIAL PRIMARY KEY,
    project_id      INT             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(250)    NOT NULL,
    description     TEXT,
    incident_date   DATE            NOT NULL DEFAULT CURRENT_DATE,
    severity        incident_severity NOT NULL DEFAULT 'medium',
    type            VARCHAR(80),
    action_taken    TEXT,
    reported_by     INT             REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_tasks_updated    BEFORE UPDATE ON tasks    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_risks_updated    BEFORE UPDATE ON risks    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
