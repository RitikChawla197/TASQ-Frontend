"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ChevronDown, MoreVertical, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { Task } from "@/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { taskApi } from "@/services/task.api";

export default function TaskTable() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const selectedProject = useAppSelector((state) => state.project.selectedProject);
  const tasks = useAppSelector((state) => state.taskByProjectName.tasks);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];

    const inProject = [...tasks].sort((a, b) => b.createdAt - a.createdAt);

    const search = query.trim().toLowerCase();
    if (!search) return inProject;

    return inProject.filter((task) => {
      const title = task.title.toLowerCase();
      const description = task.description?.toLowerCase() || "";
      const user = task.assignedUserName.toLowerCase();
      return (
        title.includes(search) ||
        description.includes(search) ||
        user.includes(search)
      );
    });
  }, [tasks, selectedProject, query]);

  const allChecked = projectTasks.length > 0 && selectedIds.length === projectTasks.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(projectTasks.map((task) => task.id));
      return;
    }
    setSelectedIds([]);
  };

  const toggleOne = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, taskId]);
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => id !== taskId));
  };

  const statusLabel = (status: Task["status"]) => {
    const normalized = String(status).toLowerCase();
    if (normalized === "todo") return "To Do";
    if (normalized === "in_progress") return "In Progress";
    if (normalized === "review") return "In Review";
    if (normalized === "completed") return "Completed";
    if (normalized === "backlog") return "Backlog";
    if (normalized === "blocked") return "Blocked";
    return String(status);
  };

  const statusBadgeClass = (status: Task["status"]) => {
    const normalized = String(status).toLowerCase();
    if (normalized === "todo") return "bg-blue-600 text-white";
    if (normalized === "in_progress") return "bg-purple-600 text-white";
    if (normalized === "review") return "bg-yellow-500 text-black";
    if (normalized === "completed") return "bg-green-600 text-white";
    if (normalized === "backlog") return "bg-red-600 text-white";
    if (normalized === "blocked") return "bg-black text-white";
    return "bg-slate-500 text-white";
  };

  const priorityLabel = (priority: Task["priority"]) => {
    if (!priority) return "Low";
    if (priority === "high") return "High";
    if (priority === "medium") return "Medium";
    return "Low";
  };

  const priorityBadgeClass = (priority: Task["priority"]) => {
    const normalized = String(priority || "low").toLowerCase();
    if (normalized === "high") return "bg-red-600 text-white";
    if (normalized === "medium") return "bg-yellow-500 text-black";
    return "bg-green-600 text-white";
  };

  return (
    <Card className="rounded-md border p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter task title..."
          className="max-w-sm"
        />
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          Columns
          <ChevronDown className="size-3.5" />
        </Button>
      </div>

      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="text-left">
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                />
              </TableHead>
              <TableHead className="min-w-55">
                <span className="inline-flex items-center gap-1">
                  Task Title
                  <ArrowUpDown className="size-3.5" />
                </span>
              </TableHead>
              <TableHead className="min-w-27.5">Status</TableHead>
              <TableHead className="min-w-25">Priority</TableHead>
              <TableHead className="min-w-32.5">Created At</TableHead>
              <TableHead className="min-w-30">Due Date</TableHead>
              <TableHead className="min-w-37.5">Assigned To</TableHead>
              <TableHead className="min-w-30">Attachments</TableHead>
              <TableHead className="w-16 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
              {projectTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                projectTasks.map((task) => {
                  const checked = selectedIds.includes(task.id);
                  const priority = priorityLabel(task.priority);
                  const status = statusLabel(task.status);

                  return (
                    <TableRow key={task.id}>
                      <TableCell className="align-top">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) =>
                            toggleOne(task.id, next === true)
                          }
                        />
                      </TableCell>

                      <TableCell>
                      <Link
                        href={`/projects/tasks/${task.id}`}
                        className="font-semibold hover:underline"
                      >
                        {task.title}
                      </Link>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeClass(task.status)}`}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityBadgeClass(task.priority)}`}
                        >
                          {priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(task.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2">
                          <Avatar className="size-6 rounded-sm">
                            <AvatarFallback className="rounded-sm bg-blue-600 text-[9px] font-semibold text-white">
                              {task.assignedUserName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{task.assignedUserName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Paperclip className="size-3.5" />
                          {task.attachmentsCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="mx-auto"
                              aria-label="Task actions"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onSelect={() => {
                                router.push(`/projects/tasks/${task.id}`);
                              }}
                            >
                              View Task
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => {
                                setDeleteTarget(task);
                              }}
                            >
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>{selectedIds.length} of {projectTasks.length} row(s) selected.</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;
                setDeleting(true);
                try {
                  await taskApi.deleteTask(deleteTarget.id);
                  if (selectedProject?.PROJECT_NAME) {
                    await dispatch(fetchTasksByProjectName(selectedProject.PROJECT_NAME));
                  }
                  setDeleteTarget(null);
                } catch (error) {
                  console.error("Failed to delete task:", error);
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
