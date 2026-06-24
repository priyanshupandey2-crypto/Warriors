"""
Comprehensive seed script to populate database with full course structure
Run: python seed_courses_full.py
"""

from app.database import SessionLocal
from app.models.course import Course
from app.models.lesson import Lesson

db = SessionLocal()

# Course data with modules and lessons
courses_data = [
    {
        "title": "UI/UX Design Fundamentals for Modern Products",
        "description": "Master the principles of user experience and interface design. Learn to create intuitive, beautiful, and functional digital products that users love.",
        "difficulty": "Intermediate",
        "duration_hours": 30,
        "category": "Creative Design",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBooGc5QJtuxOHshZMexrY_wyFLz5LL9N39tiT-WVVMw7tRNpDoIX-YPgEY8a4-5CtBAj8qP269EtqjgczzbuGyHyj6_j4hlRQrga8DATDrpH_2k4JKmA52zrXQPVm_j6AQMULxRvDytBsK46ch-osXUYV5WZAOBqy-Y4NyTQPekqTvDD2y9mvCLAfHpTrf4RQxv2raIMSxCucXzgpTj94hYbDUx_nN6rdkx-CJ-DlV6LamPvCwjduk8FguF_uCk4XUsBIJK4A3fWAI",
        "modules": [
            {
                "title": "Module 1: Design Fundamentals",
                "lessons": [
                    {"title": "Introduction to UX/UI", "duration": 15},
                    {"title": "Design Principles", "duration": 20},
                    {"title": "User Research Basics", "duration": 25},
                ]
            },
            {
                "title": "Module 2: Interaction Design",
                "lessons": [
                    {"title": "Wireframing Essentials", "duration": 30},
                    {"title": "Prototyping Tools", "duration": 20},
                    {"title": "User Testing", "duration": 25},
                ]
            },
            {
                "title": "Module 3: Visual Design",
                "lessons": [
                    {"title": "Color Theory", "duration": 20},
                    {"title": "Typography", "duration": 15},
                    {"title": "Component Design", "duration": 25},
                ]
            },
        ]
    },
    {
        "title": "Advanced Python Algorithms & Data Structures",
        "description": "Deep dive into advanced algorithms and data structures using Python. Optimize your code for performance and solve complex computational problems efficiently.",
        "difficulty": "Advanced",
        "duration_hours": 45,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyAFTx27UIQBf_RCR806ZHhhswqxc9rOI6DOh8EOJ7cHYCZFy6wiOdsuTcdoIK0mqya4CoLm9SH_og-h1cThwFvFJ13qSYPBTO3-xLs02GPCSvhQ3FUrqrRVzzDmdXCOG_oxLT37mRiwbe6eqPXCUTxwS_QK7H3EbbQ71_0Mzs8LuEQlkfBYD3VG4uurnTE16l-6a2mD310h26NztRriTdaNXqkp-qBn0srJnOXRnO76NtxXZPajBOmdjd0ogI65avPvdtBdIN5VP2",
        "modules": [
            {
                "title": "Module 1: Sorting & Searching",
                "lessons": [
                    {"title": "Merge Sort & Quick Sort", "duration": 30},
                    {"title": "Binary Search", "duration": 20},
                    {"title": "Search Optimization", "duration": 25},
                ]
            },
            {
                "title": "Module 2: Data Structures",
                "lessons": [
                    {"title": "Trees & Graphs", "duration": 35},
                    {"title": "Hash Tables", "duration": 25},
                    {"title": "Heaps & Priority Queues", "duration": 30},
                ]
            },
        ]
    },
    {
        "title": "Mastering Digital Marketing & Growth Hacking",
        "description": "Learn modern digital marketing strategies, growth hacking techniques, and data-driven approaches to scale your business online.",
        "difficulty": "Beginner",
        "duration_hours": 20,
        "category": "Marketing",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAIrhWYbr5QO_CXNNRaUMqEVlbY6EBtzr7gsC5QGPOHPyFoJZ7T7T8G25Ga_HGlfNjgILFCq7gON9Cv5GU3f0FAw8oXLaqpLjnnF6pgfeI4yzlaOlkxwm4DAgxJUFER7sNM5Ks-QGqSbib5MzNqLt15BXyx7bKB1eg6JmRAJ1PbfCICbAo7OTSC2WKT2mAWYaqG-oILoyLHjuUe8NTOA4Kxh3Zir5Oz7qSNRXDL_4LW9x4n6KaH8ZmFMWS653b3SHCX33baDWnKMPOe",
        "modules": [
            {
                "title": "Module 1: Digital Marketing Basics",
                "lessons": [
                    {"title": "Marketing Channels Overview", "duration": 15},
                    {"title": "SEO Fundamentals", "duration": 20},
                    {"title": "Content Strategy", "duration": 25},
                ]
            },
            {
                "title": "Module 2: Growth Hacking",
                "lessons": [
                    {"title": "Viral Marketing", "duration": 20},
                    {"title": "Conversion Optimization", "duration": 25},
                    {"title": "Analytics & Metrics", "duration": 20},
                ]
            },
        ]
    },
    {
        "title": "Intro to Artificial Intelligence & Neural Networks",
        "description": "Get started with AI and machine learning. Understand neural networks, train your first models, and explore the future of intelligent systems.",
        "difficulty": "Beginner",
        "duration_hours": 35,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKkp4xkRkQ9Kn9mQ6RqsXSpK0niIqTzpE4spE1nVKFsoESnBL_tCqnPNWbezhx9SfiWy5GRBuK0g-lLH3J0mo_Ih9evuiJ4_sq8VwFO-ychH2CTYuu0CNe59ZuD40WVXuhgGu-D39QFk3APggYK1G5Iq0qdamPsKcYzdu8Ga1kKxOpc2ILmc0YfqwNH9yBDbL8k0IyKdoKFbBQiB3JGiOQIv2dBA-hbuvJl_Qb88Dcu8ZMoY1Way2KTh8mSzO1VakP16lQFEEaQtql",
        "modules": [
            {
                "title": "Module 1: AI Fundamentals",
                "lessons": [
                    {"title": "What is AI?", "duration": 15},
                    {"title": "Machine Learning Types", "duration": 20},
                    {"title": "Neural Networks Intro", "duration": 25},
                ]
            },
            {
                "title": "Module 2: Building Models",
                "lessons": [
                    {"title": "TensorFlow Setup", "duration": 20},
                    {"title": "Training Your First Model", "duration": 30},
                    {"title": "Model Evaluation", "duration": 25},
                ]
            },
        ]
    },
    {
        "title": "Professional Brand Identity Design",
        "description": "Create compelling brand identities from scratch. Learn logo design, color theory, typography, and build cohesive visual systems.",
        "difficulty": "Intermediate",
        "duration_hours": 28,
        "category": "Creative Design",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCVCTfV0hAVREREPUKkUe5O8TBOP-zbWT_htIvnRphm9VgneJpWnLPgskc-zxDjeevBAotRVzYzEdFfnuvm6brwD7K5ZBDA4RhXAk-06rXBkUcSUDyeYC9qkG6VifREUCepyiVPyKsCXStXz_YqDHxJG0SUw-WeKM2j_wSsoIrVSia7RkrT7J_eH_XT4Fg-8oUmcUpJRHogpkQIRRkEFhpj20DnMgrM-OuzZiwV1UQ2z23Cu3dbwHzsd9Ovs12X39yf8Ks9A6Wmy5LW",
        "modules": [
            {
                "title": "Module 1: Brand Strategy",
                "lessons": [
                    {"title": "Brand Positioning", "duration": 20},
                    {"title": "Target Audience Analysis", "duration": 25},
                    {"title": "Brand Values & Vision", "duration": 20},
                ]
            },
            {
                "title": "Module 2: Visual Identity",
                "lessons": [
                    {"title": "Logo Design", "duration": 30},
                    {"title": "Color & Typography", "duration": 25},
                    {"title": "Brand Guidelines", "duration": 20},
                ]
            },
        ]
    },
    {
        "title": "Strategic Leadership & Management 2024",
        "description": "Develop leadership skills and strategic thinking abilities. Learn management techniques, team dynamics, and modern organizational practices.",
        "difficulty": "Advanced",
        "duration_hours": 32,
        "category": "Business & Strategy",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAWIBBBaUgZf421HNntuZMFNmuvQmYMTSasF_D73n8E3548iLzcGgHyQhHBPgSDZOHagL24uO1biXLt0EIAm_gw5xP4c_0wt0frCFZGWR1jCX4DQlEqfG3NUV6_Qtji1vLNMPUouTWlq5WO2TP6eYy_3k-l88I86YvfGIHb2o5xjc49focncXa-PREBO8I862SuHasH7ZxKTgPuNhxJmJAWZ2-I6kXAYtqQt6KY_ngx2oSnG9gZOrx1Ifggawyta82tze-EThvwyNTb",
        "modules": [
            {
                "title": "Module 1: Leadership Fundamentals",
                "lessons": [
                    {"title": "Leadership Styles", "duration": 25},
                    {"title": "Emotional Intelligence", "duration": 30},
                    {"title": "Decision Making", "duration": 20},
                ]
            },
            {
                "title": "Module 2: Team Management",
                "lessons": [
                    {"title": "Building High-Performance Teams", "duration": 30},
                    {"title": "Conflict Resolution", "duration": 25},
                    {"title": "Performance Management", "duration": 25},
                ]
            },
        ]
    },
    {
        "title": "Web Development Bootcamp: Full Stack 2024",
        "description": "Complete guide to full-stack web development. Learn frontend, backend, databases, and deploy production-ready applications.",
        "difficulty": "Intermediate",
        "duration_hours": 60,
        "category": "Computer Science",
        "thumbnail_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
        "modules": [
            {
                "title": "Module 1: Frontend Development",
                "lessons": [
                    {"title": "HTML & CSS Basics", "duration": 30},
                    {"title": "JavaScript Fundamentals", "duration": 40},
                    {"title": "React Basics", "duration": 40},
                ]
            },
            {
                "title": "Module 2: Backend Development",
                "lessons": [
                    {"title": "Node.js & Express", "duration": 35},
                    {"title": "RESTful APIs", "duration": 30},
                    {"title": "Database Design", "duration": 35},
                ]
            },
            {
                "title": "Module 3: Deployment",
                "lessons": [
                    {"title": "Cloud Deployment", "duration": 25},
                    {"title": "DevOps Basics", "duration": 30},
                    {"title": "Performance Optimization", "duration": 25},
                ]
            },
        ]
    },
    {
        "title": "Data Science with Python & Machine Learning",
        "description": "Master data science techniques using Python. Work with real datasets, build predictive models, and visualize insights.",
        "difficulty": "Intermediate",
        "duration_hours": 50,
        "category": "Computer Science",
        "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        "modules": [
            {
                "title": "Module 1: Python for Data Science",
                "lessons": [
                    {"title": "NumPy & Pandas", "duration": 35},
                    {"title": "Data Cleaning", "duration": 30},
                    {"title": "Data Visualization", "duration": 25},
                ]
            },
            {
                "title": "Module 2: Machine Learning",
                "lessons": [
                    {"title": "Supervised Learning", "duration": 35},
                    {"title": "Unsupervised Learning", "duration": 30},
                    {"title": "Model Evaluation", "duration": 25},
                ]
            },
        ]
    },
    {
        "title": "Mobile App Development with React Native",
        "description": "Build iOS and Android apps using React Native. Learn to create cross-platform applications with JavaScript.",
        "difficulty": "Intermediate",
        "duration_hours": 40,
        "category": "Computer Science",
        "thumbnail_url": "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500",
        "modules": [
            {
                "title": "Module 1: React Native Basics",
                "lessons": [
                    {"title": "Setup & Environment", "duration": 20},
                    {"title": "Components & Navigation", "duration": 30},
                    {"title": "Styling & Layout", "duration": 25},
                ]
            },
            {
                "title": "Module 2: Advanced Features",
                "lessons": [
                    {"title": "State Management", "duration": 30},
                    {"title": "API Integration", "duration": 25},
                    {"title": "Deployment", "duration": 20},
                ]
            },
        ]
    },
    {
        "title": "Cloud Computing with AWS & Azure",
        "description": "Deploy and manage applications on cloud platforms. Learn AWS and Azure services, scalability, and best practices.",
        "difficulty": "Advanced",
        "duration_hours": 48,
        "category": "Computer Science",
        "thumbnail_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
        "modules": [
            {
                "title": "Module 1: AWS Fundamentals",
                "lessons": [
                    {"title": "EC2 & S3", "duration": 30},
                    {"title": "RDS & Databases", "duration": 25},
                    {"title": "Lambda & Serverless", "duration": 30},
                ]
            },
            {
                "title": "Module 2: Azure Services",
                "lessons": [
                    {"title": "Virtual Machines", "duration": 25},
                    {"title": "App Service & Containers", "duration": 30},
                    {"title": "Database Services", "duration": 25},
                ]
            },
        ]
    },
    {
        "title": "Content Writing & Copywriting Mastery",
        "description": "Write compelling copy that converts. Learn SEO writing, email marketing copy, and engaging content creation techniques.",
        "difficulty": "Beginner",
        "duration_hours": 18,
        "category": "Marketing",
        "thumbnail_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500",
        "modules": [
            {
                "title": "Module 1: Writing Fundamentals",
                "lessons": [
                    {"title": "Audience Analysis", "duration": 15},
                    {"title": "Tone & Voice", "duration": 15},
                    {"title": "Structure & Flow", "duration": 15},
                ]
            },
            {
                "title": "Module 2: Web Copywriting",
                "lessons": [
                    {"title": "SEO Writing", "duration": 15},
                    {"title": "Landing Pages", "duration": 20},
                    {"title": "Email Marketing", "duration": 15},
                ]
            },
        ]
    },
    {
        "title": "Video Production & Editing Fundamentals",
        "description": "Create professional videos from concept to final edit. Learn cinematography, editing, sound design, and color grading.",
        "difficulty": "Beginner",
        "duration_hours": 32,
        "category": "Creative Design",
        "thumbnail_url": "https://images.unsplash.com/photo-1535016120754-e51c14550e60?w=500",
        "modules": [
            {
                "title": "Module 1: Video Production",
                "lessons": [
                    {"title": "Camera Basics", "duration": 25},
                    {"title": "Lighting & Composition", "duration": 25},
                    {"title": "Audio Recording", "duration": 20},
                ]
            },
            {
                "title": "Module 2: Editing & Post-Production",
                "lessons": [
                    {"title": "Editing Software", "duration": 25},
                    {"title": "Color Grading", "duration": 25},
                    {"title": "Sound Design", "duration": 20},
                ]
            },
        ]
    },
]

