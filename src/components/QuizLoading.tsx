"use client";
import Image from "next/image";

interface QuizLoadingProps {
  message?: string;
}

export default function QuizLoading({ message = "Chargement en cours..." }: QuizLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        {/* GIF de chargement */}
        <div className="mb-8">
          <Image
            src="/quizz/gifquizz.gif"
            alt="Chargement du quiz"
            width={200}
            height={200}
            className="mx-auto"
            unoptimized
          />
        </div>
        
        {/* Message de chargement */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {message}
          </h2>
          
          {/* Barre de progression animée */}
          <div className="w-64 mx-auto">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Points de chargement animés */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
