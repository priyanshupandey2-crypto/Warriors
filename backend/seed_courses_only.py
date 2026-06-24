"""
Seed script to create courses only (no modules/lessons)
Run: python seed_courses_only.py
Then run: python seed_modules_and_lessons.py
"""

from app.database import SessionLocal
from app.models.course import Course
from datetime import datetime

db = SessionLocal()

courses_data = [
    {
        "title": "UI/UX Design Fundamentals for Modern Products",
        "description": "Master the principles of user experience and interface design. Learn to create intuitive, beautiful, and functional digital products that users love.",
        "difficulty": "Intermediate",
        "duration_hours": 30,
        "category": "Creative Design",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBooGc5QJtuxOHshZMexrY_wyFLz5LL9N39tiT-WVVMw7tRNpDoIX-YPgEY8a4-5CtBAj8qP269EtqjgczzbuGyHyj6_j4hlRQrga8DATDrpH_2k4JKmA52zrXQPVm_j6AQMULxRvDytBsK46ch-osXUYV5WZAOBqy-Y4NyTQPekqTvDD2y9mvCLAfHpTrf4RQxv2raIMSxCucXzgpTj94hYbDUx_nN6rdkx-CJ-DlV6LamPvCwjduk8FguF_uCk4XUsBIJK4A3fWAI",
    },
    {
        "title": "Advanced Python Algorithms & Data Structures",
        "description": "Deep dive into advanced algorithms and data structures using Python. Optimize your code for performance and solve complex computational problems efficiently.",
        "difficulty": "Advanced",
        "duration_hours": 45,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyAFTx27UIQBf_RCR806ZHhhswqxc9rOI6DOh8EOJ7cHYCZFy6wiOdsuTcdoIK0mqya4CoLm9SH_og-h1cThwFvFJ13qSYPBTO3-xLs02GPCSvhQ3FUrqrRVzzDmdXCOG_oxLT37mRiwbe6eqPXCUTxwS_QK7H3EbbQ71_0Mzs8LuEQlkfBYD3VG4uurnTE16l-6a2mD310h26NztRriTdaNXqkp-qBn0srJnOXRnO76NtxXZPajBOmdjd0ogI65avPvdtBdIN5VP2",
    },
    {
        "title": "Mastering Digital Marketing & Growth Hacking",
        "description": "Learn modern digital marketing strategies, growth hacking techniques, and data-driven approaches to scale your business online.",
        "difficulty": "Beginner",
        "duration_hours": 20,
        "category": "Marketing",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAIrhWYbr5QO_CXNNRaUMqEVlbY6EBtzr7gsC5QGPOHPyFoJZ7T7T8G25Ga_HGlfNjgILFCq7gON9Cv5GU3f0FAw8oXLaqpLjnnF6pgfeI4yzlaOlkxwm4DAgxJUFER7sNM5Ks-QGqSbib5MzNqLt15BXyx7bKB1eg6JmRAJ1PbfCICbAo7OTSC2WKT2mAWYaqG-oILoyLHjuUe8NTOA4Kxh3Zir5Oz7qSNRXDL_4LW9x4n6KaH8ZmFMWS653b3SHCX33baDWnKMPOe",
    },
    {
        "title": "Intro to Artificial Intelligence & Neural Networks",
        "description": "Get started with AI and machine learning. Understand neural networks, train your first models, and explore the future of intelligent systems.",
        "difficulty": "Beginner",
        "duration_hours": 35,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKkp4xkRkQ9Kn9mQ6RqsXSpK0niIqTzpE4spE1nVKFsoESnBL_tCqnPNWbezhx9SfiWy5GRBuK0g-lLH3J0mo_Ih9evuiJ4_sq8VwFO-ychH2CTYuu0CNe59ZuD40WVXuhgGu-D39QFk3APggYK1G5Iq0qdamPsKcYzdu8Ga1kKxOpc2ILmc0YfqwNH9yBDbL8k0IyKdoKFbBQiB3JGiOQIv2dBA-hbuvJl_Qb88Dcu8ZMoY1Way2KTh8mSzO1VakP16lQFEEaQtql",
    },
    {
        "title": "Professional Brand Identity Design",
        "description": "Create compelling brand identities from scratch. Learn logo design, color theory, typography, and build cohesive visual systems.",
        "difficulty": "Intermediate",
        "duration_hours": 28,
        "category": "Creative Design",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCVCTfV0hAVREREPUKkUe5O8TBOP-zbWT_htIvnRphm9VgneJpWnLPgskc-zxDjeevBAotRVzYzEdFfnuvm6brwD7K5ZBDA4RhXAk-06rXBkUcSUDyeYC9qkG6VifREUCepyiVPyKsCXStXz_YqDHxJG0SUw-WeKM2j_wSsoIrVSia7RkrT7J_eH_XT4Fg-8oUmcUpJRHogpkQIRRkEFhpj20DnMgrM-OuzZiwV1UQ2z23Cu3dbwHzsd9Ovs12X39yf8Ks9A6Wmy5LW",
    },
    {
        "title": "Essential Leadership & Team Management",
        "description": "Develop leadership skills and master the art of building high-performing teams. Learn conflict resolution, decision-making, and modern management techniques.",
        "difficulty": "Intermediate",
        "duration_hours": 25,
        "category": "Business & Strategy",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuB1X-Dk_Qlp6F8JQqT9LN0IpkE5vX-VvYrQk4vS5LqV5pNEKKKHxZqj_LPpzNjO9sJv8C_1Xsm-CWqpyTVHfHqhPj7p1VqIFvJNQHMTYp1c3S1QMvqvzvC8sUkJq_lNQQmkPJdvTI8",
    },
    {
        "title": "Full Stack Web Development Bootcamp",
        "description": "Learn full stack web development from HTML/CSS to React frontend and Node.js backend. Deploy production-ready applications.",
        "difficulty": "Advanced",
        "duration_hours": 60,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyAFTx27UIQBf_RCR806ZHhhswqxc9rOI6DOh8EOJ7cHYCZFy6wiOdsuTcdoIK0mqya4CoLm9SH_og-h1cThwFvFJ13qSYPBTO3-xLs02GPCSvhQ3FUrqrRVzzDmdXCOG_oxLT37mRiwbe6eqPXCUTxwS_QK7H3EbbQ71_0Mzs8LuEQlkfBYD3VG4uurnTE16l-6a2mD310h26NztRriTdaNXqkp-qBn0srJnOXRnO76NtxXZPajBOmdjd0ogI65avPvdtBdIN5VP2",
    },
    {
        "title": "Data Science & Machine Learning with Python",
        "description": "Master data science fundamentals, exploratory analysis, and machine learning algorithms. Build predictive models and work with real datasets.",
        "difficulty": "Advanced",
        "duration_hours": 50,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKkp4xkRkQ9Kn9mQ6RqsXSpK0niIqTzpE4spE1nVKFsoESnBL_tCqnPNWbezhx9SfiWy5GRBuK0g-lLH3J0mo_Ih9evuiJ4_sq8VwFO-ychH2CTYuu0CNe59ZuD40WVXuhgGu-D39QFk3APggYK1G5Iq0qdamPsKcYzdu8Ga1kKxOpc2ILmc0YfqwNH9yBDbL8k0IyKdoKFbBQiB3JGiOQIv2dBA-hbuvJl_Qb88Dcu8ZMoY1Way2KTh8mSzO1VakP16lQFEEaQtql",
    },
    {
        "title": "Mobile App Development with React Native",
        "description": "Build cross-platform mobile apps for iOS and Android using React Native. Learn state management, navigation, and API integration.",
        "difficulty": "Intermediate",
        "duration_hours": 40,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyAFTx27UIQBf_RCR806ZHhhswqxc9rOI6DOh8EOJ7cHYCZFy6wiOdsuTcdoIK0mqya4CoLm9SH_og-h1cThwFvFJ13qSYPBTO3-xLs02GPCSvhQ3FUrqrRVzzDmdXCOG_oxLT37mRiwbe6eqPXCUTxwS_QK7H3EbbQ71_0Mzs8LuEQlkfBYD3VG4uurnTE16l-6a2mD310h26NztRriTdaNXqkp-qBn0srJnOXRnO76NtxXZPajBOmdjd0ogI65avPvdtBdIN5VP2",
    },
    {
        "title": "Cloud Computing with AWS & Azure",
        "description": "Master cloud platforms and deploy scalable applications. Learn about EC2, S3, Lambda, and serverless architecture.",
        "difficulty": "Advanced",
        "duration_hours": 45,
        "category": "Computer Science",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKkp4xkRkQ9Kn9mQ6RqsXSpK0niIqTzpE4spE1nVKFsoESnBL_tCqnPNWbezhx9SfiWy5GRBuK0g-lLH3J0mo_Ih9evuiJ4_sq8VwFO-ychH2CTYuu0CNe59ZuD40WVXuhgGu-D39QFk3APggYK1G5Iq0qdamPsKcYzdu8Ga1kKxOpc2ILmc0YfqwNH9yBDbL8k0IyKdoKFbBQiB3JGiOQIv2dBA-hbuvJl_Qb88Dcu8ZMoY1Way2KTh8mSzO1VakP16lQFEEaQtql",
    },
    {
        "title": "Content Writing & Copywriting Mastery",
        "description": "Learn to write compelling content for web, blogs, and marketing. Master SEO writing, landing pages, and persuasive copywriting techniques.",
        "difficulty": "Beginner",
        "duration_hours": 22,
        "category": "Marketing",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAIrhWYbr5QO_CXNNRaUMqEVlbY6EBtzr7gsC5QGPOHPyFoJZ7T7T8G25Ga_HGlfNjgILFCq7gON9Cv5GU3f0FAw8oXLaqpLjnnF6pgfeI4yzlaOlkxwm4DAgxJUFER7sNM5Ks-QGqSbib5MzNqLt15BXyx7bKB1eg6JmRAJ1PbfCICbAo7OTSC2WKT2mAWYaqG-oILoyLHjuUe8NTOA4Kxh3Zir5Oz7qSNRXDL_4LW9x4n6KaH8ZmFMWS653b3SHCX33baDWnKMPOe",
    },
    {
        "title": "Professional Video Production & Editing",
        "description": "Learn video production from camera work to post-production. Master editing software, color grading, and sound design.",
        "difficulty": "Intermediate",
        "duration_hours": 35,
        "category": "Creative Design",
        "thumbnail_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCVCTfV0hAVREREPUKkUe5O8TBOP-zbWT_htIvnRphm9VgneJpWnLPgskc-zxDjeevBAotRVzYzEdFfnuvm6brwD7K5ZBDA4RhXAk-06rXBkUcSUDyeYC9qkG6VifREUCepyiVPyKsCXStXz_YqDHxJG0SUw-WeKM2j_wSsoIrVSia7RkrT7J_eH_XT4Fg-8oUmcUpJRHogpkQIRRkEFhpj20DnMgrM-OuzZiwV1UQ2z23Cu3dbwHzsd9Ovs12X39yf8Ks9A6Wmy5LW",
    },
]

def seed_courses():
    try:
        print("[INFO] Seeding courses...")
        for course_data in courses_data:
            course = Course(
                title=course_data["title"],
                description=course_data["description"],
                difficulty=course_data["difficulty"],
                duration_hours=course_data["duration_hours"],
                category=course_data.get("category"),
                thumbnail_url=course_data.get("thumbnail_url"),
                status="published",
                created_at=datetime.utcnow(),
            )
            db.add(course)
            print(f"  [OK] {course.title}")

        db.commit()
        print("\n[SUCCESS] Courses seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding courses: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_courses()
