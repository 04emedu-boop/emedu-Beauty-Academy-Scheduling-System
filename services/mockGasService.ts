
import { BookingRequest, ApiResponse, SlotStatus, TimeSlotData, Subject, Location } from '../types';
import { TIME_SLOTS, SUBJECT_OFFSETS, MOCK_NETWORK_DELAY, MOCK_SUBMIT_DELAY } from '../constants';
import { getAvailableTimeSlots } from '../utils/timeUtils';

/**
 * MOCK DATABASE STRUCTURE
 * Key: Sheet Name (e.g., "114/12")
 * Value: Matrix of data [Row][Col] -> Value
 * 
 * We use a flattened map for easier simulation: "SheetName::Date::Time::Subject::Location" -> Value
 */
const mockDatabase: Map<string, string> = new Map();

// Initialize with some "Admin" data (e.g., License Classes)
// Simulating Doc Section 1: "Manual... pre-filled fixed courses"
const initMockData = () => {
  // Pre-fill 2025-12-01 10:00-12:00 Theory with "License Class" for all locations
  mockDatabase.set('114/12::2025-12-01::10:00-11:00::學科::台北伊美', '執照班(固定)');
  mockDatabase.set('114/12::2025-12-01::11:00-12:00::學科::台北伊美', '執照班(固定)');

  // Pre-fill 2025-12-01 14:00-15:00 Makeup with "Teacher Lisa" using new format
  mockDatabase.set('114/12::2025-12-01::14:00-15:00::彩妝::台北伊美', 'Lisa (2) - 基礎彩妝');
};

initMockData();

initMockData();

// --- LocalStorage Helper (to persist changes during dev) ---
const STORAGE_KEY_TEACHERS = 'mock_teachers_v2'; // Bump version to clear old data
const STORAGE_KEY_CONTENTS = 'mock_contents_v1';

const getStoredList = (key: string, defaults: string[]): string[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaults;
  } catch (e) {
    return defaults;
  }
};

const saveStoredList = (key: string, list: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage save failed', e);
  }
};

// --- Mock Data ---
const DEFAULT_TEACHERS: string[] = []; // Clear default names as requested
const DEFAULT_CONTENTS = ['基礎彩妝', '進階造型', '美甲基礎', '護膚實務', '考照衝刺'];

// Teacher Database
let MOCK_TEACHERS_DB = getStoredList(STORAGE_KEY_TEACHERS, DEFAULT_TEACHERS);

// Course Content Database
let MOCK_CONTENTS_DB = getStoredList(STORAGE_KEY_CONTENTS, DEFAULT_CONTENTS);

/**
 * MOCK API: Fetch available teachers
 */
export const fetchTeachers = async (location: string = Location.TAIPEI): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_NETWORK_DELAY));
  // Refresh from storage in case it changed elsewhere
  MOCK_TEACHERS_DB = getStoredList(STORAGE_KEY_TEACHERS, DEFAULT_TEACHERS);
  return [...MOCK_TEACHERS_DB];
};

/**
 * MOCK API: Add a new teacher
 */
export const addTeacher = async (name: string, location: string = Location.TAIPEI): Promise<ApiResponse> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_SUBMIT_DELAY));

  if (!name.trim()) return { success: false, message: '名單不可為空' };

  MOCK_TEACHERS_DB = getStoredList(STORAGE_KEY_TEACHERS, DEFAULT_TEACHERS);

  if (MOCK_TEACHERS_DB.includes(name)) {
    return { success: false, message: '該老師已在名單中' };
  }

  const newList = [...MOCK_TEACHERS_DB, name];
  saveStoredList(STORAGE_KEY_TEACHERS, newList);
  MOCK_TEACHERS_DB = newList;

  return { success: true, message: `成功新增老師：${name}` };
};

/**
 * MOCK API: Fetch saved course contents
 */
export const fetchCourseContents = async (location: string = Location.TAIPEI): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_NETWORK_DELAY));
  MOCK_CONTENTS_DB = getStoredList(STORAGE_KEY_CONTENTS, DEFAULT_CONTENTS);
  return [...MOCK_CONTENTS_DB];
};

/**
 * MOCK API: Add new course content
 */
export const addCourseContent = async (content: string, location: string = Location.TAIPEI): Promise<ApiResponse> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_SUBMIT_DELAY)); // Faster than submit

  if (!content.trim()) return { success: false, message: '內容不可為空' };

  MOCK_CONTENTS_DB = getStoredList(STORAGE_KEY_CONTENTS, DEFAULT_CONTENTS);

  if (MOCK_CONTENTS_DB.includes(content)) {
    return { success: false, message: '該內容已在常用清單中' };
  }

  const newList = [...MOCK_CONTENTS_DB, content];
  saveStoredList(STORAGE_KEY_CONTENTS, newList);
  MOCK_CONTENTS_DB = newList;

  return { success: true, message: `成功加入常用清單：${content}` };
};


// Helper: Convert YYYY-MM-DD to ROC Year/Month (Doc Section 3.1)
// 2025-12-01 -> "114/12"
const getSheetName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear() - 1911;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}/${month}`;
};

// Simulating GAS `checkSlotStatus`
export const fetchDaySchedule = async (date: string, subject: Subject, location: Location = Location.TAIPEI): Promise<TimeSlotData[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, MOCK_NETWORK_DELAY));

  const sheetName = getSheetName(date);
  const availableSlots = getAvailableTimeSlots(date);  // 根據日期取得可用時段

  return availableSlots.map(time => {
    // Key construction mimics the "Coordinate Mapping" in Doc Section 4.1
    // We don't implement the full 2D array scan here, but the logical result is identical.
    const key = `${sheetName}::${date}::${time}::${subject}::${location}`;
    const value = mockDatabase.get(key);

    if (value) {
      return {
        time,
        status: SlotStatus.OCCUPIED,
        occupiedBy: value
      };
    } else {
      return {
        time,
        status: SlotStatus.AVAILABLE
      };
    }
  });
};

// Simulating GAS `submitBooking` (Doc Section 3.2 in Technical Spec)
export const submitBooking = async (request: BookingRequest): Promise<ApiResponse> => {
  // Simulate network latency (LockService simulation)
  await new Promise(resolve => setTimeout(resolve, MOCK_SUBMIT_DELAY));

  const { date, time, subject, teacherName, studentCount, location, courseContent } = request;
  const sheetName = getSheetName(date);
  const key = `${sheetName}::${date}::${time}::${subject}::${location}`;

  // Doc Section 4.1 Step 4: Collision Detection
  const existingValue = mockDatabase.get(key);
  if (existingValue) {
    return {
      success: false,
      message: `預約失敗：該時段已被「${existingValue}」佔用。請重新整理。`
    };
  }

  // Write to DB with format: "Name (Count) - CourseContent" or "Name (Count)"
  const formattedValue = courseContent
    ? `${teacherName} (${studentCount}) - ${courseContent}`
    : `${teacherName} (${studentCount})`;
  mockDatabase.set(key, formattedValue);

  return {
    success: true,
    message: `預約成功！已登記 ${date} ${time} ${subject} @ ${location} (${teacherName}, ${studentCount}人)${courseContent ? ' - ' + courseContent : ''}`
  };
};
