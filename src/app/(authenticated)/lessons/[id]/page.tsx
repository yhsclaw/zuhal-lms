"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { LessonForm } from "@/components/lesson/LessonForm";
import { PdfAttacher } from "@/components/lesson/PdfAttacher";
import { PracticesDone } from "@/components/lesson/PracticesDone";
import { AttendanceToggle } from "@/components/schedule/AttendanceToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: lesson, isLoading } = trpc.lesson.getById.useQuery({ id: params.id });
  const utils = trpc.useUtils();

  const setAttendance = trpc.lesson.setAttendance.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: params.id }),
  });

  const setDuration = trpc.lesson.setDuration.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: params.id }),
  });

  const toggleTrial = trpc.lesson.toggleTrial.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: params.id }),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center text-gray-500">Lesson not found.</div>;
  }

  const isAbsent = lesson.attendance === "ABSENT";

  return (
    <div>
      <PageHeader
        title={`Lesson — ${lesson.student.name}`}
        description={`${formatDate(lesson.schedule.date)} at ${lesson.startTime}`}
        actions={
          <Link
            href={`/schedule/${lesson.scheduleId}`}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>
        }
      />

      {/* Absent Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAbsent}
            onChange={() =>
              setAttendance.mutate({
                id: lesson.id,
                attendance: isAbsent ? "PENDING" : "ABSENT",
              })
            }
            className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark as Absent</span>
          {isAbsent && (
            <Badge variant="destructive">Absent</Badge>
          )}
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Student</p>
                  <Link
                    href={`/students/${lesson.studentId}`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    {lesson.student.name}
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Time</p>
                  <p className="text-sm font-mono">{lesson.startTime}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Duration</p>
                  <div className="flex gap-1">
                    {[15, 25, 45].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration.mutate({ id: lesson.id, durationMin: d })}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          lesson.durationMin === d
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Trial</p>
                  <button
                    onClick={() => toggleTrial.mutate({ id: lesson.id })}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      lesson.isTrial
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {lesson.isTrial ? "Trial" : "Regular"}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Attendance</p>
                <AttendanceToggle
                  value={lesson.attendance as AttendanceStatus}
                  onChange={(attendance) =>
                    setAttendance.mutate({ id: lesson.id, attendance })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Practices Done This Lesson — hidden when absent */}
          {isAbsent ? (
            <Card className="opacity-50">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">
                  No practices to log — student was absent.
                </p>
              </CardContent>
            </Card>
          ) : (
            <PracticesDone
              lessonId={lesson.id}
              currentChapters={lesson.chapters}
              practiceNotes={(lesson as unknown as { practiceNotes: string | null }).practiceNotes}
            />
          )}

          {!isAbsent && (
            <LessonForm
              lessonId={lesson.id}
              currentChapters={lesson.chapters}
              homeworkNotes={lesson.homeworkNotes}
            />
          )}
        </div>

        <div>
          <PdfAttacher lessonId={lesson.id} currentPdfs={lesson.pdfs} />
        </div>
      </div>
    </div>
  );
}
