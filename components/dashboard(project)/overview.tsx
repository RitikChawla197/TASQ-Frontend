"use client";

import { Card } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";
import type { Task } from "@/types/task";
import { formatDistanceToNow } from "date-fns";
import { Label, Pie, PieChart } from "recharts";

interface OverviewProps {
  tasks: Task[];
}

export default function Overview({ tasks }: OverviewProps) {
  const totalTasks = tasks.length;
  const statusSegments = [
    { key: "todo", label: "To Do", color: "#2563eb" },
    { key: "in_progress", label: "In Progress", color: "#eab308" },
    { key: "completed", label: "Completed", color: "#16a34a" },
    { key: "review", label: "In Review", color: "#9333ea" },
    { key: "blocked", label: "Blocked", color: "#ef4444" },
    { key: "backlog", label: "Backlog", color: "#ec4899" },
  ] as const;

  const segmentData = statusSegments.map((segment) => {
    const count = tasks.filter((task) => task.status === segment.key).length;
    return { ...segment, count, fill: segment.color };
  });

  const donutChartConfig = statusSegments.reduce((acc, segment) => {
    acc[segment.key] = {
      label: segment.label,
      color: segment.color,
    };
    return acc;
  }, {} as ChartConfig);
  const recentActivities =
    tasks.length > 0
      ? tasks.slice(0, 6).map((task) => ({
          id: task.id,
          user: task.assignedUserName || "User",
          action: `created task "${task.title}"`,
          time: formatDistanceToNow(new Date(task.createdAt), {
            addSuffix: true,
          }),
        }))
      : [];

  const recentComments = tasks
    .filter((task) => task.description?.trim())
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      user: task.assignedUserName || "User",
      comment: task.description!.trim(),
      time: formatDistanceToNow(new Date(task.createdAt), {
        addSuffix: true,
      }),
    }));

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Card className="rounded-md border p-4 min-h-62.5">
        <h3 className="scroll-m-20 text-xl font-bold tracking-tight text-balance text-center">
          Task Distribution
        </h3>

        <div className="mt-5 flex items-center justify-center">
          <ChartContainer config={donutChartConfig} className="h-[220px] w-full max-w-[280px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="key" />}
              />
              <Pie
                data={segmentData}
                dataKey="count"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-semibold"
                        >
                          {totalTasks}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-xs"
                        >
                          Tasks
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="rounded-md border p-4 min-h-62.5">
        <h3 className=" text-md font-bold tracking-tight">Recent Activity</h3>

        <div className="mt-4 space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent activity</p>
          ) : (
            <ScrollArea className="h-[240px] pr-2">
              <div className="space-y-3">
                {recentActivities.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Avatar className="size-7 rounded-md shrink-0">
                      <AvatarFallback className="rounded-md bg-blue-600 text-white text-xs font-semibold">
                        {item.user
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm leading-4">
                        {item.user} {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </div>
      </Card>

      <Card className="rounded-md border p-4 min-h-62.5">
        <h3 className=" text-md font-bold tracking-tight">Recent Comments</h3>
        <div className="mt-4 space-y-3">
          {recentComments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent comments</p>
          ) : (
            <ScrollArea className="h-[240px] pr-2">
              <div className="space-y-3">
                {recentComments.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Avatar className="size-7 rounded-md shrink-0">
                      <AvatarFallback className="rounded-md bg-slate-700 text-white text-xs font-semibold">
                        {item.user
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm leading-4 truncate">{item.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
}
