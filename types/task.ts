export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "blocked"
  | "backlog"
  | "review";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectDatabase?: string;
  projectName?: string;
  priority?: TaskPriority;
  startDate?: number | null;
  dueDate?: number | null;
  attachmentsCount?: number;
  status: TaskStatus;
  assignedUserId: string;
  assignedUserName: string;
  createdAt: number;
}
