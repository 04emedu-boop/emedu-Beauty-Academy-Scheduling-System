import React from 'react';
import { Location } from '../types';
import { LOCATIONS } from '../constants';
import { MapPin } from 'lucide-react';

interface Props {
    selected: Location;
    onSelect: (location: Location) => void;
    disabled?: boolean;
}

/**
 * LocationSelector 元件
 * 顯示地區選擇按鈕,支援台北伊美、台中伊美、高雄伊美
 * 
 * @param selected - 當前選擇的地區
 * @param onSelect - 選擇地區時的回調函數
 * @param disabled - 是否禁用選擇
 */
export const LocationSelector: React.FC<Props> = ({ selected, onSelect, disabled }) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> 選擇地區
            </label>
            <div className="grid grid-cols-3 gap-2">
                {LOCATIONS.map(location => (
                    <button
                        key={location}
                        onClick={() => onSelect(location)}
                        disabled={disabled}
                        className={`
              py-2.5 px-3 rounded-lg border-2 font-medium text-sm transition-all
              ${selected === location
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:shadow-sm'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        {location}
                    </button>
                ))}
            </div>
        </div>
    );
};
