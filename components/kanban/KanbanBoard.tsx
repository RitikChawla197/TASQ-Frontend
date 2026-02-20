"use client";

import type { TaskStatus } from "@/types/task";
import KanbanColumn from "./kanbanColumn";
import {
  FileCheckCorner,
  CircleDashed,
  ListTodo,
  LucideIcon,
  ScanEye,
  TriangleAlert,
  Ban,
} from "lucide-react";
import { useKanbanFilter } from "./kanbanfiltercontext";
import { taskApi } from "@/services/task.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { toast } from "sonner";

const COLUMNS: { id: TaskStatus; title: string; icon: LucideIcon }[] = [
  { id: "todo", title: "To-do", icon: ListTodo },
  { id: "in_progress", title: "In Progress", icon: CircleDashed },
  { id: "completed", title: "Completed", icon: FileCheckCorner },
  { id: "blocked", title: "Blocked", icon: Ban },
  { id: "backlog", title: "Backlog", icon: TriangleAlert },
  { id: "review", title: "In Review", icon: ScanEye },
];

export default function KanbanBoard() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.taskByProjectName.tasks);
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const { filterUserId } = useKanbanFilter();

  const visibleTasks =
    filterUserId === "all"
      ? tasks
      : tasks.filter((t) => t.assignedUserId === filterUserId);

  const handleMoveTask = async (taskId: string, targetStatus: TaskStatus) => {
    const sourceTask = tasks.find((task) => task.id === taskId);
    if (!sourceTask || sourceTask.status === targetStatus) return;

    await taskApi.updateTask(taskId, { status: targetStatus });
    toast.success("Task updated successfully");
    if (selectedProject?.PROJECT_NAME) {
      await dispatch(fetchTasksByProjectName(selectedProject.PROJECT_NAME));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            icon={col.icon}
            status={col.id}
            tasks={visibleTasks.filter((t) => t.status === col.id)}
            onMoveTask={handleMoveTask}
          />
        ))}
      </div>
    </div>
  );
}
