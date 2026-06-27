#!/usr/bin/env python
"""Test course preview endpoint directly"""

import sys
import importlib

# Force fresh imports
for mod in list(sys.modules.keys()):
    if 'app' in mod:
        del sys.modules[mod]

from app.database import SessionLocal
from app.routers.courses import get_course_preview
import json

db = SessionLocal()
result = get_course_preview(1, db)
db.close()

# Check for quizzes in module 3
if len(result['modules']) >= 3:
    module_3 = result['modules'][2]
    print(f"Module 3: {module_3['title']}")
    print(f"  Lessons: {len(module_3.get('lessons', []))}")
    print(f"  Quizzes: {len(module_3.get('quizzes', []))}")

    if 'quizzes' in module_3:
        print(f"  Quiz details:")
        for quiz in module_3['quizzes']:
            print(f"    - {quiz['title']} ({quiz['question_count']} questions)")
    else:
        print("  ERROR: 'quizzes' key not found in module!")
        print(f"  Module keys: {list(module_3.keys())}")
