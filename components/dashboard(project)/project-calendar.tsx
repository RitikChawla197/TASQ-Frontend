"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { taskApi } from "@/services/task.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { toast } from "sonner";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProjectCalendar() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.taskByProjectName.tasks);
  const selectedProject = useAppSelector((state) => state.project.selectedProject);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, typeof tasks>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = format(new Date(task.dueDate), "yyyy-MM-dd");
      const existing = grouped.get(key) ?? [];
      existing.push(task);
      grouped.set(key, existing);
    });
    return grouped;
  }, [tasks]);

  const unscheduledTasks = useMemo(
    () => tasks.filter((task) => !task.dueDate),
    [tasks]
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const output: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      output.push(day);
      day = addDays(day, 1);
    }
    return output;
  }, [currentMonth]);

  const handleDropToDate = async (
    e: React.DragEvent<HTMLDivElement>,
    targetDate: Date
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/task-id");
    if (!taskId || !selectedProject?.PROJECT_NAME) return;

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    if (task.dueDate && isSameDay(new Date(task.dueDate), targetDate)) {
      return;
    }

    // Use local midday to avoid timezone rollover when serialized to ISO.
    const nextDueDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      12,
      0,
      0,
      0
    ).getTime();

    setMovingTaskId(taskId);
    try {
      await taskApi.updateTask(taskId, { dueDate: nextDueDate });
      toast.success("Task updated successfully");
      await dispatch(fetchTasksByProjectName(selectedProject.PROJECT_NAME));
    } finally {
      setMovingTaskId(null);
    }
  };

  return (
    <Card className="rounded-md border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1">
          {DAY_HEADERS.map((label) => (
            <div
              key={label}
              className="rounded-md border bg-muted/40 px-2 py-1 text-center text-xs font-semibold text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(dayKey) ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dayKey}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  void handleDropToDate(e, day);
                }}
                className={`min-h-42 rounded-md border p-2 ${
                  inMonth ? "bg-card" : "bg-muted/20"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p
                    className={`text-xs font-semibold ${
                      inMonth ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </p>
                  {isToday && (
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Today
                    </span>
                  )}
                </div>

                <ScrollArea className="h-30">
                  <div className="space-y-1 pr-2">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/task-id", task.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="cursor-grab rounded border bg-muted/40 px-2 py-1 text-[11px] active:cursor-grabbing"
                      >
                        <p className="truncate font-medium">{task.title}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Avatar className="size-4 rounded-sm">
                            <AvatarFallback className="rounded-sm bg-blue-600 text-[8px] font-semibold text-white">
                              {task.assignedUserName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {task.assignedUserName}
                          </p>
                        </div>
                      </div>
                    ))}
                    {dayTasks.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">No tasks</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        {unscheduledTasks.length > 0 && (
          <div className="rounded-md border border-dashed p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Tasks Without Due Date (Drag into calendar)
            </p>
            <div className="flex flex-wrap gap-2">
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/task-id", task.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="cursor-grab rounded-md border bg-muted/40 px-2 py-1 text-xs active:cursor-grabbing"
                >
                  <p className="truncate font-medium">{task.title}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Avatar className="size-4 rounded-sm">
                      <AvatarFallback className="rounded-sm bg-blue-600 text-[8px] font-semibold text-white">
                        {task.assignedUserName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {task.assignedUserName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {movingTaskId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Updating due date...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
