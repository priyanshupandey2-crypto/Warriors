# backend/test_connection.py

from app.config import settings
from sqlalchemy import create_engine, text

print("="*60)
print("🔍 Testing PostgreSQL Connection...")
print("="*60)

print(f"\n📌 Credentials from .env:")
print(f"   DATABASE_URL: {settings.DATABASE_URL}")
print(f"   Host: {settings.DB_HOST}")
print(f"   Port: {settings.DB_PORT}")
print(f"   User: {settings.DB_USER}")
print(f"   Database: {settings.DB_NAME}")

try:
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("\n✅ CONNECTION SUCCESSFUL!")
        print("✅ PostgreSQL is working correctly!")
        
except Exception as e:
    print(f"\n❌ CONNECTION FAILED!")
    print(f"\n📛 Error: {str(e)}")
    print("\n💡 This usually means:")
    print("   1. Wrong password in .env")
    print("   2. PostgreSQL service is not running")
    print("   3. Wrong host/port")
