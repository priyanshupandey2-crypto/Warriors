# backend/insert_test_data.py

from datetime import datetime, date, timedelta
from app.database import SessionLocal
from app.models import User, Course, UserCourse, LearningActivity, UserGoal, Milestone

db = SessionLocal()

try:
    # ============================================
    # INSERT USER: Alex Chen
    # ============================================
    user = User(
        id=1,
        name="Alex Chen",
        email="alex.chen@example.com",
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    print("✅ User created: Alex Chen")

    # ============================================
    # INSERT COURSES
    # ============================================
    courses = [
        Course(
            id=1,
            title="Mastering UX Psychology",
            description="Learn cognitive biases and user behavior",
            difficulty="Advanced",
            duration_hours=24,
            thumbnail_url="https://via.placeholder.com/300x200?text=UX+Psychology",
            status="published",
            created_by=1,
            created_at=datetime.utcnow()
        ),
        Course(
            id=2,
            title="Python for Data Science",
            description="Master pandas, numpy, and data visualization",
            difficulty="Intermediate",
            duration_hours=18,
            thumbnail_url="https://via.placeholder.com/300x200?text=Python+Data",
            status="published",
            created_by=1,
            created_at=datetime.utcnow()
        ),
        Course(
            id=3,
            title="Digital Brand Identity",
            description="Create cohesive brand visual language",
            difficulty="Beginner",
            duration_hours=12,
            thumbnail_url="https://via.placeholder.com/300x200?text=Brand+Design",
            status="published",
            created_by=1,
            created_at=datetime.utcnow()
        ),
        Course(
            id=4,
            title="AI Foundations",
            description="Introduction to artificial intelligence",
            difficulty="Beginner",
            duration_hours=15,
            thumbnail_url="https://via.placeholder.com/300x200?text=AI",
            status="published",
            created_by=1,
            created_at=datetime.utcnow()
        ),
    ]
    db.add_all(courses)
    db.commit()
    print("✅ Courses created: 4 courses")

    # ============================================
    # INSERT USER COURSES (Enrollments)
    # ============================================
    user_courses = [
        UserCourse(
            user_id=1,
            course_id=1,
            status="IN_PROGRESS",
            progress_percentage=65,
            completed_lessons=12,
            total_lessons=18,
            enrolled_at=datetime.utcnow() - timedelta(days=30),
            last_accessed_at=datetime.utcnow() - timedelta(days=1),
            completed_at=None
        ),
        UserCourse(
            user_id=1,
            course_id=2,
            status="IN_PROGRESS",
            progress_percentage=32,
            completed_lessons=4,
            total_lessons=12,
            enrolled_at=datetime.utcnow() - timedelta(days=15),
            last_accessed_at=datetime.utcnow() - timedelta(days=2),
            completed_at=None
        ),
        UserCourse(
            user_id=1,
            course_id=3,
            status="IN_PROGRESS",
            progress_percentage=88,
            completed_lessons=10,
            total_lessons=11,
            enrolled_at=datetime.utcnow() - timedelta(days=20),
            last_accessed_at=datetime.utcnow(),
            completed_at=None
        ),
        UserCourse(
            user_id=1,
            course_id=4,
            status="COMPLETED",
            progress_percentage=100,
            completed_lessons=15,
            total_lessons=15,
            enrolled_at=datetime.utcnow() - timedelta(days=60),
            last_accessed_at=datetime.utcnow() - timedelta(days=5),
            completed_at=datetime.utcnow() - timedelta(days=5)
        ),
    ]
    db.add_all(user_courses)
    db.commit()
    print("✅ User enrollments created: 3 IN_PROGRESS, 1 COMPLETED")

    # ============================================
    # INSERT LEARNING ACTIVITIES
    # ============================================
    today = datetime.utcnow().date()
    activities = []
    
    activity_data = [
        (0, 45, 2),
        (1, 90, 3),
        (2, 110, 4),
        (3, 70, 2),
        (4, 30, 1),
        (5, 60, 2),
        (6, 65, 2),
    ]
    
    for days_ago, minutes, lessons in activity_data:
        activity_date = today - timedelta(days=days_ago)
        activity = LearningActivity(
            user_id=1,
            course_id=(1 + (days_ago % 3)),
            activity_date=activity_date,
            minutes_spent=minutes,
            lessons_completed=lessons,
            created_at=datetime.utcnow()
        )
        activities.append(activity)
    
    db.add_all(activities)
    db.commit()
    print("✅ Learning activities created: 7 days of data")

    # ============================================
    # INSERT USER GOAL
    # ============================================
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    
    goal = UserGoal(
        user_id=1,
        target_hours=15.0,
        current_hours=7.83,
        week_start=monday,
        week_end=sunday
    )
    db.add(goal)
    db.commit()
    print("✅ Weekly goal created")

    # ============================================
    # INSERT MILESTONES
    # ============================================
    milestones = [
        Milestone(
            user_id=1,
            course_id=1,
            title="UX Design Sprint",
            description="Complete the UX design sprint assignment",
            due_date=today + timedelta(days=2),
            status="PENDING"
        ),
        Milestone(
            user_id=1,
            course_id=2,
            title="Python Basics Final",
            description="Final exam for Python basics module",
            due_date=today + timedelta(days=1),
            status="PENDING"
        ),
    ]
    db.add_all(milestones)
    db.commit()
    print("✅ Milestones created: 2 pending")

    print("\n" + "="*50)
    print("✅ ALL TEST DATA INSERTED SUCCESSFULLY!")
    print("="*50)

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    db.close()
