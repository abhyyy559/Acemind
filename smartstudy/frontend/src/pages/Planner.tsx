import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { studyPlanService, StudyPlan, StudyTask, CreateStudyPlanInput } from '../services/studyPlanService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import { ApiError } from '@/services/api'

interface SubjectInput {
  id: string
  name: string
  topic: string
  difficulty: 'easy' | 'moderate' | 'hard'
  priority: 'low' | 'medium' | 'high'
}

interface StudyPlanInput {
  subjects: SubjectInput[]
  dailyStudyHours: number
  examDate: string
  goals: string
}

interface DayPlan {
  date: string
  tasks: StudyTask[]
  totalHours: number
  completed: number
}

interface MotivationalMessage {
  message: string
  emoji: string
  color: string
}

export default function Planner() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'planner' | 'progress' | 'myplans' | 'recap'>('planner')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [daysUntilExam, setDaysUntilExam] = useState<number>(0)

  // Enhanced AI Planner Data
  const [studyPlanInput, setStudyPlanInput] = useState<CreateStudyPlanInput>({
    title: '',
    subjects: [],
    daily_study_hours: 6,
    exam_date: '',
    goals: ''
  })
  
  // Day plans and drag state
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([])
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  // Motivational messages based on progress
  const getMotivationalMessage = (completedTasks: number, totalTasks: number): MotivationalMessage => {
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    if (percentage >= 90) return { message: "Outstanding! You're crushing your goals! 🔥", emoji: "🏆", color: "text-yellow-500" }
    if (percentage >= 75) return { message: "Excellent progress! Keep up the momentum!", emoji: "🚀", color: "text-green-500" }
    if (percentage >= 50) return { message: "Great work! You're halfway there!", emoji: "💪", color: "text-blue-500" }
    if (percentage >= 25) return { message: "Good start! Stay consistent!", emoji: "⭐", color: "text-purple-500" }
    return { message: "Let's get started! Every step counts!", emoji: "🌟", color: "text-indigo-500" }
  }

  useEffect(() => {
    if (user) {
      loadPlannerData()
    }
  }, [user])

  const loadPlannerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load study plans from Supabase
      const plans = await studyPlanService.getStudyPlans()
      setStudyPlans(plans)
      
      // Load active plan if exists
      const activePlan = plans.find(p => p.status === 'active')
      if (activePlan) {
        setCurrentPlan(activePlan)
        const planTasks = await studyPlanService.getStudyTasks(activePlan.id)
        setTasks(planTasks)
        
        // Generate day plans from tasks
        generateDayPlans(planTasks)
        
        // Calculate days until exam
        const examDate = new Date(activePlan.exam_date)
        const today = new Date()
        const days = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        setDaysUntilExam(days)
      }
    } catch (err) {
      console.error('Error loading planner data:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Add new subject
  const addSubject = () => {
    const newSubject: SubjectInput = {
      id: Date.now().toString(),
      name: '',
      topic: '',
      difficulty: 'moderate',
      priority: 'medium'
    }
    setStudyPlanInput(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }))
  }

  // Update subject
  const updateSubject = (id: string, field: keyof SubjectInput, value: string) => {
    setStudyPlanInput(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject =>
        subject.id === id ? { ...subject, [field]: value } : subject
      )
    }))
  }

  // Remove subject
  const removeSubject = (id: string) => {
    setStudyPlanInput(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject.id !== id)
    }))
  }

  const handleGenerateAIPlan = async () => {
    try {
      setGeneratingPlan(true)
      setError(null)

      if (studyPlanInput.subjects.length === 0) {
        setError(new Error('Please add at least one subject'))
        return
      }

      if (!studyPlanInput.exam_date) {
        setError(new Error('Please set your exam date'))
        return
      }

      if (!studyPlanInput.title) {
        studyPlanInput.title = `Study Plan for ${studyPlanInput.exam_date}`
      }

      // Calculate days until exam
      const examDate = new Date(studyPlanInput.exam_date)
      const today = new Date()
      const calculatedDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setDaysUntilExam(calculatedDays)

      if (calculatedDays <= 0) {
        setError(new Error('Exam date must be in the future'))
        return
      }

      // Save to Supabase
      const { plan, tasks: createdTasks } = await studyPlanService.createStudyPlan(studyPlanInput)
      
      setCurrentPlan(plan)
      setTasks(createdTasks)
      
      // Generate day plans from tasks
      generateDayPlans(createdTasks)
      
      setSuccessMessage(`Generated ${calculatedDays}-day study plan with ${createdTasks.length} tasks! ${calculatedDays} days until your exam!`)
      setActiveTab('progress')
      
      // Reload plans list
      await loadPlannerData()
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      console.error('Error generating study plan:', err)
      setError(err as Error)
    } finally {
      setGeneratingPlan(false)
    }
  }

  // Generate day plans from tasks
  const generateDayPlans = (tasksList: StudyTask[]) => {
    const dayPlansMap = new Map<string, DayPlan>()
    
    tasksList.forEach(task => {
      // Add computed title if not present
      if (!task.title) {
        task.title = `${task.subject}: ${task.topic}`
      }
      
      const date = task.scheduled_date
      if (!dayPlansMap.has(date)) {
        dayPlansMap.set(date, {
          date,
          tasks: [],
          totalHours: 0,
          completed: 0
        })
      }
      
      const dayPlan = dayPlansMap.get(date)!
      dayPlan.tasks.push(task)
      dayPlan.totalHours += task.duration / 60
      if (task.completed) {
        dayPlan.completed++
      }
    })
    
    const plans = Array.from(dayPlansMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    setDayPlans(plans)
  }

  const downloadStudyPlan = () => {
    if (dayPlans.length === 0) return
    
    // Dynamically import the PDF generator
    import('../utils/pdfGenerator').then(({ generateStudyPlanPDF }) => {
      generateStudyPlanPDF(dayPlans, studyPlanInput, daysUntilExam, tasks);
    });
  }

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const updatedTask = { ...task, completed: !task.completed }
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))

      // Update day plans as well
      setDayPlans(prev => prev.map(dayPlan => ({
        ...dayPlan,
        tasks: dayPlan.tasks.map(t => t.id === taskId ? updatedTask : t),
        completed: dayPlan.tasks.filter(t => t.id === taskId ? updatedTask.completed : t.completed).length
      })))

      // In real app, this would update the backend
      // await studySessionService.updateTask(taskId, { completed: !task.completed })
    } catch (err) {
      // Revert the change if API call fails
      setTasks(prev => prev.map(t => t.id === taskId ? t : t))
      setError(new ApiError('Failed to update task', 'UPDATE_ERROR'))
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault()
    if (!draggedTask) return

    // Move task to different day
    const task = tasks.find(t => t.id === draggedTask)
    if (!task) return

    setDayPlans(prev => prev.map(dayPlan => {
      if (dayPlan.date === targetDate) {
        // Add task to target day if not already there
        if (!dayPlan.tasks.find(t => t.id === draggedTask)) {
          return {
            ...dayPlan,
            tasks: [...dayPlan.tasks, task],
            totalHours: dayPlan.totalHours + (task.duration / 60)
          }
        }
      } else {
        // Remove task from other days
        return {
          ...dayPlan,
          tasks: dayPlan.tasks.filter(t => t.id !== draggedTask),
          totalHours: Math.max(0, dayPlan.totalHours - (task.duration / 60))
        }
      }
      return dayPlan
    }))

    setDraggedTask(null)
  }

  const calculateOverallProgress = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">AI Study Planner</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Create personalized study plans with AI and track your progress
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            AI Planner
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('recap')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'recap'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Daily Recap
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage('')}
          className="mb-8"
        />
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => setError(null)}
          className="mb-8"
        />
      )}

      {/* Tab Content */}
      {activeTab === 'planner' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create Your AI Study Plan
            </h2>

            {/* Study Plan Inputs */}
            <div className="space-y-8">
              {/* Daily Study Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Daily Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={studyPlanInput.daily_study_hours}
                  onChange={(e) => setStudyPlanInput(prev => ({
                    ...prev,
                    daily_study_hours: parseInt(e.target.value) || 6
                  }))}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 text-lg"
                />
              </div>

              {/* Exam Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={studyPlanInput.exam_date}
                  onChange={(e) => {
                    const newDate = e.target.value
                    setStudyPlanInput(prev => ({
                      ...prev,
                      exam_date: newDate
                    }))
                    // Calculate days remaining when date changes
                    if (newDate) {
                      const examDate = new Date(newDate)
                      const today = new Date()
                      const days = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      setDaysUntilExam(days)
                    }
                  }}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 text-lg"
                />
                {studyPlanInput.exam_date && daysUntilExam > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-center">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {daysUntilExam} days until your exam
                      </span>
                    </div>
                    <div className="text-center mt-1 text-xs text-blue-600 dark:text-blue-400">
                      {daysUntilExam <= 7 ? "Final sprint!" : 
                       daysUntilExam <= 30 ? "Crunch time!" : 
                       "Plenty of time to prepare!"}
                    </div>
                  </div>
                )}
              </div>

              {/* Subjects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Subjects to Study
                  </label>
                  <button
                    onClick={addSubject}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add Subject
                  </button>
                </div>

                <div className="space-y-4">
                  {studyPlanInput.subjects.map((subject, index) => (
                    <div key={subject.id} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Subject {index + 1}</h4>
                        <button
                          onClick={() => removeSubject(subject.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject Name
                          </label>
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                            placeholder="e.g., Biology, Mathematics"
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Topic/Chapter
                          </label>
                          <input
                            type="text"
                            value={subject.topic}
                            onChange={(e) => updateSubject(subject.id, 'topic', e.target.value)}
                            placeholder="e.g., Photosynthesis, Calculus"
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Difficulty Level
                          </label>
                          <select
                            value={subject.difficulty}
                            onChange={(e) => updateSubject(subject.id, 'difficulty', e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600"
                          >
                            <option value="easy">😊 Easy</option>
                            <option value="moderate">😐 Moderate</option>
                            <option value="hard">😰 Hard</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                          </label>
                          <select
                            value={subject.priority}
                            onChange={(e) => updateSubject(subject.id, 'priority', e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600"
                          >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {studyPlanInput.subjects.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-lg">No subjects added yet. Click "Add Subject" to get started!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Study Goals
                </label>
                <textarea
                  value={studyPlanInput.goals}
                  onChange={(e) => setStudyPlanInput(prev => ({
                    ...prev,
                    goals: e.target.value
                  }))}
                  placeholder="e.g., Score 90% in final exam, Master difficult concepts, Complete all practice tests"
                  rows={4}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none bg-white dark:bg-gray-700"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateAIPlan}
                disabled={generatingPlan || studyPlanInput.subjects.length === 0 || !studyPlanInput.exam_date}
                className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  generatingPlan || studyPlanInput.subjects.length === 0 || !studyPlanInput.exam_date
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-lg'
                }`}
              >
                {generatingPlan ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="text-white" className="mr-2" />
                    Generating AI Study Plan...
                  </div>
                ) : (
                  'Generate AI Study Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="max-w-7xl mx-auto">
          {dayPlans.length > 0 && (
            <>
              {/* Overall Progress & Motivation */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 mb-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Your Study Journey</h2>
                    <p className="text-indigo-100 text-lg">
                      {daysUntilExam > 0 ? `${daysUntilExam} days until your exam` : 'Exam day is here!'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={downloadStudyPlan}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg font-medium transition-all duration-300 flex items-center gap-2 backdrop-blur-sm hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Plan
                    </button>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{calculateOverallProgress()}%</div>
                      <div className="text-indigo-200">Complete</div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-1000 ease-out"
                      style={{ width: `${calculateOverallProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {getMotivationalMessage(tasks.filter(t => t.completed).length, tasks.length).emoji}
                  </div>
                  <p className="text-lg font-medium">
                    {getMotivationalMessage(tasks.filter(t => t.completed).length, tasks.length).message}
                  </p>
                </div>
              </div>

              {/* Day-wise Study Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {dayPlans.map((dayPlan, index) => {
                  const dayDate = new Date(dayPlan.date)
                  const isToday = dayDate.toDateString() === new Date().toDateString()
                  const isPast = dayDate < new Date() && !isToday
                  const completedTasks = dayPlan.tasks.filter(t => t.completed).length
                  const totalTasks = dayPlan.tasks.length
                  const dayProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                  return (
                    <div
                      key={dayPlan.date}
                      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-all duration-200 ${
                        isToday ? 'ring-2 ring-indigo-500 shadow-indigo-200 dark:shadow-indigo-900' : ''
                      } ${isPast ? 'opacity-75' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayPlan.date)}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {isToday ? '🔥 Today' : isPast ? '✅ Past' : `Day ${index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {dayProgress}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {dayPlan.totalHours}h planned
                          </div>
                        </div>
                      </div>

                      {/* Day Progress Bar */}
                      <div className="mb-4">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              dayProgress >= 100 ? 'bg-green-500' :
                              dayProgress >= 75 ? 'bg-blue-500' :
                              dayProgress >= 50 ? 'bg-yellow-500' :
                              dayProgress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${dayProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {dayPlan.tasks.map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className={`p-4 rounded-xl border transition-all duration-200 cursor-move ${
                              task.completed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                            } ${draggedTask === task.id ? 'opacity-50 scale-95' : ''}`}
                          >
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task.id)}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-semibold ${
                                  task.completed 
                                    ? 'text-green-700 dark:text-green-400 line-through' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.title}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.floor(task.duration / 60)}h {task.duration % 60}m
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    task.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                                    task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                    'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {dayPlan.tasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            <div className="text-2xl mb-2">📝</div>
                            <p className="text-sm">Drag tasks here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {dayPlans.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">No study plan yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Generate an AI study plan to get started with day-wise tasks.</p>
              <button
                onClick={() => setActiveTab('planner')}
                className="px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold"
              >
                Create Study Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Daily Recap Tab */}
      {activeTab === 'recap' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Daily Study Recap
            </h2>
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-300">Daily recap feature with AI insights will be available soon.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}