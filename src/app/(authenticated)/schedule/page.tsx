"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Upload, PenLine, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ScheduleListPage() {
  const { data: schedules, isLoading, refetch } = trpc.schedule.list.useQuery({});
  const deleteMutation = trpc.schedule.delete.useMutation({ onSuccess: () => refetch() });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm("Bu schedule'ı silmek istediğine emin misin?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div>
      <PageHeader
        title="Schedules"
        description="All imported teaching schedules"
        actions={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/schedule/import">
                <Upload className="mr-2 h-4 w-4" />
                Import Schedule
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/schedule/manual">
                <PenLine className="mr-2 h-4 w-4" />
                Manual Entry
              </Link>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : schedules?.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No schedules yet"
          description="Import a schedule photo or use manual entry to get started."
          action={
            <Button asChild>
              <Link href="/schedule/manual">Manual Entry</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {schedules?.map((schedule) => {
            const present = schedule.lessons.filter((l) => l.attendance === "PRESENT").length;
            const absent = schedule.lessons.filter((l) => l.attendance === "ABSENT").length;
            const pending = schedule.lessons.filter((l) => l.attendance === "PENDING").length;

            return (
              <Link key={schedule.id} href={`/schedule/${schedule.id}`}>
                <Card className="transition-colors hover:bg-gray-50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{formatDate(schedule.date)}</p>
                      <p className="text-sm text-gray-500">
                        {schedule.teacherName} — {schedule.classroom} — {schedule.lessons.length} lessons
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {present > 0 && <Badge variant="success">{present} present</Badge>}
                      {absent > 0 && <Badge variant="destructive">{absent} absent</Badge>}
                      {pending > 0 && <Badge variant="secondary">{pending} pending</Badge>}
                      <button
                        onClick={(e) => handleDelete(e, schedule.id)}
                        className="ml-2 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
