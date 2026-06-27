"""
Audit Log Model
===============

Table: audit_logs
Purpose: Tracks all admin actions and system changes for compliance and monitoring

Relationships:
    - Many logs belong to one admin user (who performed the action)
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class AuditLog(Base):
    """
    Represents an audit log entry for an admin action.

    Attributes:
        id: Unique audit log identifier (Primary Key)
        admin_id: Admin user who performed the action (FK to users table)
        admin_email: Email of admin for quick reference
        action: Type of action - CREATE, UPDATE, DELETE, APPROVE, REJECT
        resource_type: Type of resource affected - Course, Lesson, Quiz, Submission, etc.
        resource_id: ID of the affected resource
        resource_name: Name/title of the affected resource
        timestamp: When the action was performed
        status: Status of the action - Success, Failed
        details: Additional details about what was changed
        ip_address: IP address from which the action was performed (optional)
        changes_before: JSON representation of data before changes (optional)
        changes_after: JSON representation of data after changes (optional)
    """

    __tablename__ = "audit_logs"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys & Metadata
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    admin_email = Column(String(255), nullable=False, index=True)

    # Action Details
    action = Column(String(50), nullable=False, index=True)
    # Values: CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.

    resource_type = Column(String(50), nullable=False, index=True)
    # Values: Course, Lesson, Quiz, Submission, Module, etc.

    resource_id = Column(Integer, nullable=False, index=True)
    resource_name = Column(String(255), nullable=True)

    # Timestamp & Status
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status = Column(String(50), default="Success", nullable=False)
    # Values: Success, Failed

    # Details
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    changes_before = Column(Text, nullable=True)
    changes_after = Column(Text, nullable=True)

    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])

    # Index for common queries
    __table_args__ = (
        Index("idx_admin_timestamp", "admin_id", "timestamp"),
        Index("idx_resource_timestamp", "resource_type", "resource_id", "timestamp"),
        Index("idx_action_timestamp", "action", "timestamp"),
    )

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', resource='{self.resource_type}:{self.resource_id}')>"
