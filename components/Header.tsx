import React from 'react';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { GOOGLE_SHEET_URL } from '../constants';

/**
 * Header 元件
 * 顯示應用程式標題和版本資訊
 */
interface HeaderProps {
  gasUrl: string;
  onUrlChange: (url: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ gasUrl, onUrlChange }) => {
  return (
    <header className="bg-indigo-600 text-white shadow-lg space-y-2">
      <div className="max-w-md mx-auto px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6" />
          <h1 className="text-lg font-bold tracking-wide">美業教室排課系統</h1>
        </div>
        <a
          href={GOOGLE_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-500 transition-colors"
          title="開啟後台試算表"
        >
          <span>後台表格</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Backend Config Input */}
      <div className="max-w-md mx-auto px-4 pb-4">
        <input
          type="text"
          value={gasUrl}
          onChange={(e) => {
            // Basic validation (allow empty, or must start with http)
            onUrlChange(e.target.value);
          }}
          onBlur={(e) => {
            // More strict validation on blur could be added here
            const val = e.target.value.trim();
            if (val && !val.startsWith('http')) {
              // Could show warning, but for now just let it be, App handles retrying or service handles error
            }
          }}
          placeholder="貼上 Google Apps Script 網址以啟用真實連線..."
          className={`w-full text-xs p-2 rounded bg-indigo-700 border text-white placeholder-indigo-300 focus:outline-none focus:border-white ${gasUrl && !gasUrl.startsWith('http') ? 'border-red-400' : 'border-indigo-500'}`}
        />
        {!gasUrl && <div className="text-[10px] text-indigo-200 mt-1">目前使用模擬模式 (資料不會儲存)</div>}
        {gasUrl && !gasUrl.startsWith('http') && <div className="text-[10px] text-red-200 mt-1">網址格式似乎不正確 (應以 http 開頭)</div>}
      </div>
    </header>
  );
};