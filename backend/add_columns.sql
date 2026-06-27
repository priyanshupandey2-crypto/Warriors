-- Add user_submitted_at and user_feedback columns to course_generations table
ALTER TABLE course_generations ADD COLUMN IF NOT EXISTS user_submitted_at TIMESTAMP NULL;
ALTER TABLE course_generations ADD COLUMN IF NOT EXISTS user_feedback TEXT NULL;
