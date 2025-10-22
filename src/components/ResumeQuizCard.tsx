'use client';

interface ResumeQuizCardProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
  };
}

export default function ResumeQuizCard({ quiz }: ResumeQuizCardProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Reprend ton quiz</h2>
      <div className="bg-blue-500 rounded-xl p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{quiz.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-px h-6 bg-white/30"></div>
          <a 
            href={`/reviser/${quiz.id}`} 
            className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            Reprendre +10 XP
          </a>
        </div>
      </div>
    </div>
  );
}
