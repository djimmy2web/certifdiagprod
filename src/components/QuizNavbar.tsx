"use client";

interface QuizNavbarProps {
  currentQuestion: number;
  totalQuestions: number;
  lives: number;
  maxLives?: number;
}

export default function QuizNavbar({ 
  currentQuestion, 
  totalQuestions, 
  lives, 
  maxLives = 5 // eslint-disable-line @typescript-eslint/no-unused-vars 
}: QuizNavbarProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Certif à gauche */}
          <div className="flex items-center">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
              Certif
            </div>
          </div>

          {/* Barre de progression au centre */}
          <div className="flex items-center space-x-3">
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 font-medium min-w-[3rem]">
              {currentQuestion}/{totalQuestions}
            </span>
          </div>

          {/* Vies à droite */}
          <div className="flex items-center space-x-2">
            <span className="text-lg text-red-500">❤️</span>
            <span className="text-sm font-medium text-gray-700">
              {lives}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
