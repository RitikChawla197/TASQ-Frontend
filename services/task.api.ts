import { api } from "./api";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

type RawTask = Record<string, unknown>;

export interface GetTasksParams {
  projectDatabase?: string;
  assignedUserId?: string;
  status?: TaskStatus;
  search?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectDatabase?: string;
  projectName?: string;
  priority?: TaskPriority;
  startDate?: number | null;
  dueDate?: number | null;
  status: TaskStatus;
  assignedUserId: string;
  assignedUserName: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  startDate?: number | null;
  dueDate?: number | null;
  status?: TaskStatus;
  projectDatabase?: string;
  projectName?: string;
  assignedUserId?: string;
  assignedUserName?: string;
}

const toNumberDate = (value: unknown): number | null | undefined => {
  if (value === null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Backend may send microsecond precision (e.g. .453000), normalize for JS Date parsing.
    const normalized = value.replace(
      /(\.\d{3})\d+(?=(Z|[+-]\d{2}:\d{2})?$)/,
      "$1"
    );
    const ts = Date.parse(normalized);
    if (!Number.isNaN(ts)) return ts;
  }
  return undefined;
};

const toString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const cleanOptionalText = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  const lower = normalized.toLowerCase();
  if (lower === "undefined" || lower === "null") return undefined;
  return normalized;
};

const statusFromApi = (value: unknown): TaskStatus => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (normalized === "todo" || normalized === "to_do") return "todo";
  if (normalized === "in_progress" || normalized === "inprogress")
    return "in_progress";
  if (normalized === "completed") return "completed";
  if (normalized === "blocked") return "blocked";
  if (normalized === "backlog") return "backlog";
  if (normalized === "review" || normalized === "in_review") return "review";
  return "todo";
};

const priorityFromApi = (value: unknown): TaskPriority => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  return "low";
};

const statusToApi = (status: TaskStatus): string => {
  if (status === "in_progress") return "IN_PROGRESS";
  return status.toUpperCase();
};

const priorityToApi = (priority?: TaskPriority): string | undefined =>
  priority ? priority.toUpperCase() : undefined;

const toIso = (value?: number | null): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value).toISOString();
};

const getTasksCreateUrl = (): string => {
  const base = String(api.defaults.baseURL ?? "").replace(/\/+$/, "");
  if (base.endsWith("/user")) {
    return `${base.slice(0, -"/user".length)}/tasks/create_task`;
  }
  return `${base}/tasks/create_task`;
};

const normalizeTask = (raw: RawTask): Task => {
  const startDate = toNumberDate(raw.startDate ?? raw.start_date);
  const dueDate = toNumberDate(raw.dueDate ?? raw.due_date);
  const createdAtValue = toNumberDate(raw.createdAt ?? raw.created_at);

  return {
    id: toString(raw.id ?? raw.task_id) ?? crypto.randomUUID(),
    title: toString(raw.title) ?? "Untitled Task",
    description: toString(raw.description),
    projectDatabase: toString(
      raw.projectDatabase ?? raw.project_database ?? raw.project_id
    ),
    projectName: cleanOptionalText(
      toString(raw.projectName ?? raw.project_name)
    ),
    priority: priorityFromApi(raw.priority),
    startDate,
    dueDate,
    attachmentsCount:
      typeof raw.attachmentsCount === "number"
        ? raw.attachmentsCount
        : typeof raw.attachments_count === "number"
        ? raw.attachments_count
        : 0,
    status: statusFromApi(raw.status),
    assignedUserId:
      toString(raw.assignedUserId ?? raw.assigned_user_id) ?? "",
    assignedUserName:
      toString(raw.assignedUserName ?? raw.assigned_user_name) ?? "User",
    createdAt: createdAtValue ?? Date.now(),
  };
};

const normalizeTaskList = (data: unknown): Task[] => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeTask(item as RawTask));
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return obj.items.map((item) => normalizeTask(item as RawTask));
    }
    if (Array.isArray(obj.results)) {
      return obj.results.map((item) => normalizeTask(item as RawTask));
    }
    if (Array.isArray(obj.tasks)) {
      return obj.tasks.map((item) => normalizeTask(item as RawTask));
    }
  }

  return [];
};

