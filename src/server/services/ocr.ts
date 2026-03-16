export interface ParsedSchedule {
  teacherName: string;
  classroom: string;
  lessons: ParsedLesson[];
}

export interface ParsedLesson {
  startTime: string;
  studentName: string;
  durationMin?: number;
  isTrial: boolean;
}

export function parseOcrText(rawText: string): ParsedSchedule {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { teacherName: "", classroom: "", lessons: [] };
  }

  // Line 1: "Teacher Name - Classroom"
  const headerLine = lines[0];
  let teacherName = headerLine;
  let classroom = "";

  const dashIndex = headerLine.indexOf("-");
  if (dashIndex !== -1) {
    teacherName = headerLine.slice(0, dashIndex).trim();
    classroom = headerLine.slice(dashIndex + 1).trim();
  }

  const lessons: ParsedLesson[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseLessonLine(line);
    if (parsed) {
      lessons.push(parsed);
    }
  }

  return { teacherName, classroom, lessons };
}

function parseLessonLine(line: string): ParsedLesson | null {
  // Match patterns like "14:00 Ali Demir" or "14:00 Ali Demir 45dk"
  const timeMatch = line.match(/^(\d{1,2}[:.]\d{2})\s+(.+)/);
  if (!timeMatch) return null;

  const rawTime = timeMatch[1].replace(".", ":");
  const startTime = rawTime.padStart(5, "0"); // ensure HH:mm
  let remaining = timeMatch[2].trim();

  // Check for duration indicator (e.g., "45dk", "25dk", "45 dk")
  let durationMin: number | undefined;
  const durationMatch = remaining.match(/\b(25|45)\s*dk\b/i);
  if (durationMatch) {
    durationMin = parseInt(durationMatch[1], 10);
    remaining = remaining.replace(durationMatch[0], "").trim();
  }

  // Check for trial indicator
  const isTrial =
    /\bdeneme\b/i.test(remaining) || /\btrial\b/i.test(remaining);
  remaining = remaining
    .replace(/\b(deneme|trial)\b/gi, "")
    .trim();

  const studentName = remaining.replace(/\s+/g, " ").trim();
  if (!studentName) return null;

  return { startTime, studentName, durationMin, isTrial };
}
