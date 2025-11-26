import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../lib/supabase'

export default function Home() {
  const { user, signOut } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [studyStreak, setStudyStreak] = useState(0)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalStudyTime: 0,
    recentQuizzes: [] as any[]
  })
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Trigger animations on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Load user stats from Supabase
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) return

      try {
        // Get quiz history from localStorage for now
        const quizHistory = localStorage.getItem('quizHistory')
        if (quizHistory) {
          const history = JSON.parse(quizHistory)
          
          // Calculate stats
          const totalQuizzes = history.length
          const averageScore = history.length > 0 
            ? Math.round(history.reduce((sum: number, q: any) => sum + q.percentage, 0) / history.length)
            : 0
          const totalStudyTime = history.reduce((sum: number, q: any) => sum + (q.timeSpent || 0), 0)
          
          setStats({
            totalQuizzes,
            averageScore,
            totalStudyTime: Math.round(totalStudyTime / 60), // Convert to minutes
            recentQuizzes: history.slice(0, 5)
          })

          // Calculate streak
          calculateStreak(history)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserStats()
  }, [user])

  const calculateStreak = (history: any[]) => {
    if (!history || history.length === 0) {
      setStudyStreak(0)
      return
    }

    const dates = history.map((h: any) => new Date(h.date).toDateString())
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streak = 1
      let currentDate = new Date(uniqueDates[0])

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)
        
        if (uniqueDates[i] === prevDate.toDateString()) {
          streak++
          currentDate = prevDate
        } else {
          break
        }
      }
    }

    setStudyStreak(streak)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Advanced Dashboard Hero */}
      <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 opacity-50" />
          
          {/* Animated Mesh Gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: User Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center space-x-4 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-110 transition-transform duration-300">
                    {(user?.user_metadata?.full_name || user?.email || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {getGreeting()}, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}!
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDate(currentTime)}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 animate-fade-in-up animation-delay-200">
                  <Link
                    to="/quiz"
                    className="group px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Quiz</span>
                  </Link>
                  <Link
                    to="/planner"
                    className="group px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Study Plan</span>
                  </Link>
                  <Link
                    to="/focus"
                    className="group px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-500 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Focus Mode</span>
                  </Link>
                </div>
              </div>

              {/* Right: Live Stats Card */}
              <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-600 animate-fade-in-up animation-delay-400">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Today's Progress</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{formatTime(currentTime)}</span>
                  </div>
                </div>
                
                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-600"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - (stats.averageScore / 100))}`}
                        className="text-blue-600 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{studyStreak}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.totalQuizzes}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Quizzes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Study Streak', value: `${studyStreak} ${studyStreak === 1 ? 'day' : 'days'}`, color: 'from-orange-500 to-red-500', delay: '0s' },
          { label: 'Quizzes Taken', value: stats.totalQuizzes.toString(), color: 'from-green-500 to-emerald-500', delay: '0.1s' },
          { label: 'Average Score', value: `${stats.averageScore}%`, color: 'from-blue-500 to-indigo-500', delay: '0.2s' },
          { label: 'Study Time', value: `${stats.totalStudyTime}m`, color: 'from-purple-500 to-pink-500', delay: '0.3s' },
        ].map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer animate-fade-in-up`}
            style={{ animationDelay: stat.delay }}
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent hover:scale-110 transition-transform duration-300 inline-block`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {stats.recentQuizzes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentQuizzes.map((quiz: any, index: number) => (
                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{quiz.topic || 'Quiz'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(quiz.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        quiz.percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                        quiz.percentage >= 60 ? 'text-blue-600 dark:text-blue-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`}>
                        {quiz.percentage}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.score}/{quiz.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Study Planner */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl animate-fade-in-up animation-delay-400">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Study Planner</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Organize your study schedule and track your progress with smart planning tools.</p>
          <Link 
            to="/planner"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            Open Planner
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* AI Quiz Generator */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl animate-fade-in-up animation-delay-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">AI Quiz Generator</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Generate personalized quizzes from your study materials using advanced AI technology.</p>
          <Link 
            to="/quiz"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            Generate Quiz
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Focus Room */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Focus Room</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter an immersive 3D environment designed to enhance your concentration and focus.</p>
          <Link 
            to="/focus"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Enter Room
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Notes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Organize and search through your study notes with intelligent categorization.</p>
          <Link 
            to="/notes"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            View Notes
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Track your learning progress with detailed analytics and performance insights.</p>
          <Link 
            to="/analytics"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            View Analytics
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Pomodoro Timer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pomodoro Timer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Boost your productivity with focused study sessions using the Pomodoro technique.</p>
          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors">
            Start Session
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}