"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { CardTitle } from "@/components/ui/card";

export default function PageHeading() {
  const pathname = usePathname();
  const workspaceName = useMemo(() => {
    if (typeof window === "undefined") return "Workspace";
    return localStorage.getItem("department") || "Workspace";
  }, []);

  if (pathname === "/home") {
    return (
      <div className="flex flex-col">
        <CardTitle className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          Home
        </CardTitle>

        <code className="relative rounded px-[0.1rem] py-0 font-mono text-sm font-semibold w-fit">
          Monitor your workspace activities and projects
        </code>
      </div>
    );
  }
  if (pathname === "/mytasks") {
    return (
      <div className="flex flex-col">
        <CardTitle className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          My Tasks
        </CardTitle>

        
      </div>
    );
  }

  if (pathname === "/projects") {
    return (
      <div className="flex flex-col">
        <CardTitle className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          Projects
        </CardTitle>

        <code className="relative rounded px-[0.1rem] py-0 font-mono text-sm font-semibold w-fit">
          Manage project task and activities
        </code>
      </div>
    );
  }

  if (pathname === "/members") {
    return (
      <div className="flex flex-col">
        <CardTitle className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          {workspaceName} Members
        </CardTitle>

        <code className="relative rounded px-[0.1rem] py-0 font-mono text-sm font-semibold w-fit">
          Manage your workspace members and their access levels
        </code>
      </div>
    );
  }

  return null;
}

