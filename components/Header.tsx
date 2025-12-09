import React from 'react';
import { CalendarDays } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6" />
          <h1 className="text-lg font-bold tracking-wide">美業教室排課系統</h1>
        </div>
        <div className="text-xs bg-indigo-700 px-2 py-1 rounded border border-indigo-500">
          v2.0 Beta
        </div>
      </div>
    </header>
  );
};