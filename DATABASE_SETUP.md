# Database Setup Instructions

## Database Creation

PostgreSQL doesn't support `CREATE DATABASE IF NOT EXISTS` syntax. Use these commands:

### Option 1: Using psql Command Line

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create the database
CREATE DATABASE warriors_db;

# Verify it was created
\l

# Exit
\q
```

### Option 2: Using SQL File

Create a file with:
```sql
CREATE DATABASE warriors_db;
```

Then run:
```bash
psql -U postgres -h localhost -f path/to/file.sql
```

### Option 3: Direct Command

```bash
psql -U postgres -h localhost -c "CREATE DATABASE warriors_db;"
```

## After Database Creation

Once the database exists, the curriculum tables will be created automatically when you start the backend.

The backend will execute `init_db()` which calls:
```python
Base.metadata.create_all(bind=engine)
```

This creates all tables defined in `app/models/`:
- curriculum_sources
- curriculum_chunks
- curriculum_registry
- curriculum_learning_paths

## Verification

Check that the database was created:

```bash
psql -U postgres -h localhost -c "\l" | grep warriors_db
```

Expected output:
```
warriors_db | postgres | UTF8
```

## If Database Already Exists

If you get an error "database already exists", that's fine - just skip creation and proceed to starting the backend.

## Starting the Backend

Once the database exists:

```bash
cd backend
python main.py
```

The tables will be created automatically on startup.
