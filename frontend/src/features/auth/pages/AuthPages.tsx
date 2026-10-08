import { ReactNode } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-page py-8">
      <div className="w-full max-w-120 rounded-3xl bg-canvas p-6 border border-hairline/60 shadow-xl sm:p-10">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-black text-on-primary text-sm shadow-xs">
            SD
          </span>
          <p className="text-title font-extrabold tracking-tight text-ink">Society Desk</p>
        </div>
        <h1 className="text-heading font-extrabold text-ink tracking-tight mb-1.5">{title}</h1>
        <p className="mb-6 text-body text-mute leading-relaxed">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}


export const LoginPage = () => (
  <AuthShell title="Welcome back" subtitle="Log in to see and raise complaints for your society.">
    <LoginForm />
  </AuthShell>
);

export const RegisterPage = () => (
  <AuthShell title="Create your account" subtitle="Tell us a little about you so the society office can reach you.">
    <RegisterForm />
  </AuthShell>
);
