"""
ADMIN DASHBOARD - Course Submission Model
==========================================

Table: course_submissions
Purpose: Tracks user submissions for course creation/editing
         Admins review and approve these before they become courses

Relationships:
    - Many submissions belong to one user (submitter)
    - One submission can be reviewed by one admin user
    - Approved submissions create a new Course record
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class CourseSubmission(Base):
    """
    Represents a user submission for a new course or course update.

    Attributes:
        id: Unique submission identifier (Primary Key)
        user_id: User who submitted the course (FK to users table)
        title: Course title submitted
        description: Course description
        content: Full course content/syllabus/curriculum
        submission_date: When the course was submitted
        status: Current status - pending, approved, or rejected
        type: Type of submission - "AI-Generated" or "User-Tailored"
        feedback: Admin's feedback (approval message or rejection reason)
        reviewed_by: Which admin reviewed this (FK to users table, optional)
        reviewed_at: When the admin reviewed this (optional)
        created_at: Record creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "course_submissions"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys & Submission Metadata
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)

    # Status & Tracking
    submission_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), default="pending", nullable=False, index=True)
    # Status values: "pending" (awaiting review), "approved" (accepted), "rejected" (declined)

    type = Column(String(50), nullable=True)
    # Type values: "AI-Generated" (created by AI), "User-Tailored" (user created)

    # Admin Review Information
    feedback = Column(Text, nullable=True)
    # Feedback from admin: approval message or rejection reason

    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Which admin user reviewed this submission

    reviewed_at = Column(DateTime, nullable=True)
    # When the admin reviewed this

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships - allows accessing related user objects
    user = relationship("User", foreign_keys=[user_id])
    # Access: submission.user.name, submission.user.email, etc.

    reviewer = relationship("User", foreign_keys=[reviewed_by])
    # Access: submission.reviewer.name (which admin reviewed it)

    def __repr__(self):
        return f"<CourseSubmission(id={self.id}, title='{self.title}', status='{self.status}')>"
