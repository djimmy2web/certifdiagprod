"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LivesNavbar from "./LivesNavbar";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session, update } = useSession();
  const pathname = usePathname();

  // Rafraîchir la session périodiquement pour avoir les dernières données
  useEffect(() => {
    const interval = setInterval(() => {
      update();
    }, 30000); // Rafraîchir toutes les 30 secondes au lieu de 5

    return () => clearInterval(interval);
  }, [update]);

  // Ne pas afficher la navbar sur les pages individuelles de quiz (avec ID), les pages d'authentification, la page de landing, la page de subscription et essai gratuit
  if (pathname?.match(/^\/reviser\/[a-f0-9]{24}$/) || pathname?.startsWith('/connexion') || pathname?.startsWith('/register') || pathname === '/landing' || pathname === '/subscription' || pathname === '/essai-gratuit') {
    return null;
  }

  return (
    <header className="bg-white border-b border-[#E8E8E8] pt-4" style={{ height: '90px' }}>
      <nav className="w-[1440px] mx-auto py-6 flex items-center justify-between" style={{ gap: '10px' }}>
        <div className="flex items-center gap-8 absolute left-[245px]">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/logo-certif.svg"
              alt="Certif"
              width={42}
              height={42}
              className="h-[42px] w-[42px] select-none"
            />
          </Link>
          <div className="flex gap-8 text-base text-black">
            <Link href="/" className="hover:underline cursor-pointer">Accueil</Link>
            <Link href="/reviser" className="hover:underline cursor-pointer">Révision</Link>
            <Link href="/ligues" className="hover:underline cursor-pointer">Ligues</Link>
            <Link href="/badges" className="hover:underline cursor-pointer">Quêtes</Link>
            <Link href="/profile" className="hover:underline cursor-pointer">Profil</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-black">
          {/* Affichage des vies et statistiques positionné à 245px de la droite */}
          {session && (
            <div className="absolute right-[210px]">
              <LivesNavbar />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
