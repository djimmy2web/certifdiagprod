'use client';

interface Quest {
  id: string;
  title: string;
  progress: number;
  total: number;
  completed: boolean;
}

interface DailyQuestsCardProps {
  quests: Quest[];
}

export default function DailyQuestsCard({ quests }: DailyQuestsCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Quêtes du jour</h3>
        <a href="/badges" className="text-blue-600 text-sm font-medium hover:underline">
          AFFICHER TOUT
        </a>
      </div>
      
      <div className="space-y-2">
        {quests.map((quest) => (
          <div key={quest.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">{quest.title}</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {quest.progress}/{quest.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