try:
    print("[INFO] Starting comprehensive database seeding...")

    # Clear existing lessons to avoid duplicates
    db.query(Lesson).delete()
    db.commit()

    # Get all courses
    courses = db.query(Course).all()
    print(f"[INFO] Found {len(courses)} courses in database")

    for idx, course in enumerate(courses):
        if idx < len(courses_data):
            course_info = courses_data[idx]
            print(f"\n[INFO] Adding lessons for: {course.title}")

            lesson_order = 1
            for module_idx, module in enumerate(course_info.get("modules", [])):
                print(f"  - Module {module_idx + 1}: {module['title']}")

                for lesson in module.get("lessons", []):
                    db_lesson = Lesson(
                        course_id=course.id,
                        title=lesson["title"],
                        order=lesson_order,
                        duration_minutes=lesson.get("duration", 20),
                        content_markdown=f"# {lesson['title']}\n\nContent for {lesson['title']} in {module['title']}.",
                        learning_objectives=f"Learn {lesson['title'].lower()}",
                        key_concepts=lesson["title"],
                    )
                    db.add(db_lesson)
                    print(f"    - {lesson['title']} ({lesson.get('duration', 20)} min)")
                    lesson_order += 1

    db.commit()
    print("\n[SUCCESS] Database seeding completed!")
    print(f"[INFO] Added lessons for all {len(courses)} courses")

except Exception as e:
    db.rollback()
    print(f"[ERROR] Seeding failed: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
