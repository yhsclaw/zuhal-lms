"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { Calendar, Users, BookOpen, Upload } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: schedules } = trpc.schedule.list.useQuery({});
  const { data: students } = trpc.student.list.useQuery({});
  const { data: pdfs } = trpc.library.list.useQuery({});

  const recentSchedules = schedules?.slice(0, 5) ?? [];
  const totalStudents = students?.length ?? 0;
  const totalPdfs = pdfs?.length ?? 0;
  const upcomingLessons =
    recentSchedules.flatMap((s) =>
      s.lessons.filter((l) => l.attendance === "PENDING"),
    ).length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Cem."
        actions={
          <Button asChild>
            <Link href="/schedule/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Schedule
            </Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-brand-100 p-3">
              <Calendar className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Lessons</p>
              <p className="text-2xl font-bold">{upcomingLessons}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">PDF Exercises</p>
              <p className="text-2xl font-bold">{totalPdfs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-orange-100 p-3">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Schedules</p>
              <p className="text-2xl font-bold">{schedules?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSchedules.length === 0 ? (
            <p className="text-sm text-gray-500">
              No schedules imported yet.{" "}
              <Link href="/schedule/import" className="text-brand-600 hover:underline">
                Import your first schedule.
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {recentSchedules.map((schedule) => (
                <Link
                  key={schedule.id}
                  href={`/schedule/${schedule.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{formatDate(schedule.date)}</p>
                    <p className="text-sm text-gray-500">
                      {schedule.classroom} — {schedule.lessons.length} lessons
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {schedule.lessons.filter((l) => l.attendance === "PENDING").length} pending
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
