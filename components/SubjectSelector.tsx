import React from 'react';
import { Subject, Location } from '../types';
import { SUBJECT_ORDER_MAP } from '../constants';

interface Props {
  selected: Subject;
  location: Location; // New prop
  onSelect: (s: Subject) => void;
  disabled: boolean;
}

/**
 * SubjectSelector 元件
 * 顯示科目選擇按鈕,讓使用者選擇要預約的教室類型
 * 
 * @param selected - 當前選擇的科目
 * @param onSelect - 選擇科目時的回調函數
 * @param disabled - 是否禁用選擇功能
 */
export const SubjectSelector: React.FC<Props> = ({ selected, location, onSelect, disabled }) => {
  const subjects = SUBJECT_ORDER_MAP[location] || SUBJECT_ORDER_MAP[Location.TAICHUNG];

  return (
    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
      {subjects.map((subject) => {
        const isSelected = selected === subject;
        return (
          <button
            key={subject}
            onClick={() => onSelect(subject)}
            disabled={disabled}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${isSelected
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {subject}
          </button>
        );
      })}
    </div>
  );
};