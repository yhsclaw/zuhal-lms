"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";
import Link from "next/link";

export default function ScheduleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: schedule, isLoading } = trpc.schedule.getById.useQuery({ id: params.id });
  const utils = trpc.useUtils();

  const setAttendance = trpc.lesson.setAttendance.useMutation({
    onSuccess: () => {
      utils.schedule.getById.invalidate({ id: params.id });
    },
  });

  const deleteSchedule = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      router.push("/schedule");
    },
  });

  const deleteLesson = trpc.schedule.deleteLesson.useMutation({
    onSuccess: () => {
      utils.schedule.getById.invalidate({ id: params.id });
    },
  });

  const handleAttendanceChange = (lessonId: string, attendance: AttendanceStatus) => {
    setAttendance.mutate({ id: lessonId, attendance });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this schedule and all its lessons?")) {
      deleteSchedule.mutate({ id: params.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center text-gray-500">Schedule not found.</div>
    );
  }

  return (
    <div>
      <PageHeader
        title={formatDate(schedule.date)}
        description={`${schedule.teacherName} — ${schedule.classroom}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/schedule">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Lessons ({schedule.lessons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleTable
            lessons={schedule.lessons}
            onAttendanceChange={handleAttendanceChange}
            onDeleteLesson={(lessonId) => deleteLesson.mutate({ id: lessonId })}
          />
        </CardContent>
      </Card>

      {schedule.photoUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Original Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={`/${schedule.photoUrl}`}
              alt="Schedule photo"
              className="max-h-[500px] rounded-md object-contain"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
