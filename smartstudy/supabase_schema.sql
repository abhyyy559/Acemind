-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Supabase Auth Integration
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- User Preferences
  theme VARCHAR(20) DEFAULT 'light',
  daily_study_goal INTEGER DEFAULT 120, -- minutes
  notification_enabled BOOLEAN DEFAULT true,
  
  -- Stats
  total_quizzes INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- minutes
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE
);

-- Row Level Security for Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Quizzes Table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  source_type VARCHAR(20), -- 'text', 'pdf', 'url'
  source_content TEXT,
  source_url TEXT,
  num_questions INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  generation_method VARCHAR(50), -- 'ollama', 'deepseek', 'openai'
  generation_time INTEGER, -- seconds
  content_word_count INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' -- 'draft', 'active', 'completed'
);

-- Indexes for Quizzes
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- RLS for Quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quizzes"
  ON quizzes FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own quizzes"
  ON quizzes FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own quizzes"
  ON quizzes FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Questions
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);

-- RLS for Questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions of own quizzes"
  ON questions FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM quizzes 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage questions of own quizzes"
  ON questions FOR ALL
  USING (
    quiz_id IN (
      SELECT id FROM quizzes 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Quiz Results Table
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_spent INTEGER NOT NULL, -- seconds
  answers JSONB NOT NULL, -- {"question_id": "selected_answer"}
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Quiz Results
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results(completed_at DESC);

-- RLS for Quiz Results
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
  ON quiz_results FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own results"
  ON quiz_results FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Study Plans Table
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  exam_date DATE NOT NULL,
  daily_study_hours DECIMAL(4,2) NOT NULL,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' -- 'active', 'completed', 'archived'
);

-- Indexes for Study Plans
CREATE INDEX idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX idx_study_plans_status ON study_plans(status);

-- RLS for Study Plans
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study plans"
  ON study_plans FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Study Tasks Table
CREATE TABLE study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20),
  priority VARCHAR(20),
  duration INTEGER NOT NULL, -- minutes
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Study Tasks
CREATE INDEX idx_study_tasks_plan_id ON study_tasks(study_plan_id);
CREATE INDEX idx_study_tasks_date ON study_tasks(scheduled_date);
CREATE INDEX idx_study_tasks_completed ON study_tasks(completed);

-- RLS for Study Tasks
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks of own plans"
  ON study_tasks FOR ALL
  USING (
    study_plan_id IN (
      SELECT id FROM study_plans 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Notes Table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Notes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- Full-text search for Notes
CREATE INDEX idx_notes_search ON notes USING GIN(
  to_tsvector('english', title || ' ' || content)
);

-- RLS for Notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes"
  ON notes FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();