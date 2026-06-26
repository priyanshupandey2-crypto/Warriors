#!/usr/bin/env python
import os
import sys
from alembic.config import Config
from alembic.command import upgrade

os.chdir(os.path.dirname(os.path.abspath(__file__)))
cfg = Config("alembic.ini")

try:
    upgrade(cfg, "head")
    print("Migration completed successfully")
except Exception as e:
    print(f"Migration failed: {e}")
    sys.exit(1)
