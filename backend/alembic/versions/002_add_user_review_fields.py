"""Add user review fields to course_generations table

Revision ID: 002
Revises: 001_admin_setup
Create Date: 2026-06-27
"""

from alembic import op
import sqlalchemy as sa


revision = '002'
down_revision = '001_admin_setup'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('course_generations',
                  sa.Column('user_submitted_at', sa.DateTime(), nullable=True))
    op.add_column('course_generations',
                  sa.Column('user_feedback', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('course_generations', 'user_feedback')
    op.drop_column('course_generations', 'user_submitted_at')
