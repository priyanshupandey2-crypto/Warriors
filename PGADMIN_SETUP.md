# pgAdmin Setup Instructions

## Step 1: Create Database in pgAdmin

1. Open pgAdmin
2. Right-click on **Databases** in left sidebar
3. Click **Create → Database**
4. Enter name: `warriors_db`
5. Click **Save**

## Step 2: Run SQL Script

### Option A: Run Full Script at Once

1. Click on `warriors_db` database (left sidebar)
2. Click **Tools → Query Tool** (or press Alt+Shift+Q)
3. Copy and paste the entire SQL script below into the query editor
4. Click **Execute** (or press F5)

### Option B: Run Commands One by One

Follow the same steps but run each CREATE TABLE command separately.

---

## Complete SQL Script for pgAdmin

Copy everything below and paste into pgAdmin Query Tool:

```sql
-- ============================================================================
-- Warriors Backend - Curriculum Database Setup
-- ============================================================================
-- Run this script in pgAdmin to create all tables for Firecrawl integration

-- ============================================================================
-- TABLE 1: curriculum_sources
-- Stores raw extracted content from URLs
-- ============================================================================

CREATE TABLE IF NOT EXISTS curriculum_sources (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2048) NOT NULL UNIQUE,
    source_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    raw_markdown TEXT NOT NULL,
    headings JSON NOT NULL DEFAULT '[]',
    source_metadata JSON NOT NULL DEFAULT '{}',
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_curriculum_sources_source_type ON curriculum_sources(source_type);
CREATE INDEX idx_curriculum_sources_fetched_at ON curriculum_sources(fetched_at);

-- ============================================================================
-- TABLE 2: curriculum_chunks
-- Stores semantic chunks with concepts
-- ============================================================================

CREATE TABLE IF NOT EXISTS curriculum_chunks (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES curriculum_sources(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    heading_path VARCHAR(1000),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    concepts JSON NOT NULL DEFAULT '[]',
    chunk_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_id, chunk_index)
);

CREATE INDEX idx_curriculum_chunks_heading_path ON curriculum_chunks(heading_path);
CREATE INDEX idx_curriculum_chunks_token_count ON curriculum_chunks(token_count);

-- ============================================================================
-- TABLE 3: curriculum_registry
-- Cached curriculum templates with TTL
-- ============================================================================

CREATE TABLE IF NOT EXISTS curriculum_registry (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(500) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    extracted_topics JSON NOT NULL DEFAULT '[]',
    extracted_subtopics JSON NOT NULL DEFAULT '{}',
    learning_order JSON NOT NULL DEFAULT '[]',
    chunk_ids JSON NOT NULL DEFAULT '[]',
    sources_count INTEGER DEFAULT 0,
    chunks_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    registry_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(topic, difficulty, duration)
);

CREATE INDEX idx_curriculum_registry_topic ON curriculum_registry(topic);
CREATE INDEX idx_curriculum_registry_difficulty ON curriculum_registry(difficulty);
CREATE INDEX idx_curriculum_registry_expires_at ON curriculum_registry(expires_at);

-- ============================================================================
-- TABLE 4: curriculum_learning_paths
-- Generated lesson sequences
-- ============================================================================

CREATE TABLE IF NOT EXISTS curriculum_learning_paths (
    id SERIAL PRIMARY KEY,
    curriculum_id INTEGER NOT NULL REFERENCES curriculum_registry(id) ON DELETE CASCADE,
    path_index INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    topic VARCHAR(300) NOT NULL,
    subtopic VARCHAR(300),
    chunk_ids JSON NOT NULL DEFAULT '[]',
    estimated_minutes INTEGER,
    learning_objectives JSON NOT NULL DEFAULT '[]',
    prerequisites JSON NOT NULL DEFAULT '[]',
    path_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(curriculum_id, path_index)
);

CREATE INDEX idx_curriculum_learning_paths_topic ON curriculum_learning_paths(topic);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all created tables
SELECT 'Setup Complete!' as message;

-- Show table details
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## Step-by-Step in pgAdmin

### Step 1: Create Database
1. In pgAdmin, expand **Servers** → **PostgreSQL** (or your server name)
2. Right-click **Databases**
3. Select **Create → Database**
4. Set name to `warriors_db`
5. Click **Save**

### Step 2: Open Query Tool
1. Click on the `warriors_db` database in the left panel
2. Go to **Tools → Query Tool** (top menu)
3. A query editor window opens

### Step 3: Paste and Execute SQL
1. Copy the complete SQL script above
2. Paste it into the query editor
3. Click **Execute** button (or press **F5**)
4. Wait for "Setup Complete!" message

### Step 4: Verify Tables Created
1. In left sidebar, expand `warriors_db` → **Schemas** → **public** → **Tables**
2. You should see 4 tables:
   - curriculum_chunks
   - curriculum_learning_paths
   - curriculum_registry
   - curriculum_sources

---

## If You Want to Run One Table at a Time

### Create curriculum_sources table:
```sql
CREATE TABLE curriculum_sources (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2048) NOT NULL UNIQUE,
    source_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    raw_markdown TEXT NOT NULL,
    headings JSON NOT NULL DEFAULT '[]',
    source_metadata JSON NOT NULL DEFAULT '{}',
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_curriculum_sources_source_type ON curriculum_sources(source_type);
CREATE INDEX idx_curriculum_sources_fetched_at ON curriculum_sources(fetched_at);
```

### Create curriculum_chunks table:
```sql
CREATE TABLE curriculum_chunks (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES curriculum_sources(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    heading_path VARCHAR(1000),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    concepts JSON NOT NULL DEFAULT '[]',
    chunk_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_id, chunk_index)
);
CREATE INDEX idx_curriculum_chunks_heading_path ON curriculum_chunks(heading_path);
CREATE INDEX idx_curriculum_chunks_token_count ON curriculum_chunks(token_count);
```

### Create curriculum_registry table:
```sql
CREATE TABLE curriculum_registry (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(500) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    extracted_topics JSON NOT NULL DEFAULT '[]',
    extracted_subtopics JSON NOT NULL DEFAULT '{}',
    learning_order JSON NOT NULL DEFAULT '[]',
    chunk_ids JSON NOT NULL DEFAULT '[]',
    sources_count INTEGER DEFAULT 0,
    chunks_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    registry_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(topic, difficulty, duration)
);
CREATE INDEX idx_curriculum_registry_topic ON curriculum_registry(topic);
CREATE INDEX idx_curriculum_registry_difficulty ON curriculum_registry(difficulty);
CREATE INDEX idx_curriculum_registry_expires_at ON curriculum_registry(expires_at);
```

### Create curriculum_learning_paths table:
```sql
CREATE TABLE curriculum_learning_paths (
    id SERIAL PRIMARY KEY,
    curriculum_id INTEGER NOT NULL REFERENCES curriculum_registry(id) ON DELETE CASCADE,
    path_index INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    topic VARCHAR(300) NOT NULL,
    subtopic VARCHAR(300),
    chunk_ids JSON NOT NULL DEFAULT '[]',
    estimated_minutes INTEGER,
    learning_objectives JSON NOT NULL DEFAULT '[]',
    prerequisites JSON NOT NULL DEFAULT '[]',
    path_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(curriculum_id, path_index)
);
CREATE INDEX idx_curriculum_learning_paths_topic ON curriculum_learning_paths(topic);
```

---

## Troubleshooting

**Error: "database already exists"**
- The database `warriors_db` already exists - that's fine, proceed to create tables

**Error: "relation already exists"**
- A table already exists - that's fine, the `IF NOT EXISTS` clause will skip it

**Error: "invalid JSON"**
- Make sure JSON defaults are properly quoted: `DEFAULT '{}'` or `DEFAULT '[]'`

**Tables not visible in left sidebar**
- Right-click on **Schemas** → **Refresh** to reload the list

---

## Next Steps

Once tables are created:

1. Start the backend:
   ```bash
   cd backend
   python main.py
   ```

2. Test the API:
   ```bash
   curl -X POST http://localhost:8000/api/curriculum/discover \
     -H "Content-Type: application/json" \
     -d '{"topic":"Python","difficulty":"Intermediate","duration":"2 hours"}'
   ```

3. View interactive docs:
   - Open http://localhost:8000/docs in browser

Done! Your database is ready for Firecrawl curriculum extraction!
