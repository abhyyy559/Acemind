import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Map, Sparkles, Target, Clock, BookOpen, TrendingUp, ExternalLink, Maximize2, Minimize2, Zap, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface RoadmapData {
  topic: string
  roadmap_markdown: string
  resources: Array<{
    title: string
    url: string
    type: string
    source?: string
    description?: string
  }>
  estimated_duration: string
}

export default function Roadmap() {
  const [topic, setTopic] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState('beginner')
  const [loading, setLoading] = useState(false)
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [error, setError] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false)

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://acemind.onrender.com'}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty_level: difficultyLevel
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate roadmap')
      }

      const data = await response.json()
      setRoadmapData(data)
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('roadmap-results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('Error generating roadmap:', err)
      setError('Failed to generate roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateVisualRoadmap = async () => {
    if (!roadmapData) return

    try {
      setIsGeneratingVisual(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://acemind.onrender.com'}/roadmap/generate-visual-roadmap`, {
        topic: topic,
        difficulty_level: difficultyLevel,
        roadmap_markdown: roadmapData.roadmap_markdown || ''
      }, {
        responseType: 'text'  // Important: Tell axios to expect HTML text, not JSON
      })
      
      if (response.status === 200 && response.data) {
        const htmlContent = response.data
        // Create Blob with HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' })
        
        // Create temporary URL using URL.createObjectURL
        const url = URL.createObjectURL(blob)

        // Open URL in new window with dimensions 1200x800
        const newWindow = window.open(url, 'Visual Roadmap', 'width=1200,height=800')

        if (newWindow) {
          newWindow.focus()
          // Revoke URL after 2 seconds for memory cleanup
          setTimeout(() => URL.revokeObjectURL(url), 2000)
        } else {
          setError('Please allow popups for this site to view the visual roadmap')
        }
      }
    } catch (err) {
      console.error('Error generating visual roadmap:', err)
      setError('Failed to generate visual roadmap')
    } finally {
      setIsGeneratingVisual(false)
    }
  }

  const exampleTopics = [
    { name: 'React Development', icon: '⚛️' },
    { name: 'Machine Learning', icon: '🤖' },
    { name: 'Data Science', icon: '📊' },
    { name: 'Cloud Computing', icon: '☁️' },
    { name: 'Cybersecurity', icon: '🔒' },
    { name: 'Python Programming', icon: '🐍' }
  ]

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', desc: "I'm new to this topic", icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', desc: 'I have some knowledge', icon: '🚀' },
    { value: 'advanced', label: 'Advanced', desc: 'I want to deepen my expertise', icon: '⚡' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">AI-Powered Learning Paths</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Your Personalized Roadmap
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform any topic into a structured learning journey with AI-generated roadmaps and curated resources
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleGenerateRoadmap} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    What do you want to master?
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Full-Stack Development, AI Engineering, DevOps..."
                    className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700/50 dark:text-white transition-all text-lg"
                    disabled={loading}
                  />
                </div>

                {/* Difficulty Level - Card Style */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Your current level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {difficultyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDifficultyLevel(option.value)}
                        disabled={loading}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          difficultyLevel === option.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="text-white" />
                      <span>Generating your personalized roadmap...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Learning Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Example Topics */}
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Popular learning paths:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {exampleTopics.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => setTopic(example.name)}
                    disabled={loading}
                    className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full transition-all duration-200 disabled:opacity-50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <span>{example.icon}</span>
                    <span className="text-sm font-medium">{example.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Results */}
      {roadmapData && !loading && (
        <div id="roadmap-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Topic</span>
              </div>
              <div className="text-2xl font-bold">{roadmapData.topic}</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{roadmapData.estimated_duration}</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <ExternalLink className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resources</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{roadmapData.resources.length} curated</div>
            </div>
          </div>

          {/* Roadmap Content */}
          <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-8 ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Learning Path</h2>
                <p className="text-gray-600 dark:text-gray-400">Follow this structured roadmap to master {roadmapData.topic}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={generateVisualRoadmap}
                  disabled={isGeneratingVisual}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <Map className="w-5 h-5" />
                  <span>{isGeneratingVisual ? 'Generating...' : 'Visual Map'}</span>
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none roadmap-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent" {...props} />,
                  h2: ({...props}) => <h2 className="text-3xl font-bold mt-10 mb-5 text-indigo-600 dark:text-indigo-400 flex items-center gap-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-2xl font-semibold mt-6 mb-4 text-gray-800 dark:text-gray-200" {...props} />,
                  ul: ({...props}) => <ul className="space-y-3 my-4" {...props} />,
                  ol: ({...props}) => <ol className="space-y-3 my-4 list-decimal list-inside" {...props} />,
                  li: ({children, ...props}) => (
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all" {...props}>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0">•</span>
                      <span className="flex-1 text-gray-700 dark:text-gray-300">{children}</span>
                    </li>
                  ),
                  p: ({...props}) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed my-3" {...props} />,
                  strong: ({...props}) => <strong className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                  em: ({...props}) => <em className="italic text-purple-600 dark:text-purple-400" {...props} />,
                  code: ({inline, ...props}: any) => 
                    inline ? (
                      <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400" {...props} />
                    ) : (
                      <code className="block p-4 bg-gray-900 dark:bg-gray-950 rounded-xl text-sm font-mono text-green-400 overflow-x-auto" {...props} />
                    ),
                  blockquote: ({...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props} />,
                }}
              >
                {roadmapData.roadmap_markdown}
              </ReactMarkdown>
            </div>
          </div>

          {/* Resources Section */}
          {roadmapData.resources && roadmapData.resources.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Curated Resources</h3>
                  <p className="text-gray-600 dark:text-gray-400">Hand-picked materials to accelerate your learning</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmapData.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {resource.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                            {resource.type}
                          </span>
                          {resource.source && (
                            <span className="text-gray-500 dark:text-gray-400">{resource.source}</span>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-3" />
                    </div>
                    {resource.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{resource.description}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
