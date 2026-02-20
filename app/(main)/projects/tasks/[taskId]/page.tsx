"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, PenLine } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { taskApi } from "@/services/task.api";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TaskDetailsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ taskId: string | string[] }>();
  const taskId = Array.isArray(params.taskId) ? params.taskId[0] : params.taskId;
  const tasksFromStore = useAppSelector((state) => state.taskByProjectName.tasks);
  const members = useAppSelector((state) => state.members.members);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  useEffect(() => {
    if (!taskId) return;

    const taskFromStore =
      tasksFromStore.find((item) => String(item.id) === String(taskId)) || null;

    if (taskFromStore) {
      setTask(taskFromStore);
      setLoading(false);
      return;
    }

    const loadTask = async () => {
      setLoading(true);
      try {
        const allTasks = await taskApi.getTasks();
        const currentTask =
          allTasks.find((item) => String(item.id) === String(taskId)) || null;
        setTask(currentTask);
      } catch (error) {
        console.error("Failed to load task details:", error);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId, tasksFromStore]);

  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersByDepartment());
    }
  }, [dispatch, members.length]);

  useEffect(() => {
    if (!startDate || !dueDate) return;
    const startOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const dueOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );
    if (dueOnly <= startOnly) {
      setDueDate(undefined);
    }
  }, [startDate, dueDate]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading task...</div>;
  }

  if (!task) {
    return <div className="p-6 text-sm text-muted-foreground">Task not found.</div>;
  }

  const assigneeName = task.assignedUserName || "User";
  const assigneeInitial = assigneeName.charAt(0).toUpperCase();
  const projectName = task.projectName || "No project";
  const projectInitial = projectName.charAt(0).toUpperCase();
  const selectedUser = members.find((member) => String(member.id) === userId);

  const openEditDialog = () => {
    setTitle(task.title);
    setStatus(task.status);
    setPriority(task.priority ?? "medium");
    setUserId(task.assignedUserId ? String(task.assignedUserId) : "");
    setDescription(task.description ?? "");
    setStartDate(task.startDate ? new Date(task.startDate) : undefined);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setIsEditOpen(true);
  };

  const handleEditTask = async () => {
    if (!task || !title.trim()) return;

    setSaving(true);
    try {
      const updated = await taskApi.updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || "",
        status,
        priority,
        projectDatabase: task.projectDatabase,
        projectName: task.projectName,
        assignedUserId: userId || task.assignedUserId,
        assignedUserName: selectedUser?.name || task.assignedUserName,
        startDate: startDate ? startDate.getTime() : null,
        dueDate: dueDate ? dueDate.getTime() : null,
      });

      const mergedTask: Task = {
        ...task,
        ...updated,
        id: String(task.id),
        projectName: updated.projectName ?? task.projectName,
      };
      setTask(mergedTask);

      if (mergedTask.projectName) {
        await dispatch(fetchTasksByProjectName(mergedTask.projectName));
      }

      toast.success("Task updated successfully");
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (status: Task["status"]) => {
    const normalized = String(status).toLowerCase();
    if (normalized === "todo") return "TODO";
    if (normalized === "in_progress") return "IN PROGRESS";
    if (normalized === "review") return "IN REVIEW";
    if (normalized === "completed") return "COMPLETED";
    if (normalized === "backlog") return "BACKLOG";
    if (normalized === "blocked") return "BLOCKED";
    return String(status).toUpperCase();
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
    if (!priority) return "LOW";
    if (priority === "high") return "HIGH";
    if (priority === "medium") return "MEDIUM";
    return "LOW";
  };

  const priorityBadgeClass = (priority: Task["priority"]) => {
    const normalized = String(priority || "low").toLowerCase();
    if (normalized === "high") return "bg-red-600 text-white";
    if (normalized === "medium") return "bg-yellow-600 text-white";
    return "bg-green-600 text-white";
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-5 flex justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </div>

      <Card className="rounded-md border lg:col-span-3">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">
                  {task.title}
                </h1>
                <div className="mt-2 inline-flex items-center gap-2 text-base font-medium text-muted-foreground">
                  <Avatar className="size-8 rounded-md">
                    <AvatarFallback className="rounded-md bg-blue-600 text-sm font-semibold text-white">
                      {projectInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span>{projectName}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 px-2"
                  onClick={openEditDialog}
                >
                  <PenLine className="size-4" />
                  Edit Task
                </Button>

                <div className="inline-flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Assigned to:</span>
                  <Avatar className="size-7 rounded-md">
                    <AvatarFallback className="rounded-md bg-blue-600 text-xs font-semibold text-white">
                      {assigneeInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{assigneeName}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Description</h2>
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description?.trim() || "No description provided."}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold tracking-tight">Additional Details</h3>

              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span
                      className={`mt-2 inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold uppercase ${statusBadgeClass(task.status)}`}
                    >
                      {statusLabel(task.status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <span
                      className={`mt-2 inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold uppercase ${priorityBadgeClass(task.priority)}`}
                    >
                      {priorityLabel(task.priority)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="mt-2 text-lg font-medium">
                    {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card className="rounded-md border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Add a comment..." rows={5} />
            <Button type="button" variant="secondary">
              Post Comment
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No attachments yet.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Edit Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mx-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Task Name</label>
              <Input
                placeholder="Enter task name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Assignee</label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Priority</label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">LOW</SelectItem>
                    <SelectItem value="medium">MEDIUM</SelectItem>
                    <SelectItem value="high">HIGH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <span>
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </span>
                      <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <span>{dueDate ? format(dueDate, "PPP") : "Pick a date"}</span>
                      <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      disabled={(date) =>
                        !!startDate &&
                        date <=
                          new Date(
                            startDate.getFullYear(),
                            startDate.getMonth(),
                            startDate.getDate()
                          )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">TO DO</SelectItem>
                  <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                  <SelectItem value="backlog">BACKLOG</SelectItem>
                  <SelectItem value="completed">COMPLETED</SelectItem>
                  <SelectItem value="blocked">BLOCKED</SelectItem>
                  <SelectItem value="review">IN REVIEW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Description</label>
              <Textarea
                placeholder="Write task description..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                className="rounded-sm"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="rounded-sm"
                onClick={handleEditTask}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
