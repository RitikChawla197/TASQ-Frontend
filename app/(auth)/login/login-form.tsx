"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/services/auth.api";
import { taskApi } from "@/services/task.api";
import { getUsersByDepartment } from "@/services/user.api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [switchingPage, setSwitchingPage] = useState(false);
  const router = useRouter();

  const goToSignup = () => {
    if (switchingPage || submitting) return;
    setSwitchingPage(true);

    const card = document.querySelector(
      '[data-auth-card="login"]'
    ) as HTMLElement | null;
    if (card) {
      card.classList.remove("auth-login-enter");
      card.classList.add("auth-exit-left");
    }

    window.setTimeout(() => {
      router.push("/signup");
    }, 220);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.removeItem("access");
    setSubmitting(true);

    try {
      const response = await loginUser({
        username: userId,
        password,
      });

      try {
        const departmentUsers = await getUsersByDepartment();
        const matchedUser = departmentUsers.find(
          (user) =>
            user.username.trim().toLowerCase() ===
            response.username.trim().toLowerCase()
        );

        if (matchedUser) {
          localStorage.setItem("member_id", String(matchedUser.id));
        }
      } catch (memberMatchError) {
        console.warn("Failed to resolve member id after login:", memberMatchError);
      }

      if (response.department?.trim()) {
        try {
          await taskApi.getTasksByDepartment(response.department.trim());
        } catch (prefetchError) {
          console.warn("Department tasks prefetch failed:", prefetchError);
        }
      }

      console.log("Login success:", response);
      toast.success(`Welcome Back, ${response.name}`);

      router.push("/home");
    } catch (error: any) {
      console.error("Login failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("auth-reveal mx-auto w-full max-w-md", className)} {...props}>
      <div className="auth-reveal auth-delay-1 mb-8 flex items-center gap-3">
        <Image src="/tasq.png" alt="TASQ logo" width={38} height={36} priority />
        <div>
          <p className="font-mono text-2xl font-extrabold tracking-widest">TASQ</p>
          <p className="text-xs text-muted-foreground">Task Management Portal</p>
        </div>
      </div>

      <div className="auth-reveal auth-delay-2 space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-reveal auth-delay-3 mt-8">
        <FieldGroup>
          <Field className="gap-1.5">
            <FieldLabel
              className="text-slate-700 dark:text-slate-300 text-xs"
              htmlFor="user"
            >
              Username
            </FieldLabel>
            <Input
              className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              id="user"
              placeholder="Enter username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel
              className="text-slate-700 dark:text-slate-300 text-xs"
              htmlFor="password"
            >
              Password
            </FieldLabel>
            <Input
              className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Field className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <p className="auth-reveal auth-delay-4 mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={goToSignup}
          disabled={switchingPage || submitting}
          className="font-semibold text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
