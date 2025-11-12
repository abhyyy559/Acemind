// Error Message Component

import { ApiError } from '../services/api'

interface ErrorMessageProps {
  error: Error | ApiError | string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ error, onRetry, className = '' }: ErrorMessageProps) {
  const getErrorMessage = (error: Error | ApiError | string): string => {
    if (typeof error === 'string') {
      return error
    }
    
    if (error instanceof ApiError) {
      return error.message
    }
    
    return error.message || 'An unexpected error occurred'
  }

  const getErrorType = (error: Error | ApiError | string): string => {
    if (typeof error === 'string') {
      return 'Error'
    }
    
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Connection Error'
        case 'VALIDATION_ERROR':
          return 'Validation Error'
        case '404':
          return 'Not Found'
        case '500':
          return 'Server Error'
        default:
          return 'Error'
      }
    }
    
    return 'Error'
  }

  const errorMessage = getErrorMessage(error)
  const errorType = getErrorType(error)

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">{errorType}</h3>
          <p className="text-red-700 dark:text-red-400 mt-1">{errorMessage}</p>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}