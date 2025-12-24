
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SubjectSelector } from './components/SubjectSelector';
import { LocationSelector } from './components/LocationSelector';
import { BookingGrid } from './components/BookingGrid';
import { InputModal } from './components/InputModal';
import { Subject, TimeSlotData, Location } from './types';
import { MOCK_INITIAL_DATE, TOAST_DURATION, MAX_STUDENT_COUNT, MIN_STUDENT_COUNT, MAX_COURSE_CONTENT_LENGTH } from './constants';
import * as MockGasService from './services/mockGasService';
import * as RealGasService from './services/gasService';
import { validateGasUrl } from './services/gasService';
import { User, Calendar, Users, BookOpen, AlertCircle, Plus } from 'lucide-react';
import { getAvailableTimeSlots, isClosedDay, isBookingAllowed, getDayOfWeekText, getBusinessHoursText, getClosedDayMessage } from './utils/timeUtils';

const App: React.FC = () => {
  // Service Switcher
  const [gasUrl, setGasUrl] = useState<string>(localStorage.getItem('gas_web_app_url') || '');
  const GasService = gasUrl ? RealGasService : MockGasService;

  // State
  const [teachers, setTeachers] = useState<string[]>([]);
  const [savedContents, setSavedContents] = useState<string[]>([]); // New state for saved contents
  const [teacherName, setTeacherName] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(MOCK_INITIAL_DATE);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.THEORY);
  const [location, setLocation] = useState<Location>(Location.TAIPEI);
  const [courseContent, setCourseContent] = useState<string>('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);  // 改為陣列支援多選
  const [slots, setSlots] = useState<TimeSlotData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'teacher' | 'content'>('teacher');

  // Fetch Teachers & Contents when Location changes
  useEffect(() => {
    const initData = async () => {
      try {
        // Pass location to fetchers
        const [teacherList, contentList] = await Promise.all([
          GasService.fetchTeachers(location),
          GasService.fetchCourseContents(location)
        ]);
        setTeachers(teacherList);
        setSavedContents(contentList);
      } catch (error) {
        showToast('無法讀取初始資料', 'error');
      }
    };
    initData();
  }, [gasUrl, location]); // Re-fetch when URL OR Location changes

  // Fetch Data when Date, Subject, or Location changes
  const loadSchedule = useCallback(async () => {
    // If using real service but no URL, don't load
    if (!gasUrl && GasService === RealGasService) return;

    setLoading(true);
    setSelectedTimes([]); // Reset selection on context change
    try {
      const data = await GasService.fetchDaySchedule(selectedDate, selectedSubject, location);
      setSlots(data);
    } catch (error: any) {
      showToast(error.message || '讀取課表失敗,請重試', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSubject, location]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Handle Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  };

  // Date Input Handler with Validation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Only update if the value is empty or matches the correct format
    if (value === '' || dateRegex.test(value)) {
      // Additional validation: check if it's a valid date
      if (value !== '') {
        const date = new Date(value);
        // Check if date is valid (not NaN) and the string representation matches
        if (!isNaN(date.getTime())) {
          setSelectedDate(value);
        }
      } else {
        setSelectedDate(value);
      }
    }
    // If format is invalid, we simply don't update the state
  };

  // Handlers for Adding New Data
  const openAddTeacherModal = () => {
    setModalType('teacher');
    setIsModalOpen(true);
  };

  const openAddContentModal = () => {
    setModalType('content');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (value: string) => {
    setLoading(true);
    try {
      if (modalType === 'teacher') {
        const result = await GasService.addTeacher(value, location);
        if (result.success) {
          showToast(result.message, 'success');
          const newList = await GasService.fetchTeachers(location);
          setTeachers(newList);
          setTeacherName(value); // Auto select
        } else {
          showToast(result.message, 'error');
        }
      } else {
        const result = await GasService.addCourseContent(value, location);
        if (result.success) {
          showToast(result.message, 'success');
          const newList = await GasService.fetchCourseContents(location);
          setSavedContents(newList);
          setCourseContent(value); // Auto fill
        } else {
          showToast(result.message, 'error');
        }
      }
    } catch (e) {
      showToast('新增失敗', 'error');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // Handle multi-slot selection
  const handleSlotSelect = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);  // 取消選擇
      } else {
        return [...prev, time];  // 新增選擇
      }
    });
  };

  // Submit Handler
  const handleSubmit = async () => {
    // Show validation errors
    setShowValidationError(true);

    // 防止在公休日提交 (僅當不允許預約時)
    if (!isBookingAllowed(selectedDate)) {
      showToast('此日期不可登記預約', 'error');
      return;
    }

    if (!teacherName) {
      showToast('請選擇老師姓名', 'error');
      return;
    }
    if (selectedTimes.length === 0) {
      showToast('請至少選擇一個時段', 'error');
      return;
    }
    if (studentCount < MIN_STUDENT_COUNT || studentCount > MAX_STUDENT_COUNT || !Number.isInteger(studentCount)) {
      showToast(`學生人數必須為 ${MIN_STUDENT_COUNT}-${MAX_STUDENT_COUNT} 之間的整數`, 'error');
      return;
    }
    if (courseContent.length > MAX_COURSE_CONTENT_LENGTH) {
      showToast(`課程內容不得超過 ${MAX_COURSE_CONTENT_LENGTH} 字`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      let successCount = 0;
      let failCount = 0;

      // 提交所有選擇的時段
      for (const time of selectedTimes) {
        const result = await GasService.submitBooking({
          date: selectedDate,
          subject: selectedSubject,
          time: time,
          teacherName: teacherName,
          studentCount: studentCount,
          location: location,
          courseContent: courseContent
        });

        if (result.success) {
          successCount++;
        } else {
          failCount++;
          showToast(result.message, 'error');
          break;  // 遇到失敗就停止
        }
      }

      if (successCount > 0) {
        showToast(`成功登記 ${successCount} 個時段！`, 'success');
        setSelectedTimes([]);  // 清空選擇
        setCourseContent('');  // 清空課程內容
      }

      await loadSchedule(); // Refresh data
    } catch (error) {
      showToast('系統發生錯誤，請稍後再試', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header
        gasUrl={gasUrl}
        onUrlChange={(url) => {
          localStorage.setItem('gas_web_app_url', url);
          setGasUrl(url);
          window.location.reload(); // Reload to force clean state
        }}
      />

      {/* URL Validation Warning */}
      {gasUrl && !validateGasUrl(gasUrl).isValid && (
        <div className="max-w-md mx-auto px-4 mt-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold">網址格式不正確</p>
              <p className="text-xs mt-1">{validateGasUrl(gasUrl).error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mock Mode Indicator */}
      {!gasUrl && (
        <div className="max-w-md mx-auto px-4 mt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-800 font-medium">目前使用模擬模式 (資料不會儲存)</p>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Section 1: Teacher Info & Basic Settings */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">

          {/* Teacher Selection (Step 1 in Doc) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-4 h-4" /> 老師姓名
              {showValidationError && !teacherName && (
                <span className="text-xs text-red-600 ml-auto">請選擇老師</span>
              )}
            </label>
            <div className="flex gap-2">
              <select
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  setShowValidationError(false);
                }}
                className={`flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors ${showValidationError && !teacherName
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
                  }`}
              >
                <option value="" disabled>請點選您的名字</option>
                {teachers.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={openAddTeacherModal}
                className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                title="新增老師"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date Selection (Step 2 in Doc) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> 選擇日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
            <div className="flex items-center justify-between mt-1 pl-1">
              <p className="text-xs text-gray-400">
                系統將自動對應至 Google Sheet: {(() => {
                  const date = new Date(selectedDate);
                  const rocYear = date.getFullYear() - 1911;
                  const month = date.getMonth() + 1;
                  return `${rocYear}/${month}`;
                })()}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{getDayOfWeekText(selectedDate)}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">{getBusinessHoursText(selectedDate)}</span>
              </div>
            </div>
            {isClosedDay(selectedDate) && (() => {
              const { title, message } = getClosedDayMessage(selectedDate);
              return (
                <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-900">{title}</p>
                    <p className="text-xs text-red-800 mt-1">{message}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Section 2: Location Selector */}
        <LocationSelector
          selected={location}
          onSelect={setLocation}
          disabled={loading || submitting || !isBookingAllowed(selectedDate)}
        />

        {/* Section 3: Subject Selector (Step 3 Resource) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">預約科目 (教室)</label>
          <SubjectSelector
            selected={selectedSubject}
            location={location} // Pass location
            onSelect={setSelectedSubject}
            disabled={loading || submitting || !isBookingAllowed(selectedDate)}
          />
        </div>

        {/* Section 4: Time Grid (Step 2 Time) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">選擇時段 (可多選)</label>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-500"><div className="w-2 h-2 rounded-full bg-gray-200"></div>已滿</span>
              <span className="flex items-center gap-1 text-green-600"><div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>可選</span>
            </div>
          </div>
          {!isBookingAllowed(selectedDate) ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">此日期不開放預約</p>
              <p className="text-sm text-gray-500 mt-1">請選擇其他日期</p>
            </div>
          ) : loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <BookingGrid
              slots={slots}
              selectedTimes={selectedTimes}
              onSelectSlot={handleSlotSelect}
              loading={false}
              multiSelect={true}
            />
          )}
        </div>

        {/* Section 5: Course Content Input */}
        {selectedTimes.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-in-up">
            <label className="block text-sm font-medium text-indigo-900 mb-2 flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> 課程內容 (選填)
            </label>

            {/* Quick Select for Content */}
            {savedContents.length > 0 && (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {savedContents.map(c => (
                  <button
                    key={c}
                    onClick={() => setCourseContent(c)}
                    className="px-3 py-1 text-xs bg-white border border-indigo-200 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={courseContent}
                onChange={(e) => setCourseContent(e.target.value)}
                placeholder="例如: 基礎彩妝、進階造型..."
                maxLength={MAX_COURSE_CONTENT_LENGTH}
                className="flex-1 p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
              <button
                onClick={openAddContentModal}
                className="p-2.5 text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                title="新增常用內容"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-indigo-600 mt-1">
              {courseContent.length}/{MAX_COURSE_CONTENT_LENGTH} 字
            </p>
          </div>
        )}

      </main>

      {/* Modals */}
      <InputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        title={modalType === 'teacher' ? '新增老師' : '新增常用內容'}
        placeholder={modalType === 'teacher' ? '請輸入老師姓名' : '請輸入課程內容'}
        defaultValue={modalType === 'content' ? courseContent : ''}
      />

      {/* Floating Action Button / Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">

          {/* Student Count Input (Step 3 Resource - Continued) */}
          {selectedTimes.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 p-2 rounded-lg border border-indigo-100 animate-fade-in-up">
              <label className="text-sm font-medium text-indigo-900 flex items-center gap-1 pl-2">
                <Users className="w-4 h-4" /> 學生人數:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStudentCount(Math.max(MIN_STUDENT_COUNT, studentCount - 1))}
                  className="w-8 h-8 rounded bg-white border border-indigo-200 text-indigo-600 font-bold"
                >-</button>
                <input
                  type="number"
                  min="1"
                  max={MAX_STUDENT_COUNT}
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value) || MIN_STUDENT_COUNT)}
                  className="w-12 text-center p-1 border-b border-indigo-300 bg-transparent font-bold text-indigo-900 focus:outline-none"
                />
                <button
                  onClick={() => setStudentCount(Math.min(MAX_STUDENT_COUNT, studentCount + 1))}
                  className="w-8 h-8 rounded bg-white border border-indigo-200 text-indigo-600 font-bold"
                >+</button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedTimes.length > 0 ? (
                <span className="flex flex-col">
                  <span>已選: <span className="font-bold text-indigo-600">{selectedTimes.length} 個時段</span></span>
                  {selectedTimes.length <= 3 && (
                    <span className="text-xs text-gray-500">{selectedTimes.join(', ')}</span>
                  )}
                </span>
              ) : (
                <span>尚未選擇時段</span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={selectedTimes.length === 0 || !teacherName || submitting || !isBookingAllowed(selectedDate)}
              className={`
                flex-1 py-3 px-6 rounded-lg font-bold text-white shadow-md transition-all
                ${selectedTimes.length === 0 || !teacherName || submitting || !isBookingAllowed(selectedDate)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                }
              `}
            >
              {submitting ? '處理中...' : !isBookingAllowed(selectedDate) ? '暫停預約' : `確認登記 (${selectedTimes.length})`}
            </button>
          </div>
        </div >
      </div >

      {/* Toast Notification */}
      {
        toast && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-fade-in-down
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
          >
            {toast.type === 'success' ? <div className="text-xl">✓</div> : <div className="text-xl">!</div>}
            <span className="font-medium">{toast.msg}</span>
          </div>
        )
      }
    </div >
  );
};

export default App;
