"use client";
import { usePathname } from "next/navigation";
import AdminNavigation from "./AdminNavigation";

export default function ConditionalAdminNav() {
  const pathname = usePathname();
  
  // Cacher la navigation admin sur la page profil, les pages d'authentification et la page de landing
  if (pathname === "/profile" || pathname?.startsWith('/connexion') || pathname?.startsWith('/register') || pathname === '/landing') {
    return null;
  }
  
  return <AdminNavigation />;
}
