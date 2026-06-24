"""
Audit Logging Utility
=====================

Helper functions to log admin actions and system changes
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.logger import get_logger

logger = get_logger(__name__)


def log_audit(
    db: Session,
    admin_id: int,
    admin_email: str,
    action: str,
    resource_type: str,
    resource_id: int,
    resource_name: str = None,
    status: str = "Success",
    details: str = None,
    ip_address: str = None,
    changes_before: str = None,
    changes_after: str = None,
):
    """
    Create an audit log entry for an admin action.

    Args:
        db: Database session
        admin_id: ID of admin who performed action
        admin_email: Email of admin
        action: Type of action (CREATE, UPDATE, DELETE, APPROVE, REJECT)
        resource_type: Type of resource (Course, Lesson, Quiz, Submission)
        resource_id: ID of the affected resource
        resource_name: Name/title of resource (optional)
        status: Status of action (Success, Failed)
        details: Additional details about the action
        ip_address: IP address of the request (optional)
        changes_before: JSON of data before changes (optional)
        changes_after: JSON of data after changes (optional)
    """
    try:
        audit_log = AuditLog(
            admin_id=admin_id,
            admin_email=admin_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            resource_name=resource_name,
            status=status,
            details=details,
            ip_address=ip_address,
            changes_before=changes_before,
            changes_after=changes_after,
            timestamp=datetime.utcnow(),
        )
        db.add(audit_log)
        db.commit()
        logger.info(f"Audit: {action} {resource_type} {resource_id} by {admin_email} - {status}")
    except Exception as e:
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
        # Don't raise - audit failures shouldn't break main operations
