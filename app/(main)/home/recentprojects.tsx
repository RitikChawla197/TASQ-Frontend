"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Project {
  id: string | number;
  name: string;
  department?: string;
  createdAt?: string;
}

interface RecentProjectsProps {
  projects?: Project[];
  onProjectClick?: (project: Project) => void;
}

export function RecentProjects({
  projects = [],
  onProjectClick,
}: RecentProjectsProps) {
  return (
    <Card className="rounded-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">
          Recent Projects
        </CardTitle>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects found.
          </p>
        ) : (
          <ScrollArea className="h-[192px] pr-2">
            <div className="divide-y">
              {projects.map((project) => (
                <button
                  type="button"
                  key={project.id}
                  onClick={() => onProjectClick?.(project)}
                  className="w-full text-left flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded-md transition"
                >
                  {/* Left Section */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {project.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium">
                        {project.name}
                        {project.department ? ` (${project.department})` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {project.createdAt
                      ? format(new Date(project.createdAt), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </button>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
