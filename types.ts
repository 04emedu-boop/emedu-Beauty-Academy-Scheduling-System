
export enum Subject {
  THEORY = '學科',
  MAKEUP = '彩妝',
  STYLE = '造型',
  SPA = 'SPA', // New
  SKIN = '護膚',
  INTERN = '實習'
}

export enum Location {
  TAIPEI = '台北伊美',
  TAICHUNG = '台中伊美',
  KAOHSIUNG = '高雄伊美'
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED', // Filled by Admin or other teacher
  SELECTED = 'SELECTED'  // Currently selected by user
}

export interface TimeSlotData {
  time: string;
  status: SlotStatus;
  occupiedBy?: string; // If occupied, who/what is there (e.g., "執照班", "依珊 (3)")
}

export interface BookingRequest {
  date: string; // YYYY-MM-DD
  subject: Subject;
  time: string;
  timeSlots?: string[];  // 新增:多時段陣列(可選)
  teacherName: string;
  studentCount: number;
  location: Location;  // 新增:地區
  courseContent: string;  // 新增:課程內容
}


export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
