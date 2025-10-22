"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function InvitePage() {
  const params = useParams();
  const userCustomId = params.userCustomId as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                CertifDiag
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/connexion" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Icône d'invitation */}
          <div className="mb-8">
            <Image
              src="/invitfriends.png"
              alt="Invitation CertifDiag"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Rejoins-moi sur CertifDiag !
          </h1>

          {/* Message d'invitation */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
            <p className="text-xl text-gray-700 mb-4">
              <span className="font-semibold text-blue-600">{userCustomId}</span> t&apos;a invité à découvrir CertifDiag !
            </p>
            <p className="text-gray-600 leading-relaxed">
              Apprends le diagnostic immobilier de manière ludique et interactive. 
              Rejoins des milliers d&apos;apprenants qui se forment avec nos quiz, 
              jeux et contenus pédagogiques de qualité.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apprentissage Ludique</h3>
              <p className="text-gray-600 text-sm">Quiz interactifs et jeux pour apprendre en s&apos;amusant</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contenu Expert</h3>
              <p className="text-gray-600 text-sm">Formation complète en diagnostic immobilier</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communauté</h3>
              <p className="text-gray-600 text-sm">Rejoins une communauté d&apos;apprenants motivés</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Créer mon compte gratuit
            </Link>
            <Link
              href="/connexion"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Invité par <span className="font-semibold text-blue-600">{userCustomId}</span>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              CertifDiag - Formation en diagnostic immobilier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
