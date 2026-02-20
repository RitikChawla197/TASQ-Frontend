"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { LogOut, Moon, Sun, User } from "@hugeicons/core-free-icons";
import { useAuthActions } from "@/app/useActionAuth";
import PageHeading from "./PageHeading";
import { useTaskDialog } from "./dialogbox/taskdialogcontext";
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useKanbanFilter } from "./kanban/kanbanfiltercontext";
import { createUser } from "@/services/user.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { open } = useTaskDialog();
  const { filterUserId, setFilterUserId } = useKanbanFilter();
  const members = useAppSelector((state) => state.members.members);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(
    null
  );
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "manager",
    department: "",
  });

  const { theme, setTheme } = useTheme();
  const { handleLogout } = useAuthActions();

  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersByDepartment());
    }
  }, [dispatch, members.length]);

  const resetCreateUserForm = () => {
    setUserForm({
      name: "",
      username: "",
      password: "",
      email: "",
      role: "manager",
      department: "",
    });
    setCreateUserError(null);
    setCreateUserSuccess(null);
  };

  const onSubmitCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateUserError(null);
    setCreateUserSuccess(null);
    setCreatingUser(true);

    try {
      await createUser(userForm);
      setCreateUserSuccess("User created successfully");
      dispatch(fetchMembersByDepartment());
      resetCreateUserForm();
      setIsCreateUserOpen(false);
    } catch (error: any) {
      setCreateUserError(
        error?.response?.data?.message || "Failed to create user"
      );
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <nav className="px-3 py-1 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <PageHeading />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {pathname === "/members" && (
          <Button
            size="sm"
           
            onClick={() => setIsCreateUserOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Create User
          </Button>
        )}

        {pathname === "/assign-tasks" && (
          <>
            <Select value={filterUserId} onValueChange={setFilterUserId}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {members.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={open}>
              <PlusCircle className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </>
        )}

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <HugeiconsIcon
            icon={Sun}
            className="h-5 w-5 rotate-0 scale-100 transition-all dark:scale-0 dark:-rotate-90"
          />
          <HugeiconsIcon
            icon={Moon}
            className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <HugeiconsIcon icon={User} className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Profile</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <HugeiconsIcon icon={User} className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-400 focus:text-red-400"
              onClick={handleLogout}
            >
              <HugeiconsIcon icon={LogOut} className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={isCreateUserOpen}
        onOpenChange={(openState) => {
          setIsCreateUserOpen(openState);
          if (!openState) resetCreateUserForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create User</DialogTitle>
          </DialogHeader>

          <form className="space-y-3" onSubmit={onSubmitCreateUser}>
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <Input
                value={userForm.name}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Username</label>
              <Input
                value={userForm.username}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Password</label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter password"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Email</label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Role</label>
              <Input
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="manager"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Department</label>
              <Input
                value={userForm.department}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                placeholder="Enter department"
                required
              />
            </div>

            {createUserError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {createUserError}
              </p>
            )}

            {createUserSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {createUserSuccess}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={creatingUser}
                onClick={() => {
                  setIsCreateUserOpen(false);
                  resetCreateUserForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingUser}>
                {creatingUser ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
