export type AttendanceStatus = "PENDING" | "PRESENT" | "ABSENT";

export interface ParsedLessonEntry {
  startTime: string;
  studentName: string;
  durationMin?: number;
  isTrial: boolean;
}

export interface OcrResult {
  teacherName: string;
  classroom: string;
  lessons: ParsedLessonEntry[];
  rawText: string;
}

export interface MonthSelection {
  year: number;
  month: number;
}

export interface StudentSummary {
  id: string;
  name: string;
  lessonCount: number;
  lastLesson?: Date;
}
