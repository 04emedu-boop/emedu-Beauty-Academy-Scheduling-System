import React from 'react';
import { Subject } from '../types';
import { SUBJECT_ORDER } from '../constants';

interface Props {
  selected: Subject;
  onSelect: (s: Subject) => void;
  disabled: boolean;
}

export const SubjectSelector: React.FC<Props> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
      {SUBJECT_ORDER.map((subject) => {
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