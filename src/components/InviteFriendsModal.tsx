"use client";
import { useState } from "react";
import Image from "next/image";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCustomId?: string;
}

export default function InviteFriendsModal({ isOpen, onClose, userCustomId }: InviteFriendsModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Générer le lien d'invitation avec l'ID de l'utilisateur (local pour le moment)
  const inviteLink = `http://localhost:3000/invite/${userCustomId || 'user'}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(inviteLink);
    const text = encodeURIComponent("Rejoins-moi sur CertifDiag pour apprendre le diagnostic immobilier !");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(inviteLink);
    const text = encodeURIComponent("Rejoins-moi sur CertifDiag pour apprendre le diagnostic immobilier ! #CertifDiag");
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-200">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center">
          {/* Icône d'enveloppe */}
          <div className="mb-6">
            <Image
              src="/invitfriends.png"
              alt="Inviter des amis"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inviter des amis
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Dis à tes amis qu&apos;apprendre le diagnostic immobilier avec CertifDiag c&apos;est fun !
          </p>

          {/* Section du lien d'invitation */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? 'COPIÉ !' : 'COPIER LE LIEN'}
              </button>
            </div>
          </div>

          {/* Section de partage social */}
          <div>
            <p className="text-sm text-gray-500 mb-4">Ou partager via</p>
            <div className="flex space-x-3">
              <button
                onClick={shareOnFacebook}
                className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                FACEBOOK
              </button>
              <button
                onClick={shareOnTwitter}
                className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                TWITTER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
