
export enum Subject {
  THEORY = '學科',
  MAKEUP = '彩妝',
  STYLE = '造型',
  SKIN = '護膚',
  INTERN = '實習'
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
  teacherName: string;
  studentCount: number; // Added per "Technical Spec 3.2"
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
