
import { Subject, Location } from './types';

// Defined in Doc Section 3.2
// 預設科目順序 (台中、高雄)
export const SUBJECT_ORDER_DEFAULT: Subject[] = [
  Subject.THEORY,
  Subject.MAKEUP,
  Subject.STYLE,
  Subject.SKIN,
  Subject.INTERN
];

// 台北科目順序 (包含 SPA, 無實習)
export const SUBJECT_ORDER_TAIPEI: Subject[] = [
  Subject.THEORY,
  Subject.MAKEUP,
  Subject.STYLE,
  Subject.SPA,
  Subject.SKIN
];

export const SUBJECT_ORDER_MAP: Record<Location, Subject[]> = {
  [Location.TAIPEI]: SUBJECT_ORDER_TAIPEI,
  [Location.TAICHUNG]: SUBJECT_ORDER_DEFAULT,
  [Location.KAOHSIUNG]: SUBJECT_ORDER_DEFAULT
};

// Deprecated: default export
export const SUBJECT_ORDER = SUBJECT_ORDER_DEFAULT;

// Defined in Doc Section 3.2 (Row 2 offsets relative to Time column)
export const SUBJECT_OFFSETS: Record<Subject, number> = {
  [Subject.THEORY]: 1,
  [Subject.MAKEUP]: 2,
  [Subject.STYLE]: 3,
  [Subject.SPA]: 4, // SPA 與 Skin 在不同地區可能位置重疊，但這裡僅定義 Key->Value，後端邏輯是動態搜尋 Header
  [Subject.SKIN]: 5,
  [Subject.INTERN]: 6 // Shifted
};

// 地區選項
export const LOCATIONS: Location[] = [
  Location.TAIPEI,
  Location.TAICHUNG,
  Location.KAOHSIUNG
];

// 時段配置 - 週一至週四 (10:00-21:00)
export const TIME_SLOTS_WEEKDAY: string[] = [
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00'
];

// 時段配置 - 週五及週日 (10:00-17:00)
export const TIME_SLOTS_FRIDAY_SUNDAY: string[] = [
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
];

// 時段配置 - 週六及國定假日 (公休但開放登記)
export const TIME_SLOTS_HOLIDAY: string[] = TIME_SLOTS_WEEKDAY;

// 國定假日對照表 (2025-2026) - 可由管理員動態設定
export const PUBLIC_HOLIDAY_MAP: Record<string, string> = {
  // 2025
  '2025-01-01': '元旦',
  '2025-01-28': '春節',
  '2025-01-29': '春節',
  '2025-01-30': '春節',
  '2025-01-31': '春節',
  '2025-02-01': '春節',
  '2025-02-28': '和平紀念日',
  '2025-04-04': '清明節',
  '2025-04-05': '清明節',
  '2025-06-10': '端午節',
  '2025-09-17': '中秋節',
  '2025-10-10': '國慶日',
  // 2026
  '2026-01-01': '元旦',
  '2026-02-16': '春節',
  '2026-02-17': '春節',
  '2026-02-18': '春節',
  '2026-02-19': '春節',
  '2026-02-20': '春節',
  '2026-02-28': '和平紀念日',
  '2026-04-04': '清明節',
  '2026-04-05': '清明節',
  '2026-06-19': '端午節',
  '2026-10-06': '中秋節',
  '2026-10-10': '國慶日',
};

// 保留 PUBLIC_HOLIDAYS 陣列以保持向後相容
export const PUBLIC_HOLIDAYS: string[] = Object.keys(PUBLIC_HOLIDAY_MAP);

// 保留原有的 TIME_SLOTS 以保持向後相容
export const TIME_SLOTS: string[] = TIME_SLOTS_WEEKDAY;

export const MOCK_INITIAL_DATE = '2025-12-01';

// Defined in Doc Section "System Settings" - Teacher List
// Moved to backend service (mockGasService.ts)

// UI Configuration Constants
export const TOAST_DURATION = 3000; // milliseconds
export const MAX_STUDENT_COUNT = 5;
export const MIN_STUDENT_COUNT = 1;

// 課程內容限制
export const MAX_COURSE_CONTENT_LENGTH = 10;

// Google Sheet Configuration
export const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pRPoCp1g3nbQxI2OS2nWZIU18QcCKP7lmGQtRqHz3JI/edit?gid=1109424923#gid=1109424923';
export const SPREADSHEET_ID = '1pRPoCp1g3nbQxI2OS2nWZIU18QcCKP7lmGQtRqHz3JI';

// Mock Delays (ms)rvice Configuration (for development)
export const MOCK_NETWORK_DELAY = 300; // milliseconds
export const MOCK_SUBMIT_DELAY = 800; // milliseconds
