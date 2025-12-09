
import { BookingRequest, ApiResponse, SlotStatus, TimeSlotData, Subject } from '../types';
import { TIME_SLOTS, SUBJECT_OFFSETS } from '../constants';

/**
 * MOCK DATABASE STRUCTURE
 * Key: Sheet Name (e.g., "114/12")
 * Value: Matrix of data [Row][Col] -> Value
 * 
 * We use a flattened map for easier simulation: "SheetName::Date::Time::Subject" -> Value
 */
const mockDatabase: Map<string, string> = new Map();

// Initialize with some "Admin" data (e.g., License Classes)
// Simulating Doc Section 1: "Manual... pre-filled fixed courses"
const initMockData = () => {
  // Pre-fill 2025-12-01 10:00-12:00 Theory with "License Class"
  mockDatabase.set('114/12::2025-12-01::10:00-11:00::學科', '執照班(固定)');
  mockDatabase.set('114/12::2025-12-01::11:00-12:00::學科', '執照班(固定)');
  
  // Pre-fill 2025-12-01 14:00-15:00 Makeup with "Teacher Lisa" using new format
  mockDatabase.set('114/12::2025-12-01::14:00-15:00::彩妝', 'Lisa (2)');
};

initMockData();

// Helper: Convert YYYY-MM-DD to ROC Year/Month (Doc Section 3.1)
// 2025-12-01 -> "114/12"
const getSheetName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear() - 1911;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}/${month}`;
};

// Simulating GAS `checkSlotStatus`
export const fetchDaySchedule = async (date: string, subject: Subject): Promise<TimeSlotData[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));

  const sheetName = getSheetName(date);
  
  return TIME_SLOTS.map(time => {
    // Key construction mimics the "Coordinate Mapping" in Doc Section 4.1
    // We don't implement the full 2D array scan here, but the logical result is identical.
    const key = `${sheetName}::${date}::${time}::${subject}`;
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
  await new Promise(resolve => setTimeout(resolve, 800));

  const { date, time, subject, teacherName, studentCount } = request;
  const sheetName = getSheetName(date);
  const key = `${sheetName}::${date}::${time}::${subject}`;

  // Doc Section 4.1 Step 4: Collision Detection
  const existingValue = mockDatabase.get(key);
  if (existingValue) {
    return {
      success: false,
      message: `預約失敗：該時段已被「${existingValue}」佔用。請重新整理。`
    };
  }

  // Write to DB with format: "Name (Count)"
  const formattedValue = `${teacherName} (${studentCount})`;
  mockDatabase.set(key, formattedValue);

  return {
    success: true,
    message: `預約成功！已登記 ${date} ${time} ${subject} (${teacherName}, ${studentCount}人)`
  };
};
