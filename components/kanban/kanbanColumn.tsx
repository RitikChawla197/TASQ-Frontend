"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Task } from "@/types/task";
import type { LucideIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";

const STATUS_DOT: Record<string, string> = {
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  blocked: "bg-red-500",
  backlog: "bg-pink-500",
  review: "bg-violet-500",
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-green-500 text-white",
};

interface Props {
  title: string;
  icon: LucideIcon;
  status: Task["status"];
  tasks: Task[];
  onMoveTask: (taskId: string, targetStatus: Task["status"]) => void;
}

export default function KanbanColumn({
  title,
  icon: Icon,
  status,
  tasks,
  onMoveTask,
}: Props) {
  const dotClass = STATUS_DOT[status] ?? "bg-slate-500";

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/task-id");
    if (!taskId) return;
    onMoveTask(taskId, status);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card className="w-full min-w-0 flex flex-col min-h-0 py-0 bg-muted/40 border">
      <CardHeader className="shrink-0 border-b px-2 py-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={`size-3 rounded-sm ${dotClass}`} />
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent
        className="flex-1 min-h-0 p-0 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="relative h-full max-h-[calc(95vh-230px)] pb-1">
          <ScrollArea className="h-full px-1.5 py-1.5">
            <div className="space-y-2">
              {tasks.length === 0 && (
                <p className="text-xs text-muted-foreground">No tasks</p>
              )}

              {tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/task-id", task.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="rounded-md border bg-card p-1.5 space-y-1 shadow-sm"
                >
                  <p className="text-xs font-semibold leading-4">{task.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description?.trim() || "Description"}
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* <span className="inline-flex rounded-sm bg-blue-600 px-1 py-0.5 text-[9px] font-semibold text-white">
                      {task.projectName ? task.projectName.slice(0, 8) : "PROJECT"}
                    </span> */}
                    <span
                      className={`inline-flex rounded-sm px-1 py-0.5 text-[9px] font-semibold uppercase ${
                        PRIORITY_BADGE[(task.priority || "medium").toLowerCase()] ??
                        "bg-amber-500 text-white"
                      }`}
                    >
                      {(task.priority || "medium").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pt-0.5">
                    <Avatar className="size-3.5 rounded-sm">
                      <AvatarFallback className="rounded-sm bg-blue-600 text-[8px] text-white font-semibold">
                        {task.assignedUserName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground truncate">
                        {task.assignedUserName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
