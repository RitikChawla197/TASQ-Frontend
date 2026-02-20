"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearSelectedProject,
  fetchProjects,
  setSelectedProject,
} from "@/store/slices/project.slice";
import { projectApi } from "@/services/project.api";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  );

  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!selectedProject) return;
    setWorkspaceName(selectedProject.PROJECT_NAME ?? "");
    setDescription(selectedProject.description ?? "");
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No project selected
      </div>
    );
  }

  const handleSaveChanges = async () => {
    const nextName = workspaceName.trim();
    if (!nextName) return;

    const department =
      selectedProject.SERVER_TYPE?.trim() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("department")?.trim() || ""
        : "") ||
      "GENERAL";

    setSaving(true);
    try {
      await projectApi.updateProject(selectedProject.id, {
        name: nextName,
        department,
        description: description.trim() || "",
      });

      const refreshed = await dispatch(fetchProjects());
      if (fetchProjects.fulfilled.match(refreshed)) {
        const updatedProject =
          refreshed.payload.find(
            (project) =>
              project.id === selectedProject.id ||
              project.DATABASE === selectedProject.DATABASE
          ) || null;

        if (updatedProject) {
          dispatch(setSelectedProject(updatedProject));
        } else {
          dispatch(
            setSelectedProject({
              ...selectedProject,
              PROJECT_NAME: nextName,
              name: nextName,
              description: description.trim() || null,
              SERVER_TYPE: department,
            })
          );
        }
      } else {
        dispatch(
          setSelectedProject({
            ...selectedProject,
            PROJECT_NAME: nextName,
            name: nextName,
            description: description.trim() || null,
            SERVER_TYPE: department,
          })
        );
      }
      toast.success("Project updated Successfully");
      router.push("/projects");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 ">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          <Settings className="size-6" />
          Project Settings
        </h1>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </div>

      <Card className="rounded-md border max-w-3xl w-full mx-auto">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name</label>
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write project description..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleSaveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border max-w-3xl w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-500">
            Danger Zone
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Irreversible actions for your project
          </p>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete Project
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {selectedProject.PROJECT_NAME}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              variant="destructive"
              onClick={async () => {
                setDeleting(true);
                try {
                  await projectApi.deleteProject(selectedProject.id);
                  toast.success("Project deleted successfully");
                  dispatch(clearSelectedProject());
                  await dispatch(fetchProjects());
                  setIsDeleteOpen(false);
                  router.push("/home");
                } catch (error) {
                  console.error("Failed to delete project:", error);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
