export type TaskCategory = 'Assignment' | 'Test' | 'Lab' | 'Project';
export type TargetAudience = 'All Students' | 'Batch A' | 'Batch B' | 'Batch C' | 'All' | 'Batch 1' | 'Batch 2' | 'Batch 3';
export type StudentBatch = 'Batch A' | 'Batch B' | 'Batch C' | 'Batch 1' | 'Batch 2' | 'Batch 3';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  due_date: string;
  target_audience: string;
  drive_url?: string | null;
  created_at?: string;
  created_by?: string;
}

export interface Completion {
  id: string;
  task_id: string;
  user_id: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  student_id: string;
  student_name?: string;
  full_name?: string;
  class_name?: string;
  roll_number?: string;
  role: 'Student' | 'CR';
  batch: string;
  last_login_at?: string;
  created_at?: string;
}
