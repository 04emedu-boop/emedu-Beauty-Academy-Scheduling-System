
import { Subject } from './types';

// Defined in Doc Section 3.2
export const SUBJECT_ORDER: Subject[] = [
  Subject.THEORY,
  Subject.MAKEUP,
  Subject.STYLE,
  Subject.SKIN,
  Subject.INTERN
];

// Defined in Doc Section 3.2 (Row 2 offsets relative to Time column)
export const SUBJECT_OFFSETS: Record<Subject, number> = {
  [Subject.THEORY]: 1,
  [Subject.MAKEUP]: 2,
  [Subject.STYLE]: 3,
  [Subject.SKIN]: 4,
  [Subject.INTERN]: 5
};

// Defined in Doc Section 5 (API)
export const TIME_SLOTS: string[] = [
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
  '20:00-21:00',
  '21:00-22:00'
];

export const MOCK_INITIAL_DATE = '2025-12-01';

// Defined in Doc Section "System Settings" - Teacher List
export const MOCK_TEACHERS = [
  '依珊',
  'Lisa',
  'Tina',
  'Apple',
  '王小美',
  '陳大文'
];
