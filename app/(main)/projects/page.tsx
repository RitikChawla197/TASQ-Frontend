"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import Dashboard from "@/components/dashboard(project)/dash";
import ProjectCalendar from "@/components/dashboard(project)/project-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import TaskTable from "@/components/dashboard(project)/table";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { Loader2, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";
import { taskApi } from "@/services/task.api";
import type { TaskPriority, TaskStatus } from "@/types/task";
import { toast } from "sonner";

export default function AssignTasksPage() {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const tasksLoading = useAppSelector(
    (state) => state.taskByProjectName.loading
  );
  const tasks = useAppSelector((state) => state.taskByProjectName.tasks);
  const tasksError = useAppSelector((state) => state.taskByProjectName.error);
  const members = useAppSelector((state) => state.members.members);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!selectedProject?.PROJECT_NAME) return;
    dispatch(fetchTasksByProjectName(selectedProject.PROJECT_NAME));
  }, [dispatch, selectedProject?.PROJECT_NAME]);

  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersByDepartment());
      return;
    }

    if (!userId) {
      setUserId(String(members[0].id));
    }
  }, [dispatch, members, userId]);

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

  if (!selectedProject) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No project selected
      </div>
    );
  }

  const selectedUser = members.find((u) => String(u.id) === userId);

  const handleCreateFirstTask = async () => {
    if (!title.trim() || !selectedUser) return;

    setCreating(true);
    try {
      await taskApi.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        projectDatabase: selectedProject.DATABASE,
        projectName: selectedProject.PROJECT_NAME,
        priority,
        startDate: startDate ? startDate.getTime() : null,
        dueDate: dueDate ? dueDate.getTime() : null,
        status,
        assignedUserId: String(selectedUser.id),
        assignedUserName: selectedUser.name,
      });
      toast.success("Task Created Succefully");

      await dispatch(fetchTasksByProjectName(selectedProject.PROJECT_NAME));
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setStartDate(undefined);
      setDueDate(undefined);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {tasksLoading && tasks.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading tasks...
          </div>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <Card className="mx-auto w-full max-w-3xl rounded-md border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Create your First Task to proceed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Task Name</label>
              <Input
                placeholder="Enter task name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Assignee</label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <span>
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </span>
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

              <div className="flex justify-end">
                <Button
                  onClick={handleCreateFirstTask}
                  disabled={creating || !selectedUser || !title.trim()}
                >
                  {creating ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-0 gap-0"
        >
          <TabsList className="w-fit">
            <TabsTrigger value="dashboard" className="text-xs">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="table" className="text-xs">
              Table
            </TabsTrigger>
            <TabsTrigger value="kanban" className="text-xs">
              Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs">
              Calendar
            </TabsTrigger>
            
          </TabsList>
          <TabsContent value="dashboard">
            <CardContent className="px-0 py-2  text-sm text-muted-foreground">
              <Dashboard />
            </CardContent>
          </TabsContent>
          <TabsContent value="table">
            <CardContent className="px-0 py-2 text-sm text-muted-foreground">
              <TaskTable />
            </CardContent>
          </TabsContent>
          <TabsContent value="kanban">
            <CardContent className="flex flex-col min-h-0 flex-1 overflow-hidden max-h-[calc(95vh-170px)] px-0 py-2">
              <KanbanBoard />
            </CardContent>
          </TabsContent>
          <TabsContent value="calendar">
            <CardContent className="px-0 py-2">
              <ProjectCalendar />
            </CardContent>
          </TabsContent>
         
        </Tabs>
      )}

      {tasksError && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          Failed to load tasks: {tasksError}
        </div>
      )}
    </>
  );
}
