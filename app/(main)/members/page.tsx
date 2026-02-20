"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";
import { deleteUser } from "@/services/user.api";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";

const stringToHsl = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 45%)`;
};

export default function MembersPage() {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useAppSelector((state) => state.members);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingDeleteMember, setPendingDeleteMember] = useState<{
    id: number;
    name: string;
  } | null>(null);
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

  useEffect(() => {
    dispatch(fetchMembersByDepartment());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!pendingDeleteMember) return;
    const { id } = pendingDeleteMember;
    try {
      setDeletingUserId(id);
      await deleteUser(id);
      toast.success("User deleted successfully");
      dispatch(fetchMembersByDepartment());
      setIsDeleteOpen(false);
      setPendingDeleteMember(null);
    } catch (deleteError) {
      console.error("Delete user failed:", deleteError);
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <Card className="rounded-md border">
      <CardContent>
        {loading && (
          <p className="px-2 py-2 text-sm text-muted-foreground">Loading members...</p>
        )}

        {!loading && error && (
          <p className="px-2 py-2 text-sm text-red-600 dark:text-red-400">
            Failed to load members: {error}
          </p>
        )}

        {!loading && !error && members.length === 0 && (
          <p className="px-2 py-2 text-sm text-muted-foreground">No members found.</p>
        )}

        <div className="space-y-2">
          {members.map((member) => {
            const initials = member.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const isCurrentLoggedIn =
              member.username.trim().toLowerCase() === loggedInUsername;
            const avatarBg = stringToHsl(member.username || member.name);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9 rounded-md">
                  <AvatarImage src="" alt={member.name} />
                  <AvatarFallback
                    className="rounded-md text-white text-xs font-semibold"
                    style={{ backgroundColor: avatarBg }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-base font-semibold leading-5 flex items-center gap-2">
                    <span>{member.name}</span>
                    {isCurrentLoggedIn && (
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        Current Logged in
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>@{member.username}</span>
                    <span>|</span>
                    <span>{member.email}</span>
                    <span>|</span>
                    <span>{member.department}</span>
                  </div>
                </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => toast.info("Edit feature will be added next")}
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="destructive"
                    disabled={
                      deletingUserId === member.id || isCurrentLoggedIn
                    }
                    onClick={() => {
                      setPendingDeleteMember({
                        id: member.id,
                        name: member.name,
                      });
                      setIsDeleteOpen(true);
                    }}
                  >
                    {deletingUserId === member.id ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Deleting
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-3" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open && !deletingUserId) {
            setPendingDeleteMember(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteMember
                ? `Are you sure you want to delete "${pendingDeleteMember.name}"? This action cannot be undone.`
                : "Are you sure you want to delete this user? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingUserId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!pendingDeleteMember || !!deletingUserId}
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
            >
              {deletingUserId ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
