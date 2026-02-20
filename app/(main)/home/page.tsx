"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  ListChecks,
  BarChart3,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TasksByStatusChart } from "@/components/Charts/taskbystatus";
import { TaskTrendChart } from "@/components/Charts/tasktrend";
import { RecentMembers } from "./recentmember";
import { RecentProjects } from "./recentprojects";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";
import { fetchProjects, setSelectedProject } from "@/store/slices/project.slice";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { fetchDepartmentTasks } from "@/store/slices/departmentTasks.slice";

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.members.members);
  const projects = useAppSelector((state) => state.project.projects);
  const departmentTasks = useAppSelector((state) => state.departmentTasks.tasks);

  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersByDepartment());
    }
  }, [dispatch, members.length]);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

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

  const recentMembers = useMemo(
    () =>
      members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        joinedAt: new Date().toISOString(),
        avatar: "",
      })),
    [members]
  );

  const completedTasksCount = useMemo(
    () =>
      departmentTasks.filter(
        (task) => task.status.toLowerCase() === "completed"
      ).length,
    [departmentTasks]
  );

  const loggedInUsername = useMemo(() => {
    if (typeof window === "undefined") return "";

    const raw = localStorage.getItem("login_response");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { username?: string };
        if (parsed.username?.trim()) {
          return parsed.username.trim().toLowerCase();
        }
      } catch {
        // Ignore malformed stored payload.
      }
    }
    return (localStorage.getItem("username") || "").trim().toLowerCase();
  }, []);

  const loggedInMemberId = useMemo(() => {
    if (typeof window === "undefined") return "";

    const storedMemberId = (localStorage.getItem("member_id") || "").trim();
    if (storedMemberId) return storedMemberId;

    const matchedMember = members.find(
      (member) => member.username.trim().toLowerCase() === loggedInUsername
    );
    return matchedMember ? String(matchedMember.id) : "";
  }, [members, loggedInUsername]);

  const myTasksCount = useMemo(
    () =>
      loggedInMemberId
        ? departmentTasks.filter(
            (task) => String(task.assignedUserId) === loggedInMemberId
          ).length
        : 0,
    [departmentTasks, loggedInMemberId]
  );

  const tasksByStatusData = useMemo(() => {
    const statusBuckets = [
      { key: "todo", label: "To Do" },
      { key: "in_progress", label: "In Progress" },
      { key: "backlog", label: "Backlog" },
      { key: "completed", label: "Completed" },
      { key: "blocked", label: "Blocked" },
      { key: "review", label: "In Review" },
    ];

    return statusBuckets.map((bucket) => ({
      status: bucket.label,
      tasks: departmentTasks.filter((task) => task.status === bucket.key).length,
    }));
  }, [departmentTasks]);

  const taskTrendData = useMemo(() => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = weekDays.map((day) => ({ day, tasks: 0 }));

    departmentTasks.forEach((task) => {
      const dayIndex = new Date(task.createdAt).getDay();
      buckets[dayIndex].tasks += 1;
    });

    return buckets;
  }, [departmentTasks]);

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: Folder,
      color: "text-blue-400",
    },
    {
      title: "Total Tasks",
      value: departmentTasks.length,
      icon: ListChecks,
      color: "text-orange-400",
    },
    {
      title: "My Tasks",
      value: myTasksCount,
      icon: BarChart3,
      color: "text-purple-400",
    },
    {
      title: "Completed Tasks",
      value: completedTasksCount,
      icon: CheckCircle2,
      color: "text-green-400",
    },
    {
      title: "Team Members",
      value: members.length,
      icon: Users,
      color: "text-pink-400",
    },
  ];

  const recentProjects = useMemo(
    () =>
      [...projects]
        .slice()
        .reverse()
        .slice(0, 6)
        .map((project) => ({
          id: project.id,
          name: project.PROJECT_NAME,
          department:
            project.SERVER_TYPE &&
            project.SERVER_TYPE.trim().toUpperCase() !== "GENERAL"
              ? project.SERVER_TYPE
              : undefined,
          createdAt: undefined,
        })),
    [projects]
  );

  return (
    <div className="px-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <Card key={index} className="rounded-sm">
              <CardContent className="px-5 flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <h2 className="text-2xl font-bold mt-1">{item.value}</h2>
                </div>

                <Icon className={`h-5 w-5 ${item.color}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-sm">
          <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
          <TasksByStatusChart data={tasksByStatusData} />
        </Card>

        <Card className="p-6 rounded-sm">
          <h3 className="text-lg font-semibold mb-4">Task Creation Trend</h3>
          <TaskTrendChart data={taskTrendData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMembers members={recentMembers} />

        <RecentProjects
          projects={recentProjects}
          onProjectClick={(project) => {
            const selected = projects.find((p) => p.id === Number(project.id));
            if (!selected) return;
            dispatch(setSelectedProject(selected));
            dispatch(fetchTasksByProjectName(selected.PROJECT_NAME));
            router.push("/projects");
          }}
        />
      </div>
    </div>
  );
}
