"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AttendanceToggle } from "./AttendanceToggle";
import type { AttendanceStatus } from "@/types";

interface LessonRow {
  id: string;
  startTime: string;
  durationMin: number | null;
  isTrial: boolean;
  attendance: AttendanceStatus;
  homeworkNotes: string | null;
  student: { id: string; name: string };
}

interface ScheduleTableProps {
  lessons: LessonRow[];
  onAttendanceChange: (lessonId: string, attendance: AttendanceStatus) => void;
}

export function ScheduleTable({ lessons, onAttendanceChange }: ScheduleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">Time</th>
            <th className="pb-3 pr-4 font-medium">Student</th>
            <th className="pb-3 pr-4 font-medium">Duration</th>
            <th className="pb-3 pr-4 font-medium">Type</th>
            <th className="pb-3 font-medium">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{lesson.startTime}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/lessons/${lesson.id}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {lesson.student.name}
                </Link>
              </td>
              <td className="py-3 pr-4">
                {lesson.durationMin ? `${lesson.durationMin} min` : "—"}
              </td>
              <td className="py-3 pr-4">
                {lesson.isTrial && (
                  <Badge variant="warning">Trial</Badge>
                )}
              </td>
              <td className="py-3">
                <AttendanceToggle
                  value={lesson.attendance}
                  onChange={(attendance) =>
                    onAttendanceChange(lesson.id, attendance)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
