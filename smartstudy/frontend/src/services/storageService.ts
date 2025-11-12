// Local Storage Service for Session-Based Data Management

export interface Quiz {
  id: string
  topic: string
  difficulty: string
  questions: any[]
  result?: QuizResult
  createdAt: string
}

export interface QuizResult {
  score: number
  totalQuestions: number
  percentage: number
  timeSpent: number
  completedAt: string
  detailedResults: any[]
}

export interface StudyPlan {
  id: string
  examDate: string
  subjects: any[]
  dailyPlans: any[]
  dailyStudyHours: number
  goals: string
  createdAt: string
  progress: {
    completedTasks: number
    totalTasks: number
    percentage: number
  }
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: 'light' | 'dark'
  notifications: boolean
  autoSave: boolean
  language: string
}

class StorageService {
  private readonly KEYS = {
    QUIZZES: 'acemind_quizzes',
    STUDY_PLANS: 'acemind_study_plans',
    NOTES: 'acemind_notes',
    SETTINGS: 'acemind_settings',
    ANALYTICS: 'acemind_analytics',
  }

  // Generic storage methods
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please download your data and clear some space.')
      }
    }
  }

  // Quiz Management
  getQuizzes(): Quiz[] {
    return this.getItem<Quiz[]>(this.KEYS.QUIZZES, [])
  }

  saveQuiz(quiz: Quiz): void {
    const quizzes = this.getQuizzes()
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id)
    
    if (existingIndex >= 0) {
      quizzes[existingIndex] = quiz
    } else {
      quizzes.push(quiz)
    }
    
    this.setItem(this.KEYS.QUIZZES, quizzes)
  }

  getQuiz(id: string): Quiz | null {
    const quizzes = this.getQuizzes()
    return quizzes.find(q => q.id === id) || null
  }

  deleteQuiz(id: string): void {
    const quizzes = this.getQuizzes().filter(q => q.id !== id)
    this.setItem(this.KEYS.QUIZZES, quizzes)
  }

  updateQuizResult(quizId: string, result: QuizResult): void {
    const quizzes = this.getQuizzes()
    const quiz = quizzes.find(q => q.id === quizId)
    
    if (quiz) {
      quiz.result = result
      this.setItem(this.KEYS.QUIZZES, quizzes)
    }
  }

  // Study Plan Management
  getStudyPlans(): StudyPlan[] {
    return this.getItem<StudyPlan[]>(this.KEYS.STUDY_PLANS, [])
  }

  saveStudyPlan(plan: StudyPlan): void {
    const plans = this.getStudyPlans()
    const existingIndex = plans.findIndex(p => p.id === plan.id)
    
    if (existingIndex >= 0) {
      plans[existingIndex] = plan
    } else {
      plans.push(plan)
    }
    
    this.setItem(this.KEYS.STUDY_PLANS, plans)
  }

  getStudyPlan(id: string): StudyPlan | null {
    const plans = this.getStudyPlans()
    return plans.find(p => p.id === id) || null
  }

  getActiveStudyPlan(): StudyPlan | null {
    const plans = this.getStudyPlans()
    // Return the most recent plan
    return plans.length > 0 ? plans[plans.length - 1] : null
  }

  deleteStudyPlan(id: string): void {
    const plans = this.getStudyPlans().filter(p => p.id !== id)
    this.setItem(this.KEYS.STUDY_PLANS, plans)
  }

  updateStudyPlanProgress(planId: string, completedTaskIds: string[]): void {
    const plans = this.getStudyPlans()
    const plan = plans.find(p => p.id === planId)
    
    if (plan) {
      // Update task completion status
      plan.dailyPlans.forEach(dayPlan => {
        dayPlan.tasks.forEach((task: any) => {
          task.completed = completedTaskIds.includes(task.id)
        })
      })
      
      // Recalculate progress
      const totalTasks = plan.dailyPlans.reduce((sum, day) => sum + day.tasks.length, 0)
      const completedTasks = completedTaskIds.length
      
      plan.progress = {
        completedTasks,
        totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
      
      this.setItem(this.KEYS.STUDY_PLANS, plans)
    }
  }

  // Notes Management
  getNotes(): Note[] {
    return this.getItem<Note[]>(this.KEYS.NOTES, [])
  }

  saveNote(note: Note): void {
    const notes = this.getNotes()
    const existingIndex = notes.findIndex(n => n.id === note.id)
    
    if (existingIndex >= 0) {
      notes[existingIndex] = { ...note, updatedAt: new Date().toISOString() }
    } else {
      notes.push(note)
    }
    
    this.setItem(this.KEYS.NOTES, notes)
  }

  getNote(id: string): Note | null {
    const notes = this.getNotes()
    return notes.find(n => n.id === id) || null
  }

  deleteNote(id: string): void {
    const notes = this.getNotes().filter(n => n.id !== id)
    this.setItem(this.KEYS.NOTES, notes)
  }

  searchNotes(query: string): Note[] {
    const notes = this.getNotes()
    const lowerQuery = query.toLowerCase()
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // Settings Management
  getSettings(): Settings {
    return this.getItem<Settings>(this.KEYS.SETTINGS, {
      theme: 'light',
      notifications: true,
      autoSave: true,
      language: 'en'
    })
  }

  saveSettings(settings: Partial<Settings>): void {
    const currentSettings = this.getSettings()
    this.setItem(this.KEYS.SETTINGS, { ...currentSettings, ...settings })
  }

  // Analytics
  getAnalytics() {
    const quizzes = this.getQuizzes()
    const plans = this.getStudyPlans()
    const notes = this.getNotes()

    // Calculate quiz statistics
    const completedQuizzes = quizzes.filter(q => q.result)
    const totalScore = completedQuizzes.reduce((sum, q) => sum + (q.result?.score || 0), 0)
    const totalQuestions = completedQuizzes.reduce((sum, q) => sum + (q.result?.totalQuestions || 0), 0)
    const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

    // Calculate study time from plans
    const totalStudyTime = plans.reduce((sum, plan) => {
      return sum + plan.dailyPlans.reduce((daySum: number, day: any) => daySum + day.totalHours, 0)
    }, 0)

    // Calculate streak (simplified - based on quiz completion dates)
    const streak = this.calculateStreak(completedQuizzes)

    return {
      totalQuizzes: completedQuizzes.length,
      averageScore,
      totalStudyTime: Math.round(totalStudyTime * 10) / 10,
      totalNotes: notes.length,
      studyStreak: streak,
      lastActivity: this.getLastActivityDate()
    }
  }

  private calculateStreak(quizzes: Quiz[]): number {
    if (quizzes.length === 0) return 0

    const dates = quizzes
      .filter(q => q.result?.completedAt)
      .map(q => new Date(q.result!.completedAt).toDateString())
      .sort()

    let streak = 1
    let currentStreak = 1

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentStreak++
        streak = Math.max(streak, currentStreak)
      } else if (diffDays > 1) {
        currentStreak = 1
      }
    }

    return streak
  }

  private getLastActivityDate(): string {
    const quizzes = this.getQuizzes()
    const plans = this.getStudyPlans()
    const notes = this.getNotes()

    const dates = [
      ...quizzes.map(q => q.createdAt),
      ...plans.map(p => p.createdAt),
      ...notes.map(n => n.updatedAt)
    ].sort().reverse()

    return dates[0] || new Date().toISOString()
  }

  // Data Management
  exportAllData() {
    return {
      quizzes: this.getQuizzes(),
      studyPlans: this.getStudyPlans(),
      notes: this.getNotes(),
      settings: this.getSettings(),
      analytics: this.getAnalytics(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  importData(data: any): { success: boolean; message: string } {
    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid data format' }
      }

      // Import each data type
      if (Array.isArray(data.quizzes)) {
        this.setItem(this.KEYS.QUIZZES, data.quizzes)
      }
      if (Array.isArray(data.studyPlans)) {
        this.setItem(this.KEYS.STUDY_PLANS, data.studyPlans)
      }
      if (Array.isArray(data.notes)) {
        this.setItem(this.KEYS.NOTES, data.notes)
      }
      if (data.settings) {
        this.setItem(this.KEYS.SETTINGS, data.settings)
      }

      return { success: true, message: 'Data imported successfully' }
    } catch (error) {
      console.error('Import error:', error)
      return { success: false, message: 'Failed to import data' }
    }
  }

  clearAllData(): void {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }

  getStorageInfo() {
    const data = this.exportAllData()
    const dataSize = new Blob([JSON.stringify(data)]).size
    const maxSize = 5 * 1024 * 1024 // 5MB typical localStorage limit
    
    return {
      usedBytes: dataSize,
      usedMB: (dataSize / (1024 * 1024)).toFixed(2),
      maxMB: (maxSize / (1024 * 1024)).toFixed(2),
      percentageUsed: Math.round((dataSize / maxSize) * 100),
      itemCounts: {
        quizzes: this.getQuizzes().length,
        studyPlans: this.getStudyPlans().length,
        notes: this.getNotes().length
      }
    }
  }
}

export const storageService = new StorageService()
