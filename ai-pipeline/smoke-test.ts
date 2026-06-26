import { validatePythonCode, validateStaticPatterns, validateTechStack, validateQuizConsistency } from './src/ai/validators';

async function runSmokeTests() {
  console.log("--- Running Validation Smoke Tests ---");

  // 1. Python Execution test (Syntax Error)
  try {
    console.log("Testing Python Code Validation with Syntax Error...");
    validatePythonCode(`
def train_model()
  print("Missing colon")
    `);
    console.log("❌ FAILED: Did not catch syntax error");
  } catch (err: any) {
    console.log("✅ PASSED: Caught Python syntax error");
    console.log("   Message:", err.message.trim().split('\n')[0]);
  }

  // 2. Keras GridSearchCV Pattern Match Test
  try {
    console.log("\nTesting Keras GridSearchCV hallucination detection...");
    validateStaticPatterns(`
import tensorflow as tf
from sklearn.model_selection import GridSearchCV

model = tf.keras.Sequential([tf.keras.layers.Dense(10)])
grid = GridSearchCV(model, param_grid={'batch_size': [32, 64]})
    `);
    console.log("❌ FAILED: Did not catch Keras+GridSearchCV hallucination");
  } catch (err: any) {
    console.log("✅ PASSED: Caught invalid Keras wrapper usage");
    console.log("   Message:", err.message);
  }

  // 3. Tech Stack allowed-list test
  try {
    console.log("\nTesting TechStack Hallucination check...");
    validateTechStack(["React", "TypeScript", "Web Dev Full Course 2026"], ["React", "TypeScript"]);
    console.log("❌ FAILED: Did not catch hallucinated tech stack entry");
  } catch (err: any) {
    console.log("✅ PASSED: Caught hallucinated tech stack entry");
    console.log("   Message:", err.message);
  }

  // 4. Quiz Consistency Check
  try {
    console.log("\nTesting Quiz consistency against lesson body...");
    validateQuizConsistency(
      "Which algorithm is best for trees?",
      "RandomForest",
      "RandomForest is best because it builds multiple decision trees.",
      "This lesson discusses linear regression and support vector machines. We do not cover trees."
    );
  } catch (err: any) {
    console.log("✅ PASSED: Caught quiz hallucination (inconsistent with body)");
    console.log("   Message:", err.message);
  }

  console.log("\n--- Smoke Tests Completed ---");
}

runSmokeTests().catch(console.error);
