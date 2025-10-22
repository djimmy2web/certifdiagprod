"use client";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages qui n'ont pas besoin du wrapper main
  const noWrapperPages = ['/subscription', '/landing', '/essai-gratuit'];
  
  if (noWrapperPages.includes(pathname || '')) {
    return <>{children}</>;
  }
  
  return (
    <main className="max-w-6xl mx-auto px-4 pt-12 pb-8">
      {children}
    </main>
  );
}

