import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const authHelpers = {
  // Sign up new user
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/roadmap`
      }
    })
    return { data, error }
  },

  // Sign in with GitHub
  signInWithGitHub: async () => {
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${redirectUrl}/roadmap`
      }
    })
    return { data, error }
  }
}

// Database helper functions
export const dbHelpers = {
  // Users
  getUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateUser: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Quizzes
  createQuiz: async (quizData: any) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single()
    return { data, error }
  },

  getQuizzes: async (userId: string) => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getQuiz: async (quizId: string) => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('id', quizId)
      .single()
    return { data, error }
  },

  // Quiz Results
  saveQuizResult: async (resultData: any) => {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert(resultData)
      .select()
      .single()
    return { data, error }
  },

  getQuizResults: async (userId: string) => {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*, quizzes(topic)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
    return { data, error }
  },

  // Study Plans
  createStudyPlan: async (planData: any) => {
    const { data, error } = await supabase
      .from('study_plans')
      .insert(planData)
      .select()
      .single()
    return { data, error }
  },

  getStudyPlans: async (userId: string) => {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*, study_tasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Study Tasks
  updateTask: async (taskId: string, updates: any) => {
    const { data, error } = await supabase
      .from('study_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    return { data, error }
  },

  // Notes
  createNote: async (noteData: any) => {
    const { data, error } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single()
    return { data, error }
  },

  getNotes: async (userId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  updateNote: async (noteId: string, updates: any) => {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single()
    return { data, error }
  },

  deleteNote: async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    return { error }
  }
}
