"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAppSelector } from "@/store/hooks";
import { useTaskDialog } from "../dialogbox/taskdialogcontext";
import { PlusCircle, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Overview from "./overview";
import { format, formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const router = useRouter();
  const { open } = useTaskDialog();
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );
  const tasks = useAppSelector((state) => state.taskByProjectName.tasks);
  const members = useAppSelector((state) => state.members.members);

  if (!selectedProject) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        No project selected
      </Card>
    );
  }

  const projectTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = projectTasks.filter(
    (task) => task.status !== "completed"
  ).length;
  const overdueTasks = 0;

  const uniqueMemberMap = new Map<string, string>();
  projectTasks.forEach((task) => {
    if (task.assignedUserId && task.assignedUserName) {
      uniqueMemberMap.set(task.assignedUserId, task.assignedUserName);
    }
  });

  const projectMembers =
    uniqueMemberMap.size > 0
      ? Array.from(uniqueMemberMap, ([id, name]) => ({ id, name }))
      : [];

  const teamMemberCount = projectMembers.length;

  const percent = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  const taskStats = [
    {
      label: "Tasks Completed",
      percent: percent(completedTasks, totalTasks),
      subtext: `${completedTasks}/${totalTasks} tasks`,
      badgeClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "In Progress",
      percent: percent(inProgressTasks, totalTasks),
      subtext: `${inProgressTasks} tasks ongoing`,
      badgeClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Overdue",
      percent: 0,
      subtext: `${overdueTasks} tasks overdue`,
      badgeClass: "bg-rose-50 text-rose-700",
    },
    {
      label: "Team Members",
      percent: percent(teamMemberCount, members.length),
      subtext: `${teamMemberCount} members`,
      badgeClass: "bg-blue-950 text-blue-100",
    },
  ];

  const activityItems =
    projectTasks.length > 0
      ? projectTasks.slice(0, 8).map((task) => ({
          id: task.id,
          user: task.assignedUserName || "User",
          action: `created task "${task.title}"`,
          time: formatDistanceToNow(new Date(task.createdAt), {
            addSuffix: true,
          }),
        }))
      : [
          {
            id: "project-created",
            user: "Codewave",
            action: `created project "${selectedProject.PROJECT_NAME}"`,
            time: "less than a minute ago",
          },
        ];

  return (
    <Card className="rounded-md border p-3">
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-8 rounded-md">
              <AvatarFallback className="rounded-md bg-blue-600 text-white text-xs font-semibold">
                {selectedProject.PROJECT_NAME.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <CardTitle className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
              {selectedProject.PROJECT_NAME}{" "}
              <code className="relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs  w-fit">
               {selectedProject.SERVER_TYPE}
              </code>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={open}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Create Task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" type="button">
                  <Settings className="mr-1 h-4 w-4" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={() => {
                    router.push("/projects/settings");
                  }}
                >
                  Edit Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CardContent className="px-0 py-0">
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Team Members</p>

            <TooltipProvider>
              <div className="flex items-center -space-x-2">
                {projectMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No team members yet</p>
                ) : (
                  projectMembers.map((member) => (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="size-8 rounded-md border-2 border-background">
                          <AvatarFallback className="rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        {member.name}
                      </TooltipContent>
                    </Tooltip>
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-4 rounded-lg  bg-muted/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {taskStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border bg-card px-3 py-3 min-h-28 flex flex-col items-center justify-center text-center"
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>

                <div
                  className={`mt-2 size-12 rounded-full grid place-items-center ${stat.badgeClass}`}
                >
                  <span className="text-sm font-semibold">{stat.percent}%</span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted/30 p-3">
          <Tabs defaultValue="overview">
            <TabsList className="w-fit">
              <TabsTrigger value="overview" className="text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className="pt-3"
            >
              <Overview tasks={projectTasks} />
            </TabsContent>
            <TabsContent
              value="timeline"
              className="pt-3"
            >
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
                    No tasks available for timeline.
                  </div>
                ) : (
                  projectTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md border px-3 py-2 flex items-start gap-3"
                    >
                      <span className="mt-1.5 size-4 rounded-full bg-indigo-500 shrink-0" />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-5 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.description?.trim() || "Description"}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground shrink-0 pt-1">
                        {format(new Date(task.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="activity"
              className="pt-3"
            >
              <div className="rounded-md border px-3 py-3 space-y-3">
                {activityItems.map((item) => (
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
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
