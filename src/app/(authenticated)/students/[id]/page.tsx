"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { StudentCard } from "@/components/student/StudentCard";
import { ProgressTimeline } from "@/components/student/ProgressTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: student, isLoading } = trpc.student.getById.useQuery({ id: params.id });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center text-gray-500">Student not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title={student.name}
        description={`${student.lessons.length} total lessons`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/students">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <StudentCard student={student} />

          <Card>
            <CardHeader>
              <CardTitle>Lesson History</CardTitle>
            </CardHeader>
            <CardContent>
              {student.lessons.length === 0 ? (
                <p className="text-sm text-gray-500">No lessons yet.</p>
              ) : (
                <div className="space-y-2">
                  {student.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/lessons/${lesson.id}`}
                      className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{formatDate(lesson.schedule.date)}</p>
                        <p className="text-xs text-gray-500">
                          {lesson.chapters.map((c) => c.chapter.title).join(", ") || "No chapters recorded"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          lesson.attendance === "PRESENT"
                            ? "success"
                            : lesson.attendance === "ABSENT"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {lesson.attendance.toLowerCase()}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ProgressTimeline studentId={params.id} />
      </div>
    </div>
  );
}
