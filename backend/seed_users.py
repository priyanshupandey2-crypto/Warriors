"""
Seed script to populate the database with test users.
Run this from the backend directory: python seed_users.py
"""

from app.database import SessionLocal
from app.models.user import User
from datetime import datetime
from app.utils.password import hash_password

test_users = [
    {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    },
    {
        "name": "John Smith",
        "email": "john@example.com",
        "password": "password123",
    },
]

def seed_database():
    """Add test users to the database"""
    db = SessionLocal()

    try:
        # Check if users already exist
        existing_count = db.query(User).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} users. Skipping seed.")
            return

        # Add test users
        for user_data in test_users:
            password = user_data.pop("password")
            hashed_password = hash_password(password)

            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hashed_password,
                role="learner",
            )
            db.add(user)

        db.commit()
        print(f"[SUCCESS] Added {len(test_users)} users to the database!")

        # Verify
        total = db.query(User).count()
        print(f"[INFO] Total users in database: {total}")

        # Show user IDs
        users = db.query(User).all()
        for user in users:
            print(f"  - ID: {user.id}, Name: {user.name}, Email: {user.email}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
