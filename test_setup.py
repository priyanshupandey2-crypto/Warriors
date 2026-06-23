"""Quick test to verify setup is working"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from current directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

print("=" * 60)
print("AI Generation Layer - Setup Verification")
print("=" * 60)

# 1. Check HuggingFace token
hf_token = os.getenv("HUGGINGFACE_API_KEY")
if hf_token:
    print("\n[OK] HuggingFace token found")
    print(f"    Token: {hf_token[:20]}...")
else:
    print("\n[ERROR] HuggingFace token NOT found!")
    print("    Create a .env file with: HUGGINGFACE_API_KEY=hf_your_token")
    exit(1)

# 2. Check imports work
print("\n[TEST] Checking imports...")
try:
    # Import directly from modules (no package wrapper)
    import importlib.util

    # Load modules dynamically
    spec = importlib.util.spec_from_file_location("generation_layer", Path(__file__).parent / "generation_layer.py")
    gen_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gen_module)
    AIGenerationLayer = gen_module.AIGenerationLayer

    spec = importlib.util.spec_from_file_location("schemas", Path(__file__).parent / "schemas.py")
    schema_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(schema_module)
    GenerationRequest = schema_module.GenerationRequest
    DifficultyLevel = schema_module.DifficultyLevel

    spec = importlib.util.spec_from_file_location("utils", Path(__file__).parent / "utils.py")
    utils_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(utils_module)
    save_generation_result = utils_module.save_generation_result
    print_course_summary = utils_module.print_course_summary

    print("[OK] All imports successful")
except Exception as e:
    print(f"[ERROR] Import failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# 3. Check schemas work
print("\n[TEST] Checking schema validation...")
try:
    request = GenerationRequest(
        topic="Test Course",
        difficulty=DifficultyLevel.BEGINNER,
        target_audience="Test Users",
        duration_weeks=4,
        tags=["test"],
    )
    print("[OK] GenerationRequest created successfully")
    print(f"    Topic: {request.topic}")
    print(f"    Difficulty: {request.difficulty.value}")
except Exception as e:
    print(f"[ERROR] Schema validation failed: {e}")
    exit(1)

# 4. Check generation layer initialization
print("\n[TEST] Checking generation layer...")
try:
    layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")
    print("[OK] AIGenerationLayer initialized")
    print(f"    Model: {layer.model}")
except Exception as e:
    print(f"[ERROR] Generation layer init failed: {e}")
    exit(1)

print("\n" + "=" * 60)
print("[SUCCESS] All setup checks passed!")
print("=" * 60)
print("\nYou're ready to generate courses!")
print("Run: python ai_layer/example_usage.py")
