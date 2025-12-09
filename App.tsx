
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SubjectSelector } from './components/SubjectSelector';
import { BookingGrid } from './components/BookingGrid';
import { Subject, TimeSlotData } from './types';
import { MOCK_INITIAL_DATE, MOCK_TEACHERS } from './constants';
import * as GasService from './services/mockGasService';
import { User, Calendar, Users } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [teacherName, setTeacherName] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(MOCK_INITIAL_DATE);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.THEORY);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlotData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Fetch Data when Date or Subject changes
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setSelectedTime(null); // Reset selection on context change
    try {
      const data = await GasService.fetchDaySchedule(selectedDate, selectedSubject);
      setSlots(data);
    } catch (error) {
      console.error(error);
      showToast('讀取課表失敗，請重試', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSubject]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Handle Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!teacherName) {
      showToast('請選擇老師姓名', 'error');
      return;
    }
    if (!selectedTime) {
      showToast('請選擇時段', 'error');
      return;
    }
    if (studentCount < 1) {
      showToast('學生人數至少為 1', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await GasService.submitBooking({
        date: selectedDate,
        subject: selectedSubject,
        time: selectedTime,
        teacherName: teacherName,
        studentCount: studentCount
      });

      if (result.success) {
        showToast(result.message, 'success');
        await loadSchedule(); // Refresh data to show new "Occupied" status
      } else {
        showToast(result.message, 'error');
        await loadSchedule(); // Refresh in case of collision
      }
    } catch (error) {
      showToast('系統發生錯誤，請稍後再試', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Section 1: Teacher Info & Basic Settings */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          
          {/* Teacher Selection (Step 1 in Doc) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-4 h-4" /> 老師姓名
            </label>
            <select
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="" disabled>請點選您的名字</option>
              {MOCK_TEACHERS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date Selection (Step 2 in Doc) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> 選擇日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
            <p className="text-xs text-gray-400 mt-1 pl-1">
              系統將自動對應至 Google Sheet: 114/{new Date(selectedDate).getMonth() + 1}
            </p>
          </div>
        </div>

        {/* Section 2: Subject Selector (Step 3 Resource) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">預約科目 (教室)</label>
          <SubjectSelector 
            selected={selectedSubject} 
            onSelect={setSelectedSubject} 
            disabled={loading || submitting} 
          />
        </div>

        {/* Section 3: Time Grid (Step 2 Time) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">選擇時段</label>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-500"><div className="w-2 h-2 rounded-full bg-gray-200"></div>已滿</span>
              <span className="flex items-center gap-1 text-green-600"><div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>可選</span>
            </div>
          </div>
          <BookingGrid 
            slots={slots} 
            selectedTime={selectedTime} 
            onSelectSlot={setSelectedTime} 
            loading={loading}
          />
        </div>

      </main>

      {/* Floating Action Button / Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          
          {/* Student Count Input (Step 3 Resource - Continued) */}
          {selectedTime && (
            <div className="flex items-center justify-between bg-indigo-50 p-2 rounded-lg border border-indigo-100 animate-fade-in-up">
              <label className="text-sm font-medium text-indigo-900 flex items-center gap-1 pl-2">
                <Users className="w-4 h-4" /> 學生人數：
              </label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setStudentCount(Math.max(1, studentCount - 1))}
                  className="w-8 h-8 rounded bg-white border border-indigo-200 text-indigo-600 font-bold"
                >-</button>
                <input 
                  type="number" 
                  min="1" 
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value) || 1)}
                  className="w-12 text-center p-1 border-b border-indigo-300 bg-transparent font-bold text-indigo-900 focus:outline-none"
                />
                <button 
                  onClick={() => setStudentCount(studentCount + 1)}
                  className="w-8 h-8 rounded bg-white border border-indigo-200 text-indigo-600 font-bold"
                >+</button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
               {selectedTime ? (
                 <span className="flex flex-col">
                   <span>已選: <span className="font-bold text-indigo-600">{selectedTime}</span></span>
                 </span>
               ) : (
                 <span>尚未選擇時段</span>
               )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedTime || !teacherName || submitting}
              className={`
                flex-1 py-3 px-6 rounded-lg font-bold text-white shadow-md transition-all
                ${!selectedTime || !teacherName || submitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                }
              `}
            >
              {submitting ? '處理中...' : '確認登記'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-fade-in-down
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
        >
          {toast.type === 'success' ? <div className="text-xl">✓</div> : <div className="text-xl">!</div>}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default App;
