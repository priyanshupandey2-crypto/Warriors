"""Add admin fields to courses and create course submissions table

Revision ID: 001_admin_setup
Revises:
Create Date: 2026-06-24

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_admin_setup'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add new columns to courses table and create course_submissions table"""

    # Step 1: Add columns to existing courses table
    op.add_column('courses', sa.Column('category', sa.String(100), nullable=True))
    op.add_column('courses', sa.Column('lead_instructor', sa.String(100), nullable=True))
    op.add_column('courses', sa.Column('avg_rating', sa.Float(), server_default='0.0', nullable=False))

    # Step 2: Create course_submissions table
    op.create_table(
        'course_submissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('submission_date', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('type', sa.String(50), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_course_submissions_user_id', 'course_submissions', ['user_id'], unique=False)
    op.create_index('ix_course_submissions_status', 'course_submissions', ['status'], unique=False)


def downgrade():
    """Rollback migration - remove columns and table"""

    # Step 1: Drop indexes
    op.drop_index('ix_course_submissions_status', table_name='course_submissions')
    op.drop_index('ix_course_submissions_user_id', table_name='course_submissions')

    # Step 2: Drop course_submissions table
    op.drop_table('course_submissions')

    # Step 3: Remove columns from courses table
    op.drop_column('courses', 'avg_rating')
    op.drop_column('courses', 'lead_instructor')
    op.drop_column('courses', 'category')
