import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Autenticação - Sicoop da Goalmoon",
  description: "Faça login no sistema Sicoop da Goalmoon",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-container">
      {children}
    </div>
  );
}
