# backend/create_tables.py

from app.database import Base, engine

# IMPORTANT: Import all models so SQLAlchemy knows about them
from app.models.user import User
from app.models.course import Course
from app.models.user_course import UserCourse
from app.models.learning_activity import LearningActivity
from app.models.user_goal import UserGoal
from app.models.milestone import Milestone
from app.models.user_note import UserNote

print("="*60)
print("🔨 Creating Database Tables...")
print("="*60)

try:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("\n✅ All 6 tables created successfully!")
    print("\nTables created:")
    print("  ✓ users")
    print("  ✓ courses")
    print("  ✓ user_courses")
    print("  ✓ learning_activities")
    print("  ✓ user_goals")
    print("  ✓ milestones")
    
except Exception as e:
    print(f"\n❌ Error creating tables: {str(e)}")
    import traceback
    traceback.print_exc()
