import { useEffect, useState } from 'react';
import {
    FaCheckCircle,
    FaClock,
    FaGraduationCap,
    FaRedo,
    FaSpinner,
    FaTimesCircle,
    FaTrophy,
} from 'react-icons/fa';
import { adminApi } from '../../services/adminApi';

interface TestQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: Array<{ text: string; is_correct: boolean }>;
  correct_answer?: string;
  points: number;
}

interface Test {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  passing_score: number;
  time_limit?: number;
  max_attempts: number;
}

interface TestResult {
  id: string;
  score: number;
  passed: boolean;
  attempt_number: number;
  completed_at: string;
}

interface CourseTestProps {
  test: Test;
  questions: TestQuestion[];
  userId: string;
  onComplete: (passed: boolean, score: number) => void;
}

const CourseTest = ({ test, questions, userId, onComplete }: CourseTestProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    test.time_limit ? test.time_limit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousResults, setPreviousResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    loadPreviousResults();
  }, []);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, showResults]);

  const loadPreviousResults = async () => {
    try {
      const results = await adminApi.testResults.getUserResults(test.id, userId);
      setPreviousResults(results);
    } catch (error) {
      console.error('Error loading previous results:', error);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateScore = (): { score: number; correct: number; total: number; passed: boolean } => {
    let correct = 0;
    const total = questions.length;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;

      if (question.question_type === 'multiple_choice') {
        // Find the selected option
        const selectedOption = question.options?.find(opt => opt.text === userAnswer);
        if (selectedOption?.is_correct) {
          correct++;
        }
      } else if (question.question_type === 'true_false' || question.question_type === 'short_answer') {
        // Compare with correct answer (case-insensitive for short answer)
        const correctAnswer = question.correct_answer?.toLowerCase().trim();
        const userAnswerLower = userAnswer.toLowerCase().trim();
        if (correctAnswer === userAnswerLower) {
          correct++;
        }
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= test.passing_score;

    return { score, correct, total, passed };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = calculateScore();
    setTestResult(result);
    setShowResults(true);

    try {
      const nextAttemptNumber = previousResults.length > 0
        ? Math.max(...previousResults.map(r => r.attempt_number)) + 1
        : 1;

      const timeTaken = test.time_limit
        ? (test.time_limit * 60) - (timeRemaining || 0)
        : null;

      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer,
      }));

      await adminApi.testResults.submitResult({
        test_id: test.id,
        user_id: userId,
        score: result.score,
        total_questions: result.total,
        correct_answers: result.correct,
        passed: result.passed,
        answers: answersArray,
        time_taken: timeTaken ?? undefined,
        attempt_number: nextAttemptNumber,
      });

      await loadPreviousResults();
      onComplete(result.passed, result.score);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(test.time_limit ? test.time_limit * 60 : null);
    setShowResults(false);
    setTestResult(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canRetake = previousResults.length < test.max_attempts;

  if (showResults && testResult) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
        <div className="text-center">
          {testResult.passed ? (
            <>
              <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FaTrophy className="text-4xl text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h2>
              <p className="text-lg text-gray-600 mb-6">You passed the test!</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">{testResult.score}%</div>
                <p className="text-gray-700">
                  You scored {testResult.correct} out of {testResult.total} questions correctly
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Passing score: {test.passing_score}%
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                <FaGraduationCap className="text-4xl text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">You Have Graduated! 🎓</h3>
                <p className="text-gray-700">
                  You have successfully completed the course and passed the final test.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="text-4xl text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Not Passed</h2>
              <p className="text-lg text-gray-600 mb-6">You need to score at least {test.passing_score}% to pass</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-red-600 mb-2">{testResult.score}%</div>
                <p className="text-gray-700">
                  You scored {testResult.correct} out of {testResult.total} questions correctly
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Passing score: {test.passing_score}%
                </p>
              </div>
              {canRetake ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 mb-3">
                    You have {test.max_attempts - previousResults.length} attempt(s) remaining.
                  </p>
                  <button
                    onClick={handleRetake}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    <FaRedo /> Retake Test
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <p className="text-gray-700">
                    You have reached the maximum number of attempts ({test.max_attempts}).
                    Please contact your instructor for assistance.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
      {/* Test Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h2>
            {test.description && (
              <p className="text-gray-600">{test.description}</p>
            )}
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <FaClock className="text-red-600" />
              <span className="font-bold text-red-600">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Previous Results */}
      {previousResults.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Previous Attempts:</h3>
          <div className="space-y-2">
            {previousResults.map((result, idx) => (
              <div key={result.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  Attempt {result.attempt_number}: {result.score}%
                </span>
                {result.passed ? (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <FaCheckCircle /> Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-semibold">
                    <FaTimesCircle /> Failed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question */}
      {currentQuestion && (
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentQuestion.question_text}
            </h3>
            <p className="text-sm text-gray-500">Points: {currentQuestion.points}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options ? (
              currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === option.text
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.text}
                    checked={answers[currentQuestion.id] === option.text}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-3 w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-900">{option.text}</span>
                </label>
              ))
            ) : currentQuestion.question_type === 'true_false' ? (
              <>
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === 'True'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="True"
                    checked={answers[currentQuestion.id] === 'True'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-3 w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-900">True</span>
                </label>
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === 'False'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="False"
                    checked={answers[currentQuestion.id] === 'False'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-3 w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-900">False</span>
                </label>
              </>
            ) : (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 rounded ${
                idx === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : answers[questions[idx].id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              } hover:bg-indigo-500 hover:text-white transition-colors`}
              title={`Question ${idx + 1}`}
            />
          ))}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < questions.length}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <FaCheckCircle /> Submit Test
              </>
            )}
          </button>
        )}
      </div>

      {answeredCount < questions.length && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please answer all questions before submitting
        </p>
      )}
    </div>
  );
};

export default CourseTest;

