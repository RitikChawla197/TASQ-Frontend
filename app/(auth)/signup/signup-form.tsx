"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loginUser, signupUser } from "@/services/auth.api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "employee",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [switchingPage, setSwitchingPage] = useState(false);
  const router = useRouter();

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await signupUser(form);
      await loginUser({
        username: form.username,
        password: form.password,
      });
      toast.success("Account created and logged in successfully");
      router.push("/home");
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const goToLogin = () => {
    if (switchingPage || submitting) return;
    setSwitchingPage(true);

    const card = document.querySelector(
      '[data-auth-card="signup"]'
    ) as HTMLElement | null;
    if (card) {
      card.classList.remove("auth-signup-enter");
      card.classList.add("auth-exit-right");
    }

    window.setTimeout(() => {
      router.push("/login");
    }, 220);
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
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign up to start using your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-reveal auth-delay-3 mt-6">
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel
              className="text-slate-700 dark:text-slate-300 text-xs"
              htmlFor="name"
            >
              Name
            </FieldLabel>
            <Input
              className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              id="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel
              className="text-slate-700 dark:text-slate-300 text-xs"
              htmlFor="username"
            >
              Username
            </FieldLabel>
            <Input
              className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              id="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              required
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel
              className="text-slate-700 dark:text-slate-300 text-xs"
              htmlFor="email"
            >
              Email
            </FieldLabel>
            <Input
              className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel
              className="text-slate-700 dark:text-slate-300 text-xs"
              htmlFor="department"
            >
              Department
            </FieldLabel>
            <Input
              className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              id="department"
              placeholder="Enter your department"
              value={form.department}
              onChange={(e) => onChange("department", e.target.value)}
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
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              required
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel className="text-slate-700 dark:text-slate-300 text-xs">
              Role
            </FieldLabel>
            <Select
              value={form.role}
              onValueChange={(value) => onChange("role", value)}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-300 bg-white/90 text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          </div>

          <Field className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <p className="auth-reveal auth-delay-4 mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={goToLogin}
          disabled={switchingPage || submitting}
          className="font-semibold text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
