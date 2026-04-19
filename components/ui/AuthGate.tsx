'use client';

interface AuthGateProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  return <main className="flex-1">{children}</main>;
}
