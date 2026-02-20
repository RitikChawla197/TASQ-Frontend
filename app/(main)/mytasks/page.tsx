"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, MoreVertical, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDepartmentTasks } from "@/store/slices/departmentTasks.slice";
import type { Task } from "@/types/task";

export default function MyTasksPage() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.departmentTasks.tasks);
  const loading = useAppSelector((state) => state.departmentTasks.loading);
  const error = useAppSelector((state) => state.departmentTasks.error);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const department =
      localStorage.getItem("department") ||
      (() => {
        const raw = localStorage.getItem("login_response");
        if (!raw) return "";
        try {
          const parsed = JSON.parse(raw) as { department?: string };
          return parsed.department || "";
        } catch {
          return "";
        }
      })();

    if (department.trim()) {
      dispatch(fetchDepartmentTasks(department.trim()));
    }
  }, [dispatch]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return sortedTasks;

    return sortedTasks.filter((task) => {
      const title = task.title.toLowerCase();
      const description = task.description?.toLowerCase() || "";
      const project = task.projectName?.toLowerCase() || "";
      return (
        title.includes(search) ||
        description.includes(search) ||
        project.includes(search)
      );
    });
  }, [sortedTasks, query]);

  const allChecked =
    filteredTasks.length > 0 && selectedIds.length === filteredTasks.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTasks.map((task) => task.id));
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
              <TableHead className="min-w-27.5">
                <span className="inline-flex items-center gap-1">
                  Status
                  <ArrowUpDown className="size-3.5" />
                </span>
              </TableHead>
              <TableHead className="min-w-25">Priority</TableHead>
              <TableHead className="min-w-32.5">Created At</TableHead>
              <TableHead className="min-w-30">Due Date</TableHead>
              <TableHead className="min-w-40">Project</TableHead>
              <TableHead className="min-w-30">Attachments</TableHead>
              <TableHead className="w-16 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="py-6 text-center text-red-600 dark:text-red-400">
                  Failed to load tasks: {error}
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const checked = selectedIds.includes(task.id);
                const priority = priorityLabel(task.priority);
                const status = statusLabel(task.status);
                const projectName = task.projectName || "Project";

                return (
                  <TableRow key={task.id}>
                    <TableCell className="align-top">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => toggleOne(task.id, next === true)}
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
                            {projectName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{projectName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <Paperclip className="size-3.5" />
                        {task.attachmentsCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mx-auto"
                        aria-label="Task actions"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
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
        <p>{selectedIds.length} of {filteredTasks.length} row(s) selected.</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
