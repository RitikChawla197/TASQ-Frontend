"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderOpenDot,
  ChevronsUpDown,
  CircleUserRound,
  LayoutDashboard,
  Plus,
  SquareCheckBig,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProjects,
  setSelectedProject,
} from "@/store/slices/project.slice";
import { fetchTasksByProjectName } from "@/store/slices/taskByProjectName.slice";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";
import { fetchDepartmentTasks } from "@/store/slices/departmentTasks.slice";
import { projectApi } from "@/services/project.api";
import { useAuthActions } from "@/app/useActionAuth";
import { toast } from "sonner";

const AppSidebar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { handleAccount, handleLogout } = useAuthActions();
  const { projects, loading, error, selectedProject } = useAppSelector(
    (state) => state.project
  );
  const members = useAppSelector((state) => state.members.members);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [accessWorkspace, setAccessWorkspace] = useState("tasq-main");
  const [adminChecked, setAdminChecked] = useState(true);
  const [workspaceDepartment, setWorkspaceDepartment] = useState("Workspace");
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState<string | null>(
    null
  );
  const [currentUserName, setCurrentUserName] = useState("User");
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const hasFetchedProjectsRef = useRef(false);

  const resetProjectForm = () => {
    setWorkspaceName("");
    setDescription("");
    setAccessWorkspace("tasq-main");
    setAdminChecked(true);
    setCreateProjectError(null);
  };

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    setCreateProjectError(null);
    setCreatingProject(true);

    try {
      const createdProject = await projectApi.createProject({
        name: workspaceName.trim(),
        description: description.trim() || undefined,
      });
      toast.success(`${createdProject.PROJECT_NAME} created successfully`);

      dispatch(setSelectedProject(createdProject));
      await dispatch(fetchProjects());
      router.push("/projects");

      setIsCreateProjectOpen(false);
      resetProjectForm();
    } catch (error: any) {
      setCreateProjectError(
        error?.response?.data?.message || "Failed to create project"
      );
    } finally {
      setCreatingProject(false);
    }
  };

  const removeTrailingSlash = (str: string): string =>
    str.endsWith("/") && str.length > 1 ? str.slice(0, -1) : str;

  const pathname = removeTrailingSlash(usePathname());

  useEffect(() => {
    if (hasFetchedProjectsRef.current) return;
    hasFetchedProjectsRef.current = true;
    dispatch(fetchProjects());
    dispatch(fetchMembersByDepartment());

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

  useEffect(() => {
    const department = localStorage.getItem("department");
    if (department?.trim()) {
      setWorkspaceDepartment(department.trim());
      return;
    }

    const rawResponse = localStorage.getItem("login_response");
    if (!rawResponse) return;

    try {
      const parsed = JSON.parse(rawResponse) as { department?: string };
      if (parsed.department?.trim()) {
        setWorkspaceDepartment(parsed.department.trim());
      }
    } catch {
      // Ignore malformed stored payload.
    }
  }, []);

  useEffect(() => {
    const rawResponse = localStorage.getItem("login_response");
    if (rawResponse) {
      try {
        const parsed = JSON.parse(rawResponse) as {
          name?: string;
          username?: string;
          email?: string;
        };

        if (parsed.name?.trim()) {
          setCurrentUserName(parsed.name.trim());
        } else if (parsed.username?.trim()) {
          setCurrentUserName(parsed.username.trim());
        }

        if (parsed.username?.trim()) {
          setCurrentUsername(parsed.username.trim());
        } else {
          setCurrentUsername((localStorage.getItem("username") || "").trim());
        }

        if (parsed.email?.trim()) {
          setCurrentUserEmail(parsed.email.trim());
        }
        return;
      } catch {
        // Ignore malformed stored payload.
      }
    }

    const fallbackName = (localStorage.getItem("name") || "").trim();
    const fallbackUsername = (localStorage.getItem("username") || "").trim();
    if (fallbackName) {
      setCurrentUserName(fallbackName);
    } else if (fallbackUsername) {
      setCurrentUserName(fallbackUsername);
    }
    setCurrentUsername(fallbackUsername);
  }, []);

  const matchedMember = useMemo(
    () =>
      members.find(
        (member) =>
          member.username.trim().toLowerCase() ===
          currentUsername.trim().toLowerCase()
      ),
    [members, currentUsername]
  );
  const resolvedUserEmail = matchedMember?.email || currentUserEmail || "-";
  const userAvatar = (currentUserName || currentUsername || "U")
    .charAt(0)
    .toUpperCase();

  const workspaceAvatar = (workspaceDepartment.split(" ")[0] || "W")
    .charAt(0)
    .toUpperCase();

  const rawAuthItems = [
    {
      title: "Home",
      url: "/home",
      icon: LayoutDashboard,
    },
    {
      title: "My Tasks",
      url: "/mytasks",
      icon: SquareCheckBig,
    },
    {
      title: "Members",
      url: "/members",
      icon: CircleUserRound,
    },

    //  {
    //   title: "Mobile Log",
    //   url: "/surveylogin",
    //   icon: Smartphone,
    // },
  ];

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader className="py-2 border-b flex justify-center">
        <SidebarMenu>
          <SidebarMenuButton asChild>
            <div className="flex items-center gap-3 px-3 py-6">
              <Image
                src="/tasq.png"
                alt="TASQ logo"
                width={34}
                height={32}
                // className="scale-150"
                priority
              />

              <h4 className="bg-muted rounded px-2 py-1 font-mono text-xl font-extrabold tracking-widest group-data-[collapsible=icon]:hidden">
                TASQ
              </h4>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="justify-between">
            <span>WORKSPACE</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:rounded-sm group-data-[collapsible=icon]:text-[9px]">
                    {workspaceAvatar.toUpperCase()}
                  </span>
                  <span className="font-medium">
                    {workspaceDepartment.toUpperCase()}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="justify-between">
            <span>MENU</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rawAuthItems.map((subItem) => {
                const itemUrl = removeTrailingSlash(subItem.url);
                const isActive = pathname === itemUrl;

                return (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      className={
                        isActive
                          ? "bg-blue-100 text-black font-medium dark:bg-white dark:text-black hover:bg-blue-300 dark:hover:bg-white dark:hover:text-black"
                          : ""
                      }
                    >
                      <Link href={subItem.url}>
                        <subItem.icon />
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="justify-between">
            <span>PROJECTS</span>
            <SidebarGroupAction
              type="button"
              onClick={() => setIsCreateProjectOpen(true)}
              aria-label="Create new project"
              title="Create New Project"
              className="relative top-0 right-0"
            >
              <Plus className="size-4" />
            </SidebarGroupAction>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="cursor-default">
                    <FolderOpenDot />
                    <span>Loading projects...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {!loading && error && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    onClick={() => dispatch(fetchProjects())}
                    className="text-red-600 dark:text-red-400"
                  >
                    <FolderOpenDot />
                    <span>Failed to load projects (Retry)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {!loading &&
                !error &&
                projects.map((project) => {
                  const isActive =
                    pathname === "/projects" &&
                    selectedProject?.DATABASE === project.DATABASE;

                  return (
                    <SidebarMenuItem key={project.DATABASE}>
                      <SidebarMenuButton
                        type="button"
                        onClick={() => {
                          dispatch(setSelectedProject(project));
                          dispatch(
                            fetchTasksByProjectName(project.PROJECT_NAME)
                          );
                          router.push("/projects");
                        }}
                        className={
                          isActive
                            ? "bg-blue-100 text-black font-medium dark:bg-white dark:text-black hover:bg-blue-300 dark:hover:bg-white dark:hover:text-black"
                            : ""
                        }
                      >
                        <FolderOpenDot />
                        <span>
                          {project.PROJECT_NAME} ({project.SERVER_TYPE})
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton type="button" className="h-auto p-2">
                  <>
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                      {userAvatar}
                    </span>
                    <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {currentUserName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {resolvedUserEmail}
                      </span>
                    </span>
                    <ChevronsUpDown className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right">
                <DropdownMenuLabel className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                      {userAvatar}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {currentUserName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {resolvedUserEmail}
                      </span>
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAccount}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Create New Project
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateProject}>
            <div className="space-y-2">
              <label className="text-xs font-medium">WorkSpace Name</label>
              <Input
                placeholder="Enter workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Description</label>
              <Textarea
                rows={4}
                placeholder="Write project description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {createProjectError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {createProjectError}
              </p>
            )}

            <DialogFooter className="px-0 pb-0 mx-0 mb-0 -mt-2 border-0 bg-transparent">
              <Button
                type="button"
                variant="outline"
                disabled={creatingProject}
                onClick={() => {
                  setIsCreateProjectOpen(false);
                  resetProjectForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingProject}>
                {creatingProject ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default AppSidebar;
