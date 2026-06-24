#!/usr/bin/env python3
"""
Script to create an admin user in the database.
Run from the backend directory: python create_admin.py
"""

import sys
from app.database import SessionLocal
from app.models.user import User
from app.utils.password import hash_password

def create_admin_user():
    """Create an admin user with predefined credentials."""
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@auralearn.com").first()
        if existing_admin:
            print(f"Admin user already exists!")
            print(f"ID: {existing_admin.id}")
            print(f"Email: {existing_admin.email}")
            print(f"Role: {existing_admin.role}")
            return existing_admin

        # Create admin user
        admin_email = "admin@auralearn.com"
        admin_password = "Admin@123456"
        admin_name = "Admin User"

        password_hash = hash_password(admin_password)

        admin_user = User(
            name=admin_name,
            email=admin_email,
            password_hash=password_hash,
            role="admin",
            courses_enrolled=[]
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("[+] Admin user created successfully!")
        print(f"\n{'='*50}")
        print(f"Admin Credentials:")
        print(f"{'='*50}")
        print(f"ID:       {admin_user.id}")
        print(f"Email:    {admin_email}")
        print(f"Password: {admin_password}")
        print(f"Role:     {admin_user.role}")
        print(f"{'='*50}\n")

        return admin_user

    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