export const taskApi = {
  async getTasks(params: GetTasksParams = {}): Promise<Task[]> {
    const res = await api.get("/tasks", { params });
    return normalizeTaskList(res.data);
  },

  async getTasksByDepartment(department: string): Promise<Task[]> {
    const normalizedDepartment = department.trim();
    const encodedDepartment = encodeURIComponent(normalizedDepartment);
    const res = await api.get(`/tasks/by_department/${encodedDepartment}`);
    return normalizeTaskList(res.data);
  },

  async getTasksByProjectName(projectName: string): Promise<Task[]> {
    const normalizedProjectName = projectName.trim();
    const encodedProjectName = encodeURIComponent(normalizedProjectName);
    const res = await api.get(`/tasks/task_by_name/${encodedProjectName}`);
    return normalizeTaskList(res.data).map((task) => ({
      ...task,
      projectName: cleanOptionalText(task.projectName) ?? normalizedProjectName,
    }));
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const projectId = Number(payload.projectDatabase);
    const assignedUserId = Number(payload.assignedUserId);

    const requestBody = {
      title: payload.title,
      description: payload.description ?? "",
      project_id: Number.isNaN(projectId)
        ? payload.projectDatabase
        : projectId,
      assigned_user_id: Number.isNaN(assignedUserId)
        ? payload.assignedUserId
        : assignedUserId,
      status: statusToApi(payload.status),
      priority: priorityToApi(payload.priority),
      start_date: toIso(payload.startDate),
      due_date: toIso(payload.dueDate),
    };

    const res = await api.post(getTasksCreateUrl(), requestBody);

    if (res.data && typeof res.data === "object") {
      return normalizeTask(res.data as RawTask);
    }

    return {
      id: crypto.randomUUID(),
      title: payload.title,
      description: payload.description,
      projectDatabase: payload.projectDatabase,
      projectName: payload.projectName,
      priority: payload.priority ?? "medium",
      startDate: payload.startDate ?? null,
      dueDate: payload.dueDate ?? null,
      attachmentsCount: 0,
      status: payload.status,
      assignedUserId: payload.assignedUserId,
      assignedUserName: payload.assignedUserName,
      createdAt: Date.now(),
    };
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const assignedUserId = Number(payload.assignedUserId);
    const projectId = Number(payload.projectDatabase);

    const requestBody: Record<string, unknown> = {};
    requestBody.id = Number.isNaN(Number(id)) ? id : Number(id);
    if (payload.title !== undefined) requestBody.title = payload.title;
    if (payload.description !== undefined)
      requestBody.description = payload.description;
    if (payload.priority !== undefined)
      requestBody.priority = priorityToApi(payload.priority);
    if (payload.status !== undefined)
      requestBody.status = statusToApi(payload.status);
    if (payload.assignedUserId !== undefined) {
      requestBody.assigned_user_id = Number.isNaN(assignedUserId)
        ? payload.assignedUserId
        : assignedUserId;
    }
    if (payload.assignedUserName !== undefined)
      requestBody.assigned_user_name = payload.assignedUserName;
    if (payload.projectDatabase !== undefined) {
      requestBody.project_id = Number.isNaN(projectId)
        ? payload.projectDatabase
        : projectId;
    }
    if (payload.projectName !== undefined)
      requestBody.project_name = payload.projectName;
    if (payload.startDate !== undefined)
      requestBody.start_date = toIso(payload.startDate);
    if (payload.dueDate !== undefined) requestBody.due_date = toIso(payload.dueDate);

    const res = await api.put("/tasks/update_by_name", requestBody);
    return normalizeTask(res.data as RawTask);
  },

  async deleteTask(id: string): Promise<void> {
    const taskId = Number.isNaN(Number(id)) ? id : Number(id);
    await api.delete(`/tasks/delete/${taskId}`);
  },
};
