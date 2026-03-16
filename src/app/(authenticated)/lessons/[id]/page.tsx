"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { LessonForm } from "@/components/lesson/LessonForm";
import { PdfAttacher } from "@/components/lesson/PdfAttacher";
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

  return (
    <div>
      <PageHeader
        title={`Lesson — ${lesson.student.name}`}
        description={`${formatDate(lesson.schedule.date)} at ${lesson.startTime}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/schedule/${lesson.scheduleId}`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Schedule
            </Link>
          </Button>
        }
      />

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
                    {[25, 45].map((d) => (
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

          <LessonForm
            lessonId={lesson.id}
            currentChapters={lesson.chapters}
            homeworkNotes={lesson.homeworkNotes}
          />
        </div>

        <div>
          <PdfAttacher lessonId={lesson.id} currentPdfs={lesson.pdfs} />
        </div>
      </div>
    </div>
  );
}
