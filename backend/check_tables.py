# backend/check_tables.py

from sqlalchemy import inspect
from app.database import engine

inspector = inspect(engine)

# Get all table names
tables = inspector.get_table_names()

print("="*50)
print("📊 Tables in auralearn_db:")
print("="*50)

if tables:
    for table in tables:
        print(f"✅ {table}")
    print(f"\n🎉 Total: {len(tables)} tables found!")
else:
    print("❌ NO TABLES FOUND!")

print("="*50)
