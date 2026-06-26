#!/usr/bin/env python
import os
import sys
from alembic.config import Config
from alembic.command import upgrade

# Change to the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Create alembic config
cfg = Config("alembic.ini")

# Run migration
try:
    upgrade(cfg, "head")
    print("✓ Migration completed successfully")
except Exception as e:
    print(f"✗ Migration failed: {e}")
    sys.exit(1)
