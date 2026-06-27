"""
Seed Audit Logs
===============

Script to populate the database with mock audit logs for testing and demonstration.
Simulates various admin activities (create, update, delete, approve, reject).

Run: python seed_audit_logs.py
"""

import sys
from datetime import datetime, timedelta

# Fix encoding on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.audit_log import AuditLog

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Mock audit log data
mock_logs = [
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "CREATE",
        "resource_type": "Course",
        "resource_id": 5,
        "resource_name": "Advanced Python Programming",
        "status": "Success",
        "details": "Course created successfully with 4 modules",
        "timestamp": datetime.utcnow() - timedelta(hours=1, minutes=30),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "UPDATE",
        "resource_type": "Course",
        "resource_id": 3,
        "resource_name": "Web Development Basics",
        "status": "Success",
        "details": "Updated course difficulty from Beginner to Intermediate",
        "timestamp": datetime.utcnow() - timedelta(hours=2, minutes=45),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "DELETE",
        "resource_type": "Course",
        "resource_id": 7,
        "resource_name": "Deprecated Course",
        "status": "Success",
        "details": "Course deleted along with 12 lessons and 3 quizzes",
        "timestamp": datetime.utcnow() - timedelta(hours=4, minutes=15),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "UPDATE",
        "resource_type": "Lesson",
        "resource_id": 42,
        "resource_name": "Introduction to APIs",
        "status": "Success",
        "details": "Updated lesson content and learning objectives",
        "timestamp": datetime.utcnow() - timedelta(hours=5, minutes=40),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "UPDATE",
        "resource_type": "Quiz",
        "resource_id": 15,
        "resource_name": "Python Fundamentals Quiz",
        "status": "Success",
        "details": "Updated quiz passing score from 60 to 70",
        "timestamp": datetime.utcnow() - timedelta(hours=7),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "APPROVE",
        "resource_type": "Submission",
        "resource_id": 12,
        "resource_name": "Machine Learning Basics",
        "status": "Success",
        "details": "Submission approved and course created (ID: 8)",
        "timestamp": datetime.utcnow() - timedelta(hours=8, minutes=20),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "REJECT",
        "resource_type": "Submission",
        "resource_id": 11,
        "resource_name": "Data Science Advanced",
        "status": "Success",
        "details": "Submission rejected: Content does not meet quality standards",
        "timestamp": datetime.utcnow() - timedelta(hours=9, minutes=50),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "UPDATE",
        "resource_type": "Lesson",
        "resource_id": 50,
        "resource_name": "REST API Design Patterns",
        "status": "Success",
        "details": "Title updated; Duration: 45min → 60min",
        "timestamp": datetime.utcnow() - timedelta(hours=11),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "DELETE",
        "resource_type": "Quiz",
        "resource_id": 28,
        "resource_name": "Outdated Security Quiz",
        "status": "Success",
        "details": "Quiz removed due to outdated content",
        "timestamp": datetime.utcnow() - timedelta(hours=12, minutes=30),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "CREATE",
        "resource_type": "Module",
        "resource_id": 25,
        "resource_name": "Cloud Computing Fundamentals",
        "status": "Success",
        "details": "New module created for Cloud Architecture course",
        "timestamp": datetime.utcnow() - timedelta(hours=14),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "UPDATE",
        "resource_type": "Course",
        "resource_id": 1,
        "resource_name": "Introduction to Computer Science",
        "status": "Success",
        "details": "Title: 'Intro to CS' → 'Introduction to Computer Science'; Difficulty: 'Beginner' → 'Intermediate'",
        "timestamp": datetime.utcnow() - timedelta(hours=15, minutes=45),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "APPROVE",
        "resource_type": "Submission",
        "resource_id": 9,
        "resource_name": "Blockchain Development",
        "status": "Success",
        "details": "Submission approved and course created (ID: 9)",
        "timestamp": datetime.utcnow() - timedelta(hours=17),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "UPDATE",
        "resource_type": "Quiz",
        "resource_id": 22,
        "resource_name": "JavaScript Testing Quiz",
        "status": "Success",
        "details": "Passing score: 65 → 75",
        "timestamp": datetime.utcnow() - timedelta(hours=18, minutes=20),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "CREATE",
        "resource_type": "Lesson",
        "resource_id": 75,
        "resource_name": "Advanced State Management",
        "status": "Success",
        "details": "New lesson created with learning objectives and key concepts",
        "timestamp": datetime.utcnow() - timedelta(hours=20),
    },
    {
        "admin_id": 1,
        "admin_email": "admin@example.com",
        "action": "REJECT",
        "resource_type": "Submission",
        "resource_id": 10,
        "resource_name": "Cryptocurrency Trading",
        "status": "Success",
        "details": "Submission rejected: Topic outside scope of educational platform",
        "timestamp": datetime.utcnow() - timedelta(hours=21, minutes=30),
    },
]


def seed_audit_logs():
    """Seed the database with mock audit logs."""
    db = SessionLocal()
    try:
        # Check if audit logs already exist
        existing_count = db.query(AuditLog).count()
        if existing_count > 0:
            print(f"[INFO] Audit logs already seeded ({existing_count} logs exist). Skipping...")
            return

        # Add all mock logs
        logs_to_add = [AuditLog(**log_data) for log_data in mock_logs]
        db.add_all(logs_to_add)
        db.commit()

        print(f"[OK] Successfully seeded {len(logs_to_add)} audit logs")

    except Exception as e:
        print(f"[ERROR] Error seeding audit logs: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_audit_logs()
