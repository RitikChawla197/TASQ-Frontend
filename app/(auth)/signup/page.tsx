import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] dark:bg-[radial-gradient(circle_at_top_left,_#0f172a,_#020617_45%,_#111827)]">
      <div className="auth-orb-in auth-delay-1 pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="auth-orb-in auth-delay-2 pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl items-center p-6 md:p-10">
        <div
          data-auth-card="signup"
          className="auth-signup-enter grid w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 shadow-[0_20px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl md:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/55"
        >
          <section className="auth-workspace-sheen relative hidden flex-col justify-between border-r border-slate-200/70 bg-slate-900 p-10 text-white md:flex dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
                Workspace Platform
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight">
                Create Account
                <br />
                Start Managing
              </h1>
              <p className="mt-4 max-w-sm text-sm text-slate-300">
                Join your team workspace and manage tasks, projects, and
                timelines with one simple dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                Quick Onboarding
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                Team Collaboration
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                Centralized Tasks
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                Role Based Access
              </div>
            </div>
          </section>

          <section className="p-6 md:p-10">
            <SignupForm />
          </section>
        </div>
      </div>
    </div>
  );
}
