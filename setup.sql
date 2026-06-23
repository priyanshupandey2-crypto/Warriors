-- Warriors Backend Database Setup
-- Run these SQL commands to initialize the database

-- 1. Create the database
CREATE DATABASE warriors_db;

-- 2. Connect to the database (in psql, use: \c warriors_db)
-- Then run the following table creation commands:

-- Table: curriculum_sources
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

-- Table: curriculum_chunks
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

-- Table: curriculum_registry
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

-- Table: curriculum_learning_paths
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

-- Verify tables were created
SELECT 'Database setup complete!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
