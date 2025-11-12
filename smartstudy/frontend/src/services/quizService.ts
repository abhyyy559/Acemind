// Quiz Service for AI Quiz Generation and Management

import { apiClient, ApiError } from './api'

// Types for Quiz functionality
export interface QuizInput {
  inputMethod: 'text' | 'pdf'
  textContent?: string
  file?: File
  topic?: string
}

export interface QuizResponse {
  id: string
  topic: string
  message: string
}

export interface Question {
  id: string
  question: string
  options: string[]
  type: 'multiple-choice' | 'true-false'
}

export interface Quiz {
  id: string
  topic: string
  questions: Question[]
  createdAt: Date
}

export interface QuizAnswers {
  [questionId: string]: string
}

export interface QuestionResult {
  questionId: string
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
}

export interface QuizResult {
  score: number
  totalQuestions: number
  percentage: number
  questionResults: QuestionResult[]
  completedAt: Date
}

export interface QuizHistory {
  id: string
  topic: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: Date
}

export class QuizService {
  async generateQuiz(input: QuizInput): Promise<QuizResponse> {
    try {
      if (input.inputMethod === 'text') {
        if (!input.textContent || input.textContent.trim().length < 50) {
          throw new ApiError('Text content must be at least 50 characters long', 'VALIDATION_ERROR')
        }

        return await apiClient.post<QuizResponse>('/quiz/generate', {
          inputMethod: 'text',
          textContent: input.textContent,
          topic: input.topic || 'Generated Quiz',
        })
      } else if (input.inputMethod === 'pdf') {
        if (!input.file) {
          throw new ApiError('PDF file is required', 'VALIDATION_ERROR')
        }

        const formData = new FormData()
        formData.append('file', input.file)
        formData.append('inputMethod', 'pdf')
        formData.append('topic', input.topic || 'Generated from PDF')

        return await apiClient.postFormData<QuizResponse>('/quiz/generate', formData)
      } else {
        throw new ApiError('Invalid input method', 'VALIDATION_ERROR')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Failed to generate quiz', 'GENERATION_ERROR', error)
    }
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      return await apiClient.get<Quiz>(`/quiz/${quizId}`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Failed to fetch quiz', 'FETCH_ERROR', error)
    }
  }

  async submitQuizAnswers(quizId: string, answers: QuizAnswers): Promise<QuizResult> {
    try {
      return await apiClient.post<QuizResult>(`/quiz/${quizId}/submit`, {
        answers,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Failed to submit quiz answers', 'SUBMIT_ERROR', error)
    }
  }

  async getQuizHistory(userId: string): Promise<QuizHistory[]> {
    try {
      return await apiClient.get<QuizHistory[]>(`/quiz/user/${userId}/history`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Failed to fetch quiz history', 'HISTORY_ERROR', error)
    }
  }
}

// Create a default instance
export const quizService = new QuizService()