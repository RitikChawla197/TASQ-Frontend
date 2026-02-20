"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import CreateTaskDialog from "@/components/kanban/taskDialog";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { taskApi } from "@/services/task.api";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { toast } from "sonner";

type TaskDialogContextType = {
  open: () => void;
};

const TaskDialogContext = createContext<TaskDialogContextType | null>(null);

export function TaskDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector((state) => state.project.selectedProject);

  const handleCreate = async ({
    title,
    status,
    priority,
    startDate,
    dueDate,
    userId,
    userName,
    description,
  }: {
    title: string;
    status: TaskStatus;
    priority?: TaskPriority;
    startDate?: Date;
    dueDate?: Date;
    userId: string;
    userName: string;
    description?: string;
  }) => {
    if (!selectedProject?.DATABASE) {
      throw new Error("No project selected");
    }

    const task: Omit<Task, "id" | "createdAt"> = {
      title,
      description,
      projectDatabase: selectedProject.DATABASE,
      projectName: selectedProject.PROJECT_NAME,
      priority,
      startDate: startDate ? startDate.getTime() : null,
      dueDate: dueDate ? dueDate.getTime() : null,
      attachmentsCount: 0,
      status,
      assignedUserId: userId,
      assignedUserName: userName,
    };

    await taskApi.createTask(task);
    toast.success("Task Created Succefully");
    await dispatch(fetchTasksByProjectName(selectedProject.PROJECT_NAME));
    window.dispatchEvent(new Event("tasks-updated"));
  };

  return (
    <TaskDialogContext.Provider value={{ open: () => setOpen(true) }}>
      {children}

      <CreateTaskDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreate}
      />
    </TaskDialogContext.Provider>
  );
}

export function useTaskDialog() {
  const ctx = useContext(TaskDialogContext);
  if (!ctx) {
    throw new Error("useTaskDialog must be used inside TaskDialogProvider");
  }
  return ctx;
}
