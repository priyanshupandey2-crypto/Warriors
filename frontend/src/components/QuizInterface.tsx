"use client";
import { useState, useEffect } from "react";
import { useApiCall } from "@/hooks/useApiCall";
import { useToast } from "@/context/ToastContext";

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  question_text: string;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  passing_score: number;
  total_points: number;
  questions: Question[];
}

interface QuizInterfaceProps {
  quizId: number;
  courseId: number;
  onComplete?: (passed: boolean) => void;
}

export default function QuizInterface({ quizId, courseId, onComplete }: QuizInterfaceProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const apiCall = useApiCall();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await apiCall<Quiz>(`/api/quiz/${quizId}`);
        if (response) {
          setQuiz(response);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        showToast("Failed to load quiz", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, apiCall, showToast]);

  const handleSelectAnswer = (optionId: number) => {
    if (!submitted) {
      const questionId = quiz?.questions[currentQuestion].id;
      if (questionId) {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: optionId,
        }));
      }
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      setSubmitting(true);
      const answersList = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: parseInt(questionId),
        selected_option_id: optionId,
      }));

      const response = await apiCall<any>("/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          quiz_id: quizId,
          answers: answersList,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        setResult(response);
        setSubmitted(true);
        showToast(
          response.passed ? "Quiz passed! Great job!" : "Quiz failed. Try again.",
          response.passed ? "success" : "error"
        );
        if (response.passed && onComplete) {
          setTimeout(() => onComplete(true), 2000);
        }
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      showToast("Failed to submit quiz", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center py-12 text-on-surface-variant">Failed to load quiz</div>;
  }

  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl ${
            result.passed ? "bg-tertiary/20 text-tertiary" : "bg-error/20 text-error"
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {result.passed ? "check_circle" : "cancel"}
            </span>
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${result.passed ? "text-tertiary" : "text-error"}`}>
            {result.passed ? "Quiz Passed!" : "Quiz Failed"}
          </h2>

          <p className="text-on-surface-variant mb-8">
            {result.passed ? "Congratulations on completing the quiz!" : "Don't worry, you can retake the quiz anytime."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-on-surface-variant mb-1">Your Score</p>
              <p className="text-3xl font-bold text-primary">{result.score}%</p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-4">
              <p className="text-sm text-on-surface-variant mb-1">Passing Score</p>
              <p className="text-3xl font-bold text-secondary">{quiz.passing_score}%</p>
            </div>
            <div className="bg-tertiary/10 rounded-lg p-4">
              <p className="text-sm text-on-surface-variant mb-1">Correct Answers</p>
              <p className="text-3xl font-bold text-tertiary">{result.correct_answers}/{quiz.questions.length}</p>
            </div>
            <div className="bg-outline/10 rounded-lg p-4">
              <p className="text-sm text-on-surface-variant mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-on-surface">{quiz.questions.length}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setSubmitted(false);
                setResult(null);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined">refresh</span>
              Retake Quiz
            </button>
            <button
              onClick={() => onComplete?.(result.passed)}
              className={`flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-lg font-medium transition-all ${
                result.passed
                  ? "bg-tertiary text-on-primary hover:opacity-90"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">arrow_forward</span>
              {result.passed ? "Continue" : "Back to Course"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-on-surface">{quiz.title}</h2>
          <span className="text-sm font-medium text-on-surface-variant">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant mb-8">
        <h3 className="text-xl font-semibold text-on-surface mb-6">{question.question_text}</h3>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={submitted}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedAnswer === option.id
                  ? "border-primary bg-primary/10"
                  : "border-outline-variant hover:border-primary/50 bg-surface-container-lowest"
              } ${submitted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === option.id ? "border-primary bg-primary" : "border-outline-variant"
                }`}>
                  {selectedAnswer === option.id && (
                    <div className="w-2 h-2 bg-on-primary rounded-full"></div>
                  )}
                </div>
                <span className="text-base text-on-surface">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || submitted}
          className="flex items-center gap-2 px-6 py-2 border border-outline-variant text-on-surface rounded-lg font-medium hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
            <span className="material-symbols-outlined">check</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={submitted}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
