// Quiz Display Component for taking generated quizzes

import { useState, useEffect } from 'react'
import { Quiz, QuizAnswers, QuizResult, quizService } from '../services/quizService'
import { ApiError } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'


interface QuizDisplayProps {
  quizId: string
  onClose: () => void
}

export default function QuizDisplay({ quizId, onClose }: QuizDisplayProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      setError(null)
      const quizData = await quizService.getQuiz(quizId)
      setQuiz(quizData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
      } else {
        setError(new ApiError('Failed to load quiz', 'LOAD_ERROR'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return

    try {
      setSubmitting(true)
      setError(null)
      const quizResult = await quizService.submitQuizAnswers(quizId, answers)
      setResult(quizResult)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
      } else {
        setError(new ApiError('Failed to submit quiz', 'SUBMIT_ERROR'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Quiz Complete!</h2>
            <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-4">{result.percentage}%</div>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
              You scored {result.score} out of {result.totalQuestions} questions correctly
            </p>
            
            <div className="space-y-4 mb-8 text-left">
              {result.questionResults.map((qr, index) => (
                <div key={qr.questionId} className={`p-4 rounded-2xl ${qr.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Q{index + 1}: {qr.question}</h4>
                  <div className="space-y-1 text-sm">
                    <p className={qr.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                      Your answer: {qr.userAnswer}
                    </p>
                    {!qr.isCorrect && (
                      <p className="text-green-700 dark:text-green-400">Correct answer: {qr.correctAnswer}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 italic">{qr.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 font-medium text-lg"
            >
              Close Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
          {error && <ErrorMessage error={error} onRetry={loadQuiz} />}
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.topic}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <ErrorMessage error={error} onRetry={() => setError(null)} className="mb-6" />}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-4 py-2 rounded-full">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-lg text-gray-500 dark:text-gray-400">
              {getAnsweredCount()}/{quiz.questions.length} answered
            </span>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            {currentQ.question}
          </h3>

          <div className="space-y-4 mb-8">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  answers[currentQ.id] === option
                    ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={() => handleAnswerSelect(currentQ.id, option)}
                  className="mr-4 text-indigo-600 w-5 h-5"
                />
                <span className="text-gray-700 dark:text-gray-200 text-lg">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestion
                    ? 'bg-indigo-500'
                    : answers[quiz.questions[index].id]
                    ? 'bg-green-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || getAnsweredCount() < quiz.questions.length}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                  submitting || getAnsweredCount() < quiz.questions.length
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="text-white" className="mr-2" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}