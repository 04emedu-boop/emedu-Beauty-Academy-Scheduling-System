import React from 'react';
import { TimeSlotData, SlotStatus } from '../types';
import { Clock, CheckCircle, XCircle, User } from 'lucide-react';

interface Props {
  slots: TimeSlotData[];
  selectedTimes: string[];  // 改為陣列支援多選
  onSelectSlot: (time: string) => void;
  loading: boolean;
  multiSelect?: boolean;  // 新增:是否啟用多選模式
}

/**
 * BookingGrid 元件
 * 顯示時段選擇網格,展示所有可用和已佔用的時段
 * 
 * @param slots - 時段資料陣列,包含狀態和佔用資訊
 * @param selectedTimes - 當前選擇的時段陣列
 * @param onSelectSlot - 選擇時段時的回調函數
 * @param loading - 是否正在載入資料
 * @param multiSelect - 是否啟用多選模式
 */
export const BookingGrid: React.FC<Props> = ({ slots, selectedTimes, onSelectSlot, loading, multiSelect = true }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <p className="text-sm">讀取課表狀態中...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot) => {
        const isOccupied = slot.status === SlotStatus.OCCUPIED;
        const isSelected = selectedTimes.includes(slot.time);

        let containerClass = "relative p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-start gap-1 cursor-pointer select-none h-24";
        let icon = <Clock className="w-4 h-4 text-gray-400" />;
        let statusText = "可預約";
        let textColor = "text-gray-600";

        if (isOccupied) {
          containerClass += " bg-gray-100 border-gray-200 cursor-not-allowed opacity-80";
          icon = <XCircle className="w-4 h-4 text-red-500" />;
          statusText = slot.occupiedBy || "已佔用";
          textColor = "text-red-800 font-medium";
        } else if (isSelected) {
          containerClass += " bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500";
          icon = <CheckCircle className="w-4 h-4 text-indigo-600" />;
          statusText = "準備登記";
          textColor = "text-indigo-700 font-bold";
        } else {
          containerClass += " bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm";
          icon = <Clock className="w-4 h-4 text-green-500" />;
          statusText = "可預約";
          textColor = "text-green-700";
        }

        return (
          <div
            key={slot.time}
            onClick={() => !isOccupied && onSelectSlot(slot.time)}
            className={containerClass}
          >
            <div className="flex w-full justify-between items-start">
              <span className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-1 rounded">
                {slot.time}
              </span>
              {icon}
            </div>

            <div className={`mt-auto text-sm truncate w-full flex items-center gap-1 ${textColor}`}>
              {isOccupied && <User className="w-3 h-3" />}
              <span className="truncate">{statusText}</span>
            </div>

            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};