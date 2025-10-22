import { ReactNode } from "react";

export default function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {children}
    </div>
  );
}
