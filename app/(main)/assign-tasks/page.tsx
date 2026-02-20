"use client";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";

export default function AssignTasksPage() {
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );

  if (!selectedProject) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No project selected
      </div>
    );
  }

  return (
    <Card className="p-3 space-y-4 ">
      {/* <CardHeader className="space-y-1 p-0">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight text-balance">
          Assign Tasks for {selectedProject.PROJECT_NAME}
        </h1>

        <CardDescription className="flex items-center gap-2">
          <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            Server Type: <strong>{selectedProject.SERVER_TYPE}</strong>
          </code>
        </CardDescription>
      </CardHeader> */}

      <CardContent className="flex flex-col min-h-0 flex-1 overflow-hidden max-h-[calc(95vh-100px)]">
        <KanbanBoard />
      </CardContent>
    </Card>
  );
}
