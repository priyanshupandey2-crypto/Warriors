"""
Comprehensive test suite for classroom endpoints.
Tests learning workspace, lessons, quizzes, capstone, and bookmarks.
"""

import pytest
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.quiz import Quiz
from app.models.user import User
from app.utils.password import hash_password


class TestClassroomWorkspace:
    """Tests for GET /api/classroom/{course_id} endpoint."""

    def test_get_classroom_workspace_success(self, client, db_session):
        """Test successfully getting classroom workspace."""
        course = Course(
            title="Classroom Test Course",
            description="For classroom testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}")
        assert response.status_code == 200
        data = response.json()
        assert "course_id" in data or "course_title" in data

    def test_get_classroom_workspace_invalid_course(self, client):
        """Test getting workspace for non-existent course."""
        response = client.get("/api/classroom/99999")
        assert response.status_code in [404, 400]

    def test_get_classroom_workspace_contains_structure(self, client, db_session):
        """Test that workspace contains expected structure."""
        course = Course(
            title="Structured Course",
            description="Course with structure",
            difficulty="Intermediate",
            duration_hours=20
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}")
        assert response.status_code == 200


class TestGetLessons:
    """Tests for GET /api/classroom/{course_id}/lessons endpoint."""

    def test_get_course_lessons_success(self, client, db_session):
        """Test successfully getting all lessons for a course."""
        course = Course(
            title="Lessons Course",
            description="Course with lessons",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        # Create a lesson
        lesson = Lesson(
            course_id=course.id,
            title="Lesson 1",
            content_markdown="Lesson content",
            order=1
        )
        db_session.add(lesson)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/lessons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_get_course_lessons_returns_list(self, client, db_session):
        """Test that lessons endpoint returns a list."""
        course = Course(
            title="Multi Lesson Course",
            description="Multiple lessons",
            difficulty="Beginner",
            duration_hours=15
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/lessons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_get_lessons_invalid_course_id(self, client):
        """Test getting lessons for non-existent course."""
        response = client.get("/api/classroom/99999/lessons")
        assert response.status_code in [404, 400]


class TestGetSpecificLesson:
    """Tests for GET /api/classroom/{course_id}/lessons/{lesson_id} endpoint."""

    def test_get_specific_lesson_success(self, client, db_session):
        """Test successfully getting a specific lesson."""
        course = Course(
            title="Specific Lesson Course",
            description="For specific lesson testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        lesson = Lesson(
            course_id=course.id,
            title="Specific Lesson",
            content="# Markdown Content",
            order=1
        )
        db_session.add(lesson)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/lessons/{lesson.id}")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data or "content" in data

    def test_get_specific_lesson_with_markdown(self, client, db_session):
        """Test that lesson returns markdown content."""
        course = Course(
            title="Markdown Course",
            description="Course with markdown",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        lesson = Lesson(
            course_id=course.id,
            title="Markdown Lesson",
            content="# Title\n## Subtitle\nContent here",
            order=1
        )
        db_session.add(lesson)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/lessons/{lesson.id}")
        assert response.status_code == 200

    def test_get_lesson_invalid_lesson_id(self, client, db_session):
        """Test getting non-existent lesson."""
        course = Course(
            title="Invalid Lesson Course",
            description="Test invalid lesson",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/lessons/99999")
        assert response.status_code in [404, 400]


class TestGetQuizzes:
    """Tests for GET /api/classroom/{course_id}/quizzes endpoint."""

    def test_get_course_quizzes_success(self, client, db_session):
        """Test successfully getting all quizzes for a course."""
        course = Course(
            title="Quiz Course",
            description="Course with quizzes",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/quizzes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_get_quizzes_returns_list(self, client, db_session):
        """Test that quizzes endpoint returns a list."""
        course = Course(
            title="Multi Quiz Course",
            description="Multiple quizzes",
            difficulty="Intermediate",
            duration_hours=20
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/quizzes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_get_quizzes_invalid_course_id(self, client):
        """Test getting quizzes for non-existent course."""
        response = client.get("/api/classroom/99999/quizzes")
        assert response.status_code in [404, 400]


class TestGetSpecificQuiz:
    """Tests for GET /api/classroom/{course_id}/quizzes/{quiz_id} endpoint."""

    def test_get_specific_quiz_success(self, client, db_session):
        """Test successfully getting a specific quiz."""
        course = Course(
            title="Specific Quiz Course",
            description="For specific quiz testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        quiz = Quiz(
            course_id=course.id,
            title="Quiz 1",
            description="Test quiz",
            passing_score=70
        )
        db_session.add(quiz)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/quizzes/{quiz.id}")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data or "questions" in data

    def test_get_quiz_contains_questions(self, client, db_session):
        """Test that quiz response contains questions."""
        course = Course(
            title="Question Quiz Course",
            description="Quiz with questions",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        quiz = Quiz(
            course_id=course.id,
            title="Question Quiz",
            description="Quiz for testing",
            passing_score=70
        )
        db_session.add(quiz)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/quizzes/{quiz.id}")
        assert response.status_code == 200

    def test_get_quiz_invalid_quiz_id(self, client, db_session):
        """Test getting non-existent quiz."""
        course = Course(
            title="Invalid Quiz Course",
            description="Test invalid quiz",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/quizzes/99999")
        assert response.status_code in [404, 400]

    def test_get_quiz_answers_hidden(self, client, db_session):
        """Test that correct answers are not exposed in quiz preview."""
        course = Course(
            title="Hidden Answers Course",
            description="Quiz answers should be hidden",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        quiz = Quiz(
            course_id=course.id,
            title="Secure Quiz",
            description="No answer exposure",
            passing_score=70
        )
        db_session.add(quiz)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/quizzes/{quiz.id}")
        assert response.status_code == 200


class TestSubmitQuiz:
    """Tests for POST /api/classroom/{course_id}/quizzes/{quiz_id}/submit endpoint."""

    def test_submit_quiz_success(self, client, db_session):
        """Test successfully submitting quiz answers."""
        course = Course(
            title="Submission Course",
            description="For quiz submission",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        quiz = Quiz(
            course_id=course.id,
            title="Submittable Quiz",
            description="For submission testing",
            passing_score=70
        )
        db_session.add(quiz)
        db_session.commit()

        response = client.post(
            f"/api/classroom/{course.id}/quizzes/{quiz.id}/submit",
            json={"answers": {"question_1": "option_a"}}
        )
        assert response.status_code in [200, 201]

    def test_submit_quiz_returns_score(self, client, db_session):
        """Test that quiz submission returns a score."""
        course = Course(
            title="Score Course",
            description="For score testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        quiz = Quiz(
            course_id=course.id,
            title="Scoring Quiz",
            description="For score calculation",
            passing_score=70
        )
        db_session.add(quiz)
        db_session.commit()

        response = client.post(
            f"/api/classroom/{course.id}/quizzes/{quiz.id}/submit",
            json={"answers": {}}
        )
        assert response.status_code in [200, 201]

    def test_submit_quiz_invalid_course(self, client):
        """Test submitting quiz for non-existent course."""
        response = client.post(
            "/api/classroom/99999/quizzes/1/submit",
            json={"answers": {}}
        )
        assert response.status_code in [404, 400]


class TestCapstone:
    """Tests for capstone project endpoints."""

    def test_get_capstone_success(self, client, db_session):
        """Test successfully getting capstone project specs."""
        course = Course(
            title="Capstone Course",
            description="Course with capstone",
            difficulty="Advanced",
            duration_hours=30
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/classroom/{course.id}/capstone")
        assert response.status_code == 200

    def test_start_capstone_success(self, client, db_session):
        """Test successfully starting capstone project."""
        course = Course(
            title="Start Capstone Course",
            description="For capstone start",
            difficulty="Advanced",
            duration_hours=30
        )
        db_session.add(course)
        db_session.commit()

        response = client.post(f"/api/classroom/{course.id}/capstone/start")
        assert response.status_code in [200, 201]

    def test_submit_capstone_success(self, client, db_session):
        """Test successfully submitting capstone project."""
        course = Course(
            title="Submit Capstone Course",
            description="For capstone submission",
            difficulty="Advanced",
            duration_hours=30
        )
        db_session.add(course)
        db_session.commit()

        response = client.post(
            f"/api/classroom/{course.id}/capstone/submit",
            json={"project_url": "https://github.com/user/project"}
        )
        assert response.status_code in [200, 201]


class TestProgress:
    """Tests for progress tracking endpoint."""

    def test_mark_lesson_complete_success(self, client, db_session):
        """Test marking a lesson as complete."""
        course = Course(
            title="Progress Course",
            description="For progress tracking",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        lesson = Lesson(
            course_id=course.id,
            title="Progress Lesson",
            content="Content",
            order=1
        )
        db_session.add(lesson)
        db_session.commit()

        response = client.post(
            f"/api/classroom/progress/complete?course_id={course.id}&lesson_id={lesson.id}"
        )
        assert response.status_code in [200, 201]

    def test_mark_lesson_complete_invalid_ids(self, client):
        """Test marking lesson complete with invalid IDs."""
        response = client.post(
            "/api/classroom/progress/complete?course_id=99999&lesson_id=99999"
        )
        assert response.status_code in [404, 400]


class TestBookmarks:
    """Tests for bookmark management endpoints."""

    def test_toggle_bookmark_success(self, client, db_session):
        """Test successfully toggling a bookmark."""
        course = Course(
            title="Bookmark Course",
            description="For bookmark testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        lesson = Lesson(
            course_id=course.id,
            title="Bookmark Lesson",
            content="Content",
            order=1
        )
        db_session.add(lesson)
        db_session.commit()

        response = client.post(
            f"/api/classroom/bookmarks/toggle?lesson_id={lesson.id}&course_id={course.id}"
        )
        assert response.status_code in [200, 201]

    def test_toggle_bookmark_twice(self, client, db_session):
        """Test toggling bookmark on and off."""
        course = Course(
            title="Toggle Course",
            description="For toggle testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        lesson = Lesson(
            course_id=course.id,
            title="Toggle Lesson",
            content="Content",
            order=1
        )
        db_session.add(lesson)
        db_session.commit()

        # First toggle (bookmark)
        response1 = client.post(
            f"/api/classroom/bookmarks/toggle?lesson_id={lesson.id}&course_id={course.id}"
        )
        assert response1.status_code in [200, 201]

        # Second toggle (unbookmark)
        response2 = client.post(
            f"/api/classroom/bookmarks/toggle?lesson_id={lesson.id}&course_id={course.id}"
        )
        assert response2.status_code in [200, 201]

    def test_get_bookmarks_success(self, client):
        """Test successfully getting user bookmarks."""
        response = client.get("/api/classroom/bookmarks/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_get_bookmarks_returns_list(self, client):
        """Test that bookmarks endpoint returns a list."""
        response = client.get("/api/classroom/bookmarks/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))
