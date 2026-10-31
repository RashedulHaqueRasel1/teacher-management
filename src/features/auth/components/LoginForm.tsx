"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useTeachers } from "@/features/teachers/hooks/use-teachers";

import { useSessionStore } from "../store/session.store";

export function LoginForm() {
  const router = useRouter();
  const { teachers } = useTeachers();
  const signIn = useSessionStore((s) => s.signIn);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const active = teachers.filter((t) => t.status !== "left");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    // TODO (backend phase): replace with NextAuth `signIn("credentials", {...})`.
    // Demo: any password works for a current teacher's school email.
    await new Promise((resolve) => setTimeout(resolve, 700));
    const teacher = active.find((t) => t.email.toLowerCase() === email.trim().toLowerCase());
    if (!teacher) {
      setLoading(false);
      setError("No active teacher account uses this email.");
      return;
    }
    signIn(teacher.id);
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-[400px] animate-fade-up">
      <Logo subtitle="Teacher Portal" className="mb-10 lg:hidden" />

      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
          <ShieldCheck className="h-3.5 w-3.5" />
          Teacher Portal
        </span>
        <h1 className="mt-5 text-[28px] font-bold tracking-tight text-fg">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Sign in with your school email to manage your classes.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          Demo — sign in as any teacher
        </p>
        <Select
          aria-label="Demo teacher"
          value={active.find((t) => t.email === email)?.id ?? ""}
          onChange={(e) => {
            const t = active.find((x) => x.id === e.target.value);
            if (t) {
              setEmail(t.email);
              setPassword("teacher123");
              setError("");
            }
          }}
        >
          <option value="">Pick a teacher…</option>
          {active.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.subjects[0]}
            </option>
          ))}
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="email">School email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@edumanage.school"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={Boolean(error)}
            leftIcon={<Mail />}
          />
          {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="mb-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition hover:bg-soft hover:text-fg-secondary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-fg-secondary">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-fg-subtle/50 accent-indigo-600"
          />
          Keep me signed in for 30 days
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <p className="text-xs leading-relaxed text-fg-muted">
          Only teachers of EduManage School can sign in. Your changes —
          attendance, marks and approvals — are logged under your name.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-fg-subtle">
        Having trouble signing in?{" "}
        <a href="mailto:support@school.edu" className="font-semibold text-fg-secondary hover:text-fg">
          Contact IT support
        </a>
      </p>
    </div>
  );
}
