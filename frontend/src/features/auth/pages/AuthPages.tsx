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
      <div className="w-full max-w-120 rounded-lg bg-canvas p-6 shadow-[0_16px_32px_rgba(0,0,0,0.12)] sm:p-8">
        <p className="mb-2 text-title font-bold tracking-tight text-primary">Society Desk</p>
        <h1 className="text-heading font-semibold text-ink">{title}</h1>
        <p className="mb-6 text-body text-mute">{subtitle}</p>
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
