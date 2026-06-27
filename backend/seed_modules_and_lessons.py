"""
Seed script to create modules and lessons with proper Module model
Run: python seed_modules_and_lessons.py
"""

from app.database import SessionLocal
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from datetime import datetime

db = SessionLocal()

# Define modules and lessons for each course
modules_data = {
    1: [  # UI/UX Design Fundamentals
        {
            "title": "Fundamentals & Research",
            "description": "Learn the core principles of UX/UI design and research methodologies",
            "lessons": [
                {"title": "Introduction to UX/UI", "duration": 15},
                {"title": "Design Principles", "duration": 20},
                {"title": "User Research Basics", "duration": 25},
            ]
        },
        {
            "title": "Interaction & Prototyping",
            "description": "Master wireframing, prototyping tools, and user testing",
            "lessons": [
                {"title": "Wireframing Essentials", "duration": 30},
                {"title": "Prototyping Tools", "duration": 20},
                {"title": "User Testing", "duration": 25},
            ]
        },
        {
            "title": "Visual Design & Components",
            "description": "Explore color theory, typography, and component systems",
            "lessons": [
                {"title": "Color Theory", "duration": 20},
                {"title": "Typography", "duration": 15},
                {"title": "Component Design", "duration": 25},
            ]
        },
    ],
    2: [  # Advanced Python Algorithms
        {
            "title": "Sorting & Searching Algorithms",
            "description": "Master efficient sorting and searching techniques",
            "lessons": [
                {"title": "Merge Sort & Quick Sort", "duration": 30},
                {"title": "Binary Search", "duration": 20},
                {"title": "Search Optimization", "duration": 25},
            ]
        },
        {
            "title": "Advanced Data Structures",
            "description": "Learn trees, graphs, and advanced data structure patterns",
            "lessons": [
                {"title": "Trees & Graphs", "duration": 35},
                {"title": "Hash Tables", "duration": 25},
                {"title": "Heaps & Priority Queues", "duration": 30},
            ]
        },
    ],
    3: [  # Digital Marketing
        {
            "title": "Marketing Foundations",
            "description": "Understand digital channels and fundamental marketing concepts",
            "lessons": [
                {"title": "Marketing Channels Overview", "duration": 15},
                {"title": "SEO Fundamentals", "duration": 20},
                {"title": "Content Strategy", "duration": 25},
            ]
        },
        {
            "title": "Growth & Analytics",
            "description": "Learn growth hacking and data-driven marketing techniques",
            "lessons": [
                {"title": "Viral Marketing", "duration": 20},
                {"title": "Conversion Optimization", "duration": 25},
                {"title": "Analytics & Metrics", "duration": 20},
            ]
        },
    ],
    4: [  # AI & Neural Networks
        {
            "title": "AI Fundamentals",
            "description": "Introduction to AI concepts and machine learning types",
            "lessons": [
                {"title": "What is AI?", "duration": 15},
                {"title": "Machine Learning Types", "duration": 20},
                {"title": "Neural Networks Intro", "duration": 25},
            ]
        },
        {
            "title": "Building AI Models",
            "description": "Learn to build and train neural networks",
            "lessons": [
                {"title": "TensorFlow Setup", "duration": 20},
                {"title": "Training Your First Model", "duration": 30},
                {"title": "Model Evaluation", "duration": 25},
            ]
        },
    ],
    5: [  # Brand Identity Design
        {
            "title": "Brand Strategy",
            "description": "Develop brand positioning and strategy",
            "lessons": [
                {"title": "Brand Positioning", "duration": 20},
                {"title": "Target Audience Analysis", "duration": 25},
                {"title": "Brand Values & Vision", "duration": 20},
            ]
        },
        {
            "title": "Visual Identity Systems",
            "description": "Create cohesive visual brand identities",
            "lessons": [
                {"title": "Logo Design", "duration": 30},
                {"title": "Color & Typography", "duration": 25},
                {"title": "Brand Guidelines", "duration": 20},
            ]
        },
    ],
    6: [  # Leadership & Management
        {
            "title": "Leadership Essentials",
            "description": "Develop core leadership competencies",
            "lessons": [
                {"title": "Leadership Styles", "duration": 25},
                {"title": "Emotional Intelligence", "duration": 30},
                {"title": "Decision Making", "duration": 20},
            ]
        },
        {
            "title": "Team Management",
            "description": "Build and manage high-performing teams",
            "lessons": [
                {"title": "Building High-Performance Teams", "duration": 30},
                {"title": "Conflict Resolution", "duration": 25},
                {"title": "Performance Management", "duration": 25},
            ]
        },
    ],
    7: [  # Web Development Full Stack
        {
            "title": "Frontend Development",
            "description": "Master HTML, CSS, JavaScript, and React",
            "lessons": [
                {"title": "HTML & CSS Basics", "duration": 30},
                {"title": "JavaScript Fundamentals", "duration": 40},
                {"title": "React Basics", "duration": 40},
            ]
        },
        {
            "title": "Backend Development",
            "description": "Learn Node.js, Express, and database design",
            "lessons": [
                {"title": "Node.js & Express", "duration": 35},
                {"title": "RESTful APIs", "duration": 30},
                {"title": "Database Design", "duration": 35},
            ]
        },
        {
            "title": "Deployment & DevOps",
            "description": "Deploy applications and learn DevOps basics",
            "lessons": [
                {"title": "Cloud Deployment", "duration": 25},
                {"title": "DevOps Basics", "duration": 30},
                {"title": "Performance Optimization", "duration": 25},
            ]
        },
    ],
    8: [  # Data Science
        {
            "title": "Python for Data Science",
            "description": "Learn NumPy, Pandas, and data visualization",
            "lessons": [
                {"title": "NumPy & Pandas", "duration": 35},
                {"title": "Data Cleaning", "duration": 30},
                {"title": "Data Visualization", "duration": 25},
            ]
        },
        {
            "title": "Machine Learning",
            "description": "Master supervised and unsupervised learning",
            "lessons": [
                {"title": "Supervised Learning", "duration": 35},
                {"title": "Unsupervised Learning", "duration": 30},
                {"title": "Model Evaluation", "duration": 25},
            ]
        },
    ],
    9: [  # React Native
        {
            "title": "React Native Fundamentals",
            "description": "Get started with React Native and mobile development",
            "lessons": [
                {"title": "Setup & Environment", "duration": 20},
                {"title": "Components & Navigation", "duration": 30},
                {"title": "Styling & Layout", "duration": 25},
            ]
        },
        {
            "title": "Advanced Mobile Features",
            "description": "Learn state management and API integration",
            "lessons": [
                {"title": "State Management", "duration": 30},
                {"title": "API Integration", "duration": 25},
                {"title": "Deployment", "duration": 20},
            ]
        },
    ],
    10: [  # Cloud Computing
        {
            "title": "AWS Fundamentals",
            "description": "Master AWS core services",
            "lessons": [
                {"title": "EC2 & S3", "duration": 30},
                {"title": "RDS & Databases", "duration": 25},
                {"title": "Lambda & Serverless", "duration": 30},
            ]
        },
        {
            "title": "Azure Services",
            "description": "Learn Azure cloud platform",
            "lessons": [
                {"title": "Virtual Machines", "duration": 25},
                {"title": "App Service & Containers", "duration": 30},
                {"title": "Database Services", "duration": 25},
            ]
        },
    ],
    11: [  # Content Writing
        {
            "title": "Writing Fundamentals",
            "description": "Master audience analysis and writing techniques",
            "lessons": [
                {"title": "Audience Analysis", "duration": 15},
                {"title": "Tone & Voice", "duration": 15},
                {"title": "Structure & Flow", "duration": 15},
            ]
        },
        {
            "title": "Web Copywriting",
            "description": "Learn SEO writing and conversion copywriting",
            "lessons": [
                {"title": "SEO Writing", "duration": 15},
                {"title": "Landing Pages", "duration": 20},
                {"title": "Email Marketing", "duration": 15},
            ]
        },
    ],
    12: [  # Video Production
        {
            "title": "Video Production",
            "description": "Master camera work and audio recording",
            "lessons": [
                {"title": "Camera Basics", "duration": 25},
                {"title": "Lighting & Composition", "duration": 25},
                {"title": "Audio Recording", "duration": 20},
            ]
        },
        {
            "title": "Post-Production",
            "description": "Learn editing, color grading, and sound design",
            "lessons": [
                {"title": "Editing Software", "duration": 25},
                {"title": "Color Grading", "duration": 25},
                {"title": "Sound Design", "duration": 20},
            ]
        },
    ],
}

def seed_modules_and_lessons():
    try:
        # Get all courses
        courses = db.query(Course).all()

        for course in courses:
            if course.id not in modules_data:
                print(f"[INFO] No modules defined for course {course.id}: {course.title}")
                continue

            print(f"\n[INFO] Adding modules for: {course.title}")

            lesson_order = 1
            for module_idx, module_data in enumerate(modules_data[course.id], 1):
                # Create module
                module = Module(
                    course_id=course.id,
                    title=module_data["title"],
                    description=module_data.get("description"),
                    order=module_idx,
                    created_at=datetime.utcnow(),
                )
                db.add(module)
                db.flush()

                print(f"  [OK] Module: {module.title}")

                # Create lessons for this module
                for lesson_data in module_data["lessons"]:
                    lesson = Lesson(
                        course_id=course.id,
                        module_id=module.id,
                        title=lesson_data["title"],
                        duration_minutes=lesson_data["duration"],
                        order=lesson_order,
                        created_at=datetime.utcnow(),
                    )
                    db.add(lesson)
                    lesson_order += 1

                db.commit()

        print("\n[SUCCESS] Modules and lessons seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding modules and lessons: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_modules_and_lessons()
