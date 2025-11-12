export default function Focus() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl">
          <span className="text-4xl">🎯</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Focus Room</h1>
        <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Enter an immersive environment designed to enhance your concentration and focus
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl">
        <div className="h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">🌟</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">3D Focus Environment</h3>
            <p className="text-xl text-gray-600">Immersive experience coming soon</p>
          </div>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-3xl">🌊</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ocean Sounds</h3>
            <p className="text-lg text-gray-600 leading-relaxed">Calming ocean waves to help you focus and concentrate</p>
            <button className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium">
              Play Ocean
            </button>
          </div>
          
          <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-3xl">🌲</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Forest Ambience</h3>
            <p className="text-lg text-gray-600 leading-relaxed">Natural forest sounds for deep concentration</p>
            <button className="mt-6 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">
              Play Forest
            </button>
          </div>
          
          <div className="text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-3xl">☔</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Rain Sounds</h3>
            <p className="text-lg text-gray-600 leading-relaxed">Gentle rain to create a peaceful atmosphere</p>
            <button className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium">
              Play Rain
            </button>
          </div>
        </div>

        {/* Focus Timer */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-10">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Pomodoro Timer</h3>
            <div className="text-8xl font-bold text-indigo-600 mb-8">25:00</div>
            <div className="flex justify-center space-x-6">
              <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg text-xl font-medium">
                Start Focus
              </button>
              <button className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg text-xl font-medium">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}