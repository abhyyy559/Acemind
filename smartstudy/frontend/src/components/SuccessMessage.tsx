// Success Message Component

interface SuccessMessageProps {
  message: string
  onClose?: () => void
  className?: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function SuccessMessage({ 
  message, 
  onClose, 
  className = '',
  autoClose = false,
  autoCloseDelay = 3000
}: SuccessMessageProps) {
  // Auto close functionality
  if (autoClose && onClose) {
    setTimeout(() => {
      onClose()
    }, autoCloseDelay)
  }

  return (
    <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-green-400 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-lg font-medium text-green-800 dark:text-green-300">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="text-green-400 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}