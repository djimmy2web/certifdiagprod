'use client';

interface StreakCardProps {
  streak: number;
  weeklyStreak: Array<{
    day: string;
    completed: boolean;
    broken: boolean;
  }>;
}

export default function StreakCard({ streak, weeklyStreak }: StreakCardProps) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Série d&apos;{streak} jours</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          {days.map((day, index) => (
            <span key={index} className="w-6 text-center">{day}</span>
          ))}
        </div>
        
        <div className="flex justify-between">
          {weeklyStreak.map((day, index) => (
            <div key={index} className="w-6 h-6 flex items-center justify-center">
              {day.completed ? (
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : day.broken ? (
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
