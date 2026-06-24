"""
Seed script to populate the database with mock course data.
Run this from the backend directory: python seed_courses.py
"""

from app.database import get_db, SessionLocal
from app.models.course import Course
from datetime import datetime

mock_courses = [
    {
        "title": "UI/UX Design Fundamentals for Modern Products",
        "description": "Master the principles of user experience and interface design. Learn to create intuitive, beautiful, and functional digital products that users love.",
        "difficulty": "Intermediate",
        "duration_hours": 30,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBooGc5QJtuxOHshZMexrY_wyFLz5LL9N39tiT-WVVMw7tRNpDoIX-YPgEY8a4-5CtBAj8qP269EtqjgczzbuGyHyj6_j4hlRQrga8DATDrpH_2k4JKmA52zrXQPVm_j6AQMULxRvDytBsK46ch-osXUYV5WZAOBqy-Y4NyTQPekqTvDD2y9mvCLAfHpTrf4RQxv2raIMSxCucXzgpTj94hYbDUx_nN6rdkx-CJ-DlV6LamPvCwjduk8FguF_uCk4XUsBIJK4A3fWAI",
        "status": "published",
    },
    {
        "title": "Advanced Python Algorithms & Data Structures",
        "description": "Deep dive into advanced algorithms and data structures using Python. Optimize your code for performance and solve complex computational problems efficiently.",
        "difficulty": "Advanced",
        "duration_hours": 45,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyAFTx27UIQBf_RCR806ZHhhswqxc9rOI6DOh8EOJ7cHYCZFy6wiOdsuTcdoIK0mqya4CoLm9SH_og-h1cThwFvFJ13qSYPBTO3-xLs02GPCSvhQ3FUrqrRVzzDmdXCOG_oxLT37mRiwbe6eqPXCUTxwS_QK7H3EbbQ71_0Mzs8LuEQlkfBYD3VG4uurnTE16l-6a2mD310h26NztRriTdaNXqkp-qBn0srJnOXRnO76NtxXZPajBOmdjd0ogI65avPvdtBdIN5VP2",
        "status": "published",
    },
    {
        "title": "Mastering Digital Marketing & Growth Hacking",
        "description": "Learn modern digital marketing strategies, growth hacking techniques, and data-driven approaches to scale your business online.",
        "difficulty": "Beginner",
        "duration_hours": 20,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAIrhWYbr5QO_CXNNRaUMqEVlbY6EBtzr7gsC5QGPOHPyFoJZ7T7T8G25Ga_HGlfNjgILFCq7gON9Cv5GU3f0FAw8oXLaqpLjnnF6pgfeI4yzlaOlkxwm4DAgxJUFER7sNM5Ks-QGqSbib5MzNqLt15BXyx7bKB1eg6JmRAJ1PbfCICbAo7OTSC2WKT2mAWYaqG-oILoyLHjuUe8NTOA4Kxh3Zir5Oz7qSNRXDL_4LW9x4n6KaH8ZmFMWS653b3SHCX33baDWnKMPOe",
        "status": "published",
    },
    {
        "title": "Intro to Artificial Intelligence & Neural Networks",
        "description": "Get started with AI and machine learning. Understand neural networks, train your first models, and explore the future of intelligent systems.",
        "difficulty": "Beginner",
        "duration_hours": 35,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKkp4xkRkQ9Kn9mQ6RqsXSpK0niIqTzpE4spE1nVKFsoESnBL_tCqnPNWbezhx9SfiWy5GRBuK0g-lLH3J0mo_Ih9evuiJ4_sq8VwFO-ychH2CTYuu0CNe59ZuD40WVXuhgGu-D39QFk3APggYK1G5Iq0qdamPsKcYzdu8Ga1kKxOpc2ILmc0YfqwNH9yBDbL8k0IyKdoKFbBQiB3JGiOQIv2dBA-hbuvJl_Qb88Dcu8ZMoY1Way2KTh8mSzO1VakP16lQFEEaQtql",
        "status": "published",
    },
    {
        "title": "Professional Brand Identity Design",
        "description": "Create compelling brand identities from scratch. Learn logo design, color theory, typography, and build cohesive visual systems.",
        "difficulty": "Intermediate",
        "duration_hours": 28,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCVCTfV0hAVREREPUKkUe5O8TBOP-zbWT_htIvnRphm9VgneJpWnLPgskc-zxDjeevBAotRVzYzEdFfnuvm6brwD7K5ZBDA4RhXAk-06rXBkUcSUDyeYC9qkG6VifREUCepyiVPyKsCXStXz_YqDHxJG0SUw-WeKM2j_wSsoIrVSia7RkrT7J_eH_XT4Fg-8oUmcUpJRHogpkQIRRkEFhpj20DnMgrM-OuzZiwV1UQ2z23Cu3dbwHzsd9Ovs12X39yf8Ks9A6Wmy5LW",
        "status": "published",
    },
    {
        "title": "Strategic Leadership & Management 2024",
        "description": "Develop leadership skills and strategic thinking abilities. Learn management techniques, team dynamics, and modern organizational practices.",
        "difficulty": "Advanced",
        "duration_hours": 32,
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAWIBBBaUgZf421HNntuZMFNmuvQmYMTSasF_D73n8E3548iLzcGgHyQhHBPgSDZOHagL24uO1biXLt0EIAm_gw5xP4c_0wt0frCFZGWR1jCX4DQlEqfG3NUV6_Qtji1vLNMPUouTWlq5WO2TP6eYy_3k-l88I86YvfGIHb2o5xjc49focncXa-PREBO8I862SuHasH7ZxKTgPuNhxJmJAWZ2-I6kXAYtqQt6KY_ngx2oSnG9gZOrx1Ifggawyta82tze-EThvwyNTb",
        "status": "published",
    },
    {
        "title": "Web Development Bootcamp: Full Stack 2024",
        "description": "Complete guide to full-stack web development. Learn frontend, backend, databases, and deploy production-ready applications.",
        "difficulty": "Intermediate",
        "duration_hours": 60,
        "thumbnail_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
        "status": "published",
    },
    {
        "title": "Data Science with Python & Machine Learning",
        "description": "Master data science techniques using Python. Work with real datasets, build predictive models, and visualize insights.",
        "difficulty": "Intermediate",
        "duration_hours": 50,
        "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        "status": "published",
    },
    {
        "title": "Mobile App Development with React Native",
        "description": "Build iOS and Android apps using React Native. Learn to create cross-platform applications with JavaScript.",
        "difficulty": "Intermediate",
        "duration_hours": 40,
        "thumbnail_url": "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500",
        "status": "published",
    },
    {
        "title": "Cloud Computing with AWS & Azure",
        "description": "Deploy and manage applications on cloud platforms. Learn AWS and Azure services, scalability, and best practices.",
        "difficulty": "Advanced",
        "duration_hours": 48,
        "thumbnail_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
        "status": "published",
    },
    {
        "title": "Content Writing & Copywriting Mastery",
        "description": "Write compelling copy that converts. Learn SEO writing, email marketing copy, and engaging content creation techniques.",
        "difficulty": "Beginner",
        "duration_hours": 18,
        "thumbnail_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500",
        "status": "published",
    },
    {
        "title": "Video Production & Editing Fundamentals",
        "description": "Create professional videos from concept to final edit. Learn cinematography, editing, sound design, and color grading.",
        "difficulty": "Beginner",
        "duration_hours": 32,
        "thumbnail_url": "https://images.unsplash.com/photo-1535016120754-e51c14550e60?w=500",
        "status": "published",
    },
]

def seed_database():
    """Add mock courses to the database"""
    db = SessionLocal()

    try:
        # Check if courses already exist
        existing_count = db.query(Course).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} courses. Skipping seed.")
            return

        # Add mock courses
        for course_data in mock_courses:
            course = Course(**course_data)
            db.add(course)

        db.commit()
        print(f"[SUCCESS] Added {len(mock_courses)} courses to the database!")

        # Verify
        total = db.query(Course).count()
        print(f"[INFO] Total courses in database: {total}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
