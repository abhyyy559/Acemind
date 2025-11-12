export default function Analytics() {
  const stats = [
    { label: 'Total Study Time', value: '127h 32m', change: '+12%', trend: 'up' },
    { label: 'Quizzes Completed', value: '23', change: '+8%', trend: 'up' },
    { label: 'Average Score', value: '87%', change: '+5%', trend: 'up' },
    { label: 'Study Streak', value: '7 days', change: '+2 days', trend: 'up' },
  ]

  const subjects = [
    { name: 'Biology', score: 92, time: '32h', progress: 85, color: 'bg-green-500' },
    { name: 'Mathematics', score: 88, time: '28h', progress: 70, color: 'bg-blue-500' },
    { name: 'History', score: 85, time: '24h', progress: 90, color: 'bg-purple-500' },
    { name: 'Chemistry', score: 82, time: '20h', progress: 60, color: 'bg-orange-500' },
  ]

  const weeklyData = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 5.1 },
    { day: 'Thu', hours: 2.8 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 6.2 },
    { day: 'Sun', hours: 3.5 },
  ]

  const maxHours = Math.max(...weeklyData.map(d => d.hours))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl mb-6 shadow-2xl">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
        <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Track your learning progress with detailed analytics and performance insights
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-600">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`flex items-center space-x-2 text-lg ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg className={`w-6 h-6 ${stat.trend === 'up' ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Weekly Study Hours */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Weekly Study Hours</h2>
          <div className="space-y-6">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="w-16 text-lg font-medium text-gray-600">{data.day}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(data.hours / maxHours) * 100}%` }}
                  ></div>
                </div>
                <div className="w-16 text-lg font-semibold text-gray-900 text-right">
                  {data.hours}h
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-blue-600 font-medium">This Week Total</p>
                <p className="text-4xl font-bold text-blue-700">29.3 hours</p>
              </div>
              <div className="text-blue-500">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Subject Performance</h2>
          <div className="space-y-8">
            {subjects.map((subject, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-5 h-5 rounded-full ${subject.color}`}></div>
                    <span className="text-xl font-medium text-gray-900">{subject.name}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-lg text-gray-600">
                    <span>{subject.score}% avg</span>
                    <span>{subject.time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${subject.color} transition-all duration-500`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-medium text-gray-900 w-16">
                    {subject.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="mt-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-12 text-white shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-8">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">Achievements Unlocked</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <div className="text-5xl mb-4">🔥</div>
              <h3 className="text-2xl font-semibold mb-3">Study Streak</h3>
              <p className="text-lg opacity-90">7 days in a row</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-semibold mb-3">Quiz Master</h3>
              <p className="text-lg opacity-90">20+ quizzes completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold mb-3">High Achiever</h3>
              <p className="text-lg opacity-90">85%+ average score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}