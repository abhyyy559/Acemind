// Study Session Service for AI Planner functionality

import { apiClient, ApiError } from "./api";

// Types for Study Session functionality
export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  subject: string;
  estimatedDuration: number; // in minutes
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  taskId?: string;
  subject: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  notes?: string;
  completed: boolean;
  createdAt: Date;
}

export interface CreateStudySessionDto {
  userId: string;
  taskId?: string;
  subject: string;
  topic: string;
  startTime: Date;
  durationMinutes: number;
  notes?: string;
}

export interface StudyStats {
  today: number; // minutes studied today
  week: number; // minutes studied this week
  total: number; // total minutes studied
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  subject: string;
  estimatedDuration: number;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  subject?: string;
  estimatedDuration?: number;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  completed?: boolean;
}

export interface PlannerData {
  tasks: StudyTask[];
  sessions: StudySession[];
  stats: StudyStats;
}

export class StudySessionService {
  async createStudySession(
    sessionData: CreateStudySessionDto
  ): Promise<StudySession> {
    try {
      return await apiClient.post<StudySession>("/study-sessions", sessionData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to create study session",
        "CREATE_SESSION_ERROR",
        error
      );
    }
  }

  async getStudySessions(userId: string): Promise<StudySession[]> {
    try {
      return await apiClient.get<StudySession[]>("/study-sessions");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to fetch study sessions",
        "FETCH_SESSIONS_ERROR",
        error
      );
    }
  }

  async getStudyStats(userId: string): Promise<StudyStats> {
    try {
      return await apiClient.get<StudyStats>("/study-sessions/stats");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to fetch study statistics",
        "FETCH_STATS_ERROR",
        error
      );
    }
  }

  // Task management methods (these would need corresponding backend endpoints)
  async createTask(taskData: CreateTaskDto): Promise<StudyTask> {
    try {
      return await apiClient.post<StudyTask>("/tasks", taskData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to create task", "CREATE_TASK_ERROR", error);
    }
  }

  async getTasks(userId: string): Promise<StudyTask[]> {
    try {
      return await apiClient.get<StudyTask[]>("/tasks");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to fetch tasks", "FETCH_TASKS_ERROR", error);
    }
  }

  async updateTask(taskId: string, updates: UpdateTaskDto): Promise<StudyTask> {
    try {
      return await apiClient.put<StudyTask>(`/tasks/${taskId}`, updates);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to update task", "UPDATE_TASK_ERROR", error);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to delete task", "DELETE_TASK_ERROR", error);
    }
  }

  async getPlannerData(userId: string): Promise<PlannerData> {
    try {
      const [tasks, sessions, stats] = await Promise.all([
        this.getTasks(userId),
        this.getStudySessions(userId),
        this.getStudyStats(userId),
      ]);

      return { tasks, sessions, stats };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to fetch planner data",
        "FETCH_PLANNER_ERROR",
        error
      );
    }
  }

  // AI-powered study planning methods
  async generateStudyPlan(
    subjects: string[],
    availableHours: number,
    goals: string[]
  ): Promise<StudyTask[]> {
    try {
      return await apiClient.post<StudyTask[]>("/ai/generate-study-plan", {
        subjects,
        availableHours,
        goals,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to generate AI study plan",
        "AI_PLAN_ERROR",
        error
      );
    }
  }

  async optimizeSchedule(
    tasks: StudyTask[],
    preferences: any
  ): Promise<StudyTask[]> {
    try {
      return await apiClient.post<StudyTask[]>("/ai/optimize-schedule", {
        tasks,
        preferences,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to optimize schedule",
        "AI_OPTIMIZE_ERROR",
        error
      );
    }
  }
}

// Create a default instance
export const studySessionService = new StudySessionService();
