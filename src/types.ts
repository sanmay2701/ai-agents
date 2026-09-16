export interface StudentProfile {
  name: string;
  degree: string;
  yearSemester: string;
  currentGpa: string;
  targetGpa: string;
  weeklyStudyHours: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  code?: string;
  credits: number;
  currentMarks: number; // e.g. 68 out of 100
  targetMarks: number;  // e.g. 85 out of 100
  attendancePercentage: number; // e.g. 78%
  difficulty: number; // 1 to 5 scale
  examDate?: string; // YYYY-MM-DD
  status: 'not_started' | 'in_progress' | 'confident';
  weakTopics: string;
  weightageRemaining?: number; // e.g. 40% of grade remaining in final exam
}

export interface AcademicRisk {
  id: string;
  type: 'attendance' | 'deadline' | 'performance_deficit' | 'workload';
  severity: 'critical' | 'moderate' | 'low';
  subjectName: string;
  title: string;
  description: string;
  actionableSteps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface StudySessionItem {
  id: string;
  day: string; // e.g. "Monday"
  timeSlot: string; // e.g. "09:00 - 10:30 AM"
  subject: string;
  focusTopic: string;
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export type ActiveTab = 'advisor' | 'tracker' | 'planner' | 'concept_studio' | 'goals' | 'careers';
