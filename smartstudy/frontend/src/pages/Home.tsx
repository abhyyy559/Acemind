import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user] = useState({ name: 'Student' }) // Mock user data
  const [studyStreak, setStudyStreak] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Calculate study streak
  useEffect(() => {
    const calculateStreak = () => {
      const quizHistory = localStorage.getItem('quizHistory');
      if (!quizHistory) {
        setStudyStreak(0);
        return;
      }

      const history = JSON.parse(quizHistory);
      const dates = history.map((h: any) => new Date(h.date).toDateString());
      const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // Check if studied today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        let currentDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          
          if (uniqueDates[i] === prevDate.toDateString()) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }

      setStudyStreak(streak);
    };

    calculateStreak();
    // Recalculate every minute
    const interval = setInterval(calculateStreak, 60000);
    return () => clearInterval(interval);
  }, [])

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Hero Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-6">
              Ready to continue your learning journey?
            </p>
            <div className="flex flex-wrap items-center gap-6 text-lg opacity-80">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{formatDate(currentTime)}</span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Study Streak', value: `${studyStreak} ${studyStreak === 1 ? 'day' : 'days'}`, icon: '🔥', color: 'from-orange-400 to-red-500' },
          { label: 'Quizzes Taken', value: '23', icon: '🧠', color: 'from-green-400 to-emerald-500' },
          { label: 'Average Score', value: '87%', icon: '📊', color: 'from-blue-400 to-indigo-500' },
          { label: 'Focus Time', value: '4.2h', icon: '⏱️', color: 'from-purple-400 to-pink-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Study Planner */}
        <div className="group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📅</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Next Session</p>
              <p className="text-lg font-semibold text-gray-900">2:30 PM</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Study Planner</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Organize your study schedule and track your progress with smart planning tools.</p>
          <Link 
            to="/planner"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            Open Planner
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* AI Quiz Generator */}
        <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">🧠</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">AI Powered</p>
              <p className="text-lg font-semibold text-gray-900">Smart Quiz</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">AI Quiz Generator</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Generate personalized quizzes from your study materials using advanced AI technology.</p>
          <Link 
            to="/quiz"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            Generate Quiz
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Focus Room */}
        <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Immersive</p>
              <p className="text-lg font-semibold text-gray-900">3D Space</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Focus Room</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Enter an immersive 3D environment designed to enhance your concentration and focus.</p>
          <Link 
            to="/focus"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            Enter Room
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Notes */}
        <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📝</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">12 Notes</p>
              <p className="text-lg font-semibold text-gray-900">Recent</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Smart Notes</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Organize and search through your study notes with intelligent categorization.</p>
          <Link 
            to="/notes"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            View Notes
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Analytics */}
        <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-lg font-semibold text-gray-900">+15%</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Track your learning progress with detailed analytics and performance insights.</p>
          <Link 
            to="/analytics"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
          >
            View Analytics
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Pomodoro Timer */}
        <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">⏰</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ready</p>
              <p className="text-lg font-semibold text-gray-900">25:00</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Pomodoro Timer</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Boost your productivity with focused study sessions using the Pomodoro technique.</p>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105">
            Start Session
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}



