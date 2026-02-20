"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TaskStatus } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMembersByDepartment } from "@/store/slices/members.slice";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => void;
}

export default function CreateTaskDialog({
  open,
  onOpenChange,
  onCreate,
}: Props) {
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.members.members);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState("medium");
  const [userId, setUserId] = useState("");

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const selectedUser = members.find((u) => String(u.id) === userId);

  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersByDepartment());
      return;
    }

    if (!userId) {
      setUserId(String(members[0].id));
    }
  }, [dispatch, members, userId]);

  useEffect(() => {
    if (!startDate || !dueDate) return;

    const startOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const dueOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );

    if (dueOnly <= startOnly) {
      setDueDate(undefined);
    }
  }, [startDate, dueDate]);

  const handleCreate = async () => {
    if (!title.trim() || !selectedUser) return;

    setLoading(true);

    await onCreate({
      title,
      status,
      priority,
      userId: String(selectedUser.id),
      userName: selectedUser.name,
      startDate,
      dueDate,
      description,
    });

    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg">
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mx-4">
          {/* Task Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Task Name</label>
            <Input
              placeholder="Enter task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Assignee + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Assignee</label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">LOW</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="high">HIGH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start + Due Date */}
          {/* Start + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <span>
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <span>
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) =>
                      !!startDate &&
                      date <=
                        new Date(
                          startDate.getFullYear(),
                          startDate.getMonth(),
                          startDate.getDate()
                        )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">TO DO</SelectItem>
                <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                <SelectItem value="backlog">BACKLOG</SelectItem>
                <SelectItem value="completed">COMPLETED</SelectItem>
                <SelectItem value="blocked">BLOCKED</SelectItem>
                <SelectItem value="review">IN REVIEW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Description</label>
            <Textarea
              placeholder="Write task description..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              className="rounded-sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              className="rounded-sm"
              onClick={handleCreate}
              disabled={loading || !selectedUser}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
