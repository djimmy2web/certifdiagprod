"use client";
import { usePathname } from "next/navigation";

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Pages qui n'ont pas besoin du footer
  const noFooterPages = ['/subscription', '/landing', '/essai-gratuit'];
  
  if (noFooterPages.includes(pathname || '')) {
    return null;
  }
  
  return (
    <footer className="border-t border-black/[.08] dark:border-white/[.145] text-sm text-center py-6">
      <div className="max-w-6xl mx-auto px-4">
        <p>Tous droits réservés — CertifDiag</p>
      </div>
    </footer>
  );
}

