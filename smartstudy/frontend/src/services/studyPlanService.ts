import { supabase } from '../lib/supabase'

export interface StudyPlan {
  id: string
  user_id: string
  title: string
  exam_date: string
  daily_study_hours: number
  goals: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface StudyTask {
  id: string
  study_plan_id: string
  subject: string
  topic: string
  title?: string // Computed from subject and topic
  difficulty: 'easy' | 'moderate' | 'hard'
  priority: 'low' | 'medium' | 'high'
  duration: number // minutes
  scheduled_date: string
  completed: boolean
  completed_at?: string
  notes?: string
  created_at: string
}

export interface CreateStudyPlanInput {
  title: string
  exam_date: string
  daily_study_hours: number
  goals: string
  subjects: {
    id: string // Client-side ID for UI management
    name: string
    topic: string
    difficulty: 'easy' | 'moderate' | 'hard'
    priority: 'low' | 'medium' | 'high'
  }[]
}

class StudyPlanService {
  // Create a new study plan with tasks
  async createStudyPlan(input: CreateStudyPlanInput): Promise<{ plan: StudyPlan; tasks: StudyTask[] }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get user_id from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError || !userData) throw new Error('User not found')

      // Create study plan
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .insert({
          user_id: userData.id,
          title: input.title,
          exam_date: input.exam_date,
          daily_study_hours: input.daily_study_hours,
          goals: input.goals,
          status: 'active'
        })
        .select()
        .single()

      if (planError) throw planError

      // Generate tasks based on subjects and timeline
      const tasks = this.generateTasks(plan.id, input)

      // Insert tasks
      const { data: createdTasks, error: tasksError } = await supabase
        .from('study_tasks')
        .insert(tasks)
        .select()

      if (tasksError) throw tasksError

      return { plan, tasks: createdTasks }
    } catch (error) {
      console.error('Error creating study plan:', error)
      throw error
    }
  }

  // Generate tasks based on study plan input
  private generateTasks(planId: string, input: CreateStudyPlanInput): Partial<StudyTask>[] {
    const tasks: Partial<StudyTask>[] = []
    const examDate = new Date(input.exam_date)
    const today = new Date()
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExam <= 0) return tasks

    // Calculate study phases
    const phases = [
      { name: 'Foundation', days: Math.floor(daysUntilExam * 0.4), focus: 'learning' },
      { name: 'Practice', days: Math.floor(daysUntilExam * 0.4), focus: 'practice' },
      { name: 'Revision', days: Math.floor(daysUntilExam * 0.2), focus: 'revision' }
    ]

    let currentDay = 0
    const targetDailyMinutes = input.daily_study_hours * 60

    phases.forEach((phase) => {
      for (let day = 0; day < phase.days; day++) {
        const currentDate = new Date(today)
        currentDate.setDate(today.getDate() + currentDay)
        
        let dailyTimeAllocated = 0

        input.subjects.forEach((subject) => {
          if (dailyTimeAllocated >= targetDailyMinutes) return

          // Calculate time allocation
          const difficultyMultiplier = subject.difficulty === 'hard' ? 1.5 : subject.difficulty === 'easy' ? 0.7 : 1
          const priorityMultiplier = subject.priority === 'high' ? 1.3 : subject.priority === 'low' ? 0.8 : 1
          
          const baseTime = targetDailyMinutes / input.subjects.length
          const adjustedTime = Math.min(
            Math.round(baseTime * difficultyMultiplier * priorityMultiplier),
            targetDailyMinutes - dailyTimeAllocated
          )

          if (adjustedTime > 0) {
            tasks.push({
              study_plan_id: planId,
              subject: subject.name,
              topic: subject.topic,
              difficulty: subject.difficulty,
              priority: subject.priority,
              duration: adjustedTime,
              scheduled_date: currentDate.toISOString().split('T')[0],
              completed: false
            })

            dailyTimeAllocated += adjustedTime
          }
        })

        currentDay++
      }
    })

    return tasks
  }

  // Get all study plans for current user
  async getStudyPlans(): Promise<StudyPlan[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userData) throw new Error('User not found')

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching study plans:', error)
      throw error
    }
  }

  // Get tasks for a specific study plan
  async getStudyTasks(planId: string): Promise<StudyTask[]> {
    try {
      const { data, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('study_plan_id', planId)
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching study tasks:', error)
      throw error
    }
  }

  // Update task completion status
  async updateTaskCompletion(taskId: string, completed: boolean): Promise<StudyTask> {
    try {
      const { data, error } = await supabase
        .from('study_tasks')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  // Get tasks for a specific date
  async getTasksByDate(planId: string, date: string): Promise<StudyTask[]> {
    try {
      const { data, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('study_plan_id', planId)
        .eq('scheduled_date', date)
        .order('priority', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by date:', error)
      throw error
    }
  }

  // Delete a study plan
  async deleteStudyPlan(planId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting study plan:', error)
      throw error
    }
  }

  // Update study plan status
  async updatePlanStatus(planId: string, status: 'active' | 'completed' | 'archived'): Promise<StudyPlan> {
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .update({ status })
        .eq('id', planId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating plan status:', error)
      throw error
    }
  }
}

export const studyPlanService = new StudyPlanService()
