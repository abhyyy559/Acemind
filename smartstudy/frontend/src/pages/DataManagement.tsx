import { useState } from 'react'
import { storageService } from '../services/storageService'
import { exportService } from '../services/exportService'
import DownloadButton, { DownloadMenu } from '../components/DownloadButton'

export default function DataManagement() {
  const [storageInfo, setStorageInfo] = useState(storageService.getStorageInfo())
  const [analytics, setAnalytics] = useState(storageService.getAnalytics())
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const refreshData = () => {
    setStorageInfo(storageService.getStorageInfo())
    setAnalytics(storageService.getAnalytics())
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportMessage(null)

    try {
      const result = await exportService.importDataFromFile(file)
      setImportMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })
      if (result.success) {
        refreshData()
      }
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: 'Failed to import file'
      })
    } finally {
      setImporting(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleClearData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL your data including quizzes, study plans, and notes. This action cannot be undone!\n\nAre you absolutely sure?')) {
      if (confirm('Last chance! Click OK to permanently delete all data.')) {
        storageService.clearAllData()
        refreshData()
        alert('All data has been cleared.')
      }
    }
  }

  const getStorageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 dark:text-red-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl">
          <span className="text-4xl">💾</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Data Management</h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Manage your session data, export backups, and import previous data
        </p>
      </div>

      {/* Import Message */}
      {importMessage && (
        <div className={`max-w-4xl mx-auto mb-8 p-4 rounded-xl ${
          importMessage.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {importMessage.type === 'success' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{importMessage.text}</span>
            <button
              onClick={() => setImportMessage(null)}
              className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Storage Information */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            Storage Information
          </h2>

          <div className="space-y-6">
            {/* Storage Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
                <span className={`text-2xl font-bold ${getStorageColor(storageInfo.percentageUsed)}`}>
                  {storageInfo.percentageUsed}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    storageInfo.percentageUsed >= 80 ? 'bg-red-500' :
                    storageInfo.percentageUsed >= 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageInfo.percentageUsed, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {storageInfo.usedMB} MB / {storageInfo.maxMB} MB
              </p>
            </div>

            {/* Item Counts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {storageInfo.itemCounts.quizzes}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Quizzes</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {storageInfo.itemCounts.studyPlans}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">Plans</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {storageInfo.itemCounts.notes}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">Notes</div>
              </div>
            </div>

            {/* Warning */}
            {storageInfo.percentageUsed >= 80 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">Storage Almost Full</h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      Consider downloading your data and clearing old items to free up space.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Quick Stats
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Quizzes</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalQuizzes}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Average Score</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.averageScore}%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Study Time</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalStudyTime}h</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Study Streak</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.studyStreak} days</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Notes</span>
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">{analytics.totalNotes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">📥</span>
          Export Your Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Export All Data */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Complete Backup</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Download all your data (quizzes, plans, notes) as a single JSON file
            </p>
            <DownloadButton
              onClick={() => exportService.exportAllDataJSON()}
              label="Export All (JSON)"
              icon="json"
              variant="primary"
              className="w-full"
            />
          </div>

          {/* Export Analytics */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analytics Report</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Download a comprehensive report of your study statistics
            </p>
            <DownloadButton
              onClick={() => exportService.exportAnalyticsReport()}
              label="Export Report"
              icon="text"
              variant="success"
              className="w-full"
            />
          </div>

          {/* Export Notes */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Notes</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Export all your notes as a single Markdown file
            </p>
            <DownloadButton
              onClick={() => exportService.exportAllNotesMarkdown()}
              label="Export Notes"
              icon="markdown"
              variant="primary"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Import & Clear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Import Data */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📤</span>
            Import Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Restore your data from a previously exported JSON file. This will merge with your existing data.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className={`
                flex items-center justify-center gap-3 w-full px-6 py-4
                bg-gradient-to-r from-indigo-600 to-purple-600
                hover:from-indigo-700 hover:to-purple-700
                text-white rounded-xl font-medium cursor-pointer
                transition-all duration-200 shadow-lg hover:shadow-xl
                ${importing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{importing ? 'Importing...' : 'Choose File to Import'}</span>
            </label>
          </label>
        </div>

        {/* Clear Data */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-red-200 dark:border-red-800">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            Danger Zone
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Permanently delete all your data. This action cannot be undone. Make sure to export your data first!
          </p>
          <button
            onClick={handleClearData}
            className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  )
}
