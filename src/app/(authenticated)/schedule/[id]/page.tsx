"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AttendanceToggle } from "@/components/schedule/AttendanceToggle";
import { Trash2, ArrowLeft, Pencil, Check, X, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

interface EditState {
  id: string;
  time: string;
  student: string;
  duration: string;
  isTrial: boolean;
}

function formatTime(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? digits.slice(0, 2) + ":" + digits.slice(2) : digits;
}

export default function ScheduleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: schedule, isLoading } = trpc.schedule.getById.useQuery({ id: params.id });
  const utils = trpc.useUtils();

  const [editState, setEditState] = useState<EditState | null>(null);
  const [newLesson, setNewLesson] = useState({ time: "", student: "", duration: "", isTrial: false });

  const invalidate = () => utils.schedule.getById.invalidate({ id: params.id });

  const setAttendance = trpc.lesson.setAttendance.useMutation({ onSuccess: invalidate });
  const deleteSchedule = trpc.schedule.delete.useMutation({ onSuccess: () => router.push("/schedule") });
  const deleteLesson = trpc.schedule.deleteLesson.useMutation({ onSuccess: invalidate });
  const updateLesson = trpc.schedule.updateLesson.useMutation({ onSuccess: () => { setEditState(null); invalidate(); } });
  const addLesson = trpc.schedule.addLesson.useMutation({ onSuccess: () => { setNewLesson({ time: "", student: "", duration: "", isTrial: false }); invalidate(); } });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" /></div>;
  }

  if (!schedule) return <div className="text-center text-gray-500">Schedule not found.</div>;

  const handleSaveEdit = () => {
    if (!editState) return;
    updateLesson.mutate({
      id: editState.id,
      startTime: editState.time,
      studentName: editState.student,
      durationMin: editState.duration ? parseInt(editState.duration) : undefined,
      isTrial: editState.isTrial,
    });
  };

  const handleAddLesson = () => {
    if (!newLesson.time || !newLesson.student) return;
    addLesson.mutate({
      scheduleId: params.id,
      startTime: newLesson.time,
      studentName: newLesson.student,
      durationMin: newLesson.duration ? parseInt(newLesson.duration) : undefined,
      isTrial: newLesson.isTrial,
    });
  };

  return (
    <div>
      <PageHeader
        title={formatDate(schedule.date)}
        description={`${schedule.teacherName} — ${schedule.classroom}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/schedule"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
            </Button>
            <Button variant="destructive" onClick={() => { if (confirm("Bu schedule'ı silmek istediğine emin misin?")) deleteSchedule.mutate({ id: params.id }); }}>
              <Trash2 className="mr-1 h-4 w-4" />Delete
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lessons ({schedule.lessons.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Existing lessons */}
          {schedule.lessons.map((lesson) =>
            editState?.id === lesson.id ? (
              <div key={lesson.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 p-3">
                <Input
                  placeholder="12:34"
                  value={editState.time}
                  onChange={(e) => setEditState(s => s && { ...s, time: formatTime(e.target.value) })}
                  className="h-9 w-20 font-mono text-sm"
                  maxLength={5}
                />
                <Input
                  placeholder="Student name"
                  value={editState.student}
                  onChange={(e) => setEditState(s => s && { ...s, student: e.target.value })}
                  className="h-9 min-w-0 flex-1"
                />
                <select
                  value={editState.duration}
                  onChange={(e) => setEditState(s => s && { ...s, duration: e.target.value })}
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
                >
                  <option value="">No duration</option>
                  <option value="25">25 min</option>
                  <option value="45">45 min</option>
                </select>
                <label className="flex cursor-pointer items-center gap-1 text-sm text-gray-600">
                  <input type="checkbox" checked={editState.isTrial} onChange={(e) => setEditState(s => s && { ...s, isTrial: e.target.checked })} />
                  Trial
                </label>
                <Button size="sm" onClick={handleSaveEdit} disabled={updateLesson.isPending}>
                  <Check className="mr-1 h-3 w-3" />Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditState(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div key={lesson.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-gray-50 p-3">
                <span className="w-14 font-mono text-sm font-medium">{lesson.startTime}</span>
                <Link href={`/lessons/${lesson.id}`} className="flex-1 text-sm font-medium text-brand-600 hover:underline">
                  {lesson.student.name}
                </Link>
                {lesson.durationMin && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">{lesson.durationMin} min</span>}
                {lesson.isTrial && <Badge variant="warning">Trial</Badge>}
                <AttendanceToggle
                  value={lesson.attendance as AttendanceStatus}
                  onChange={(att) => setAttendance.mutate({ id: lesson.id, attendance: att })}
                />
                <button onClick={() => setEditState({ id: lesson.id, time: lesson.startTime, student: lesson.student.name, duration: lesson.durationMin?.toString() ?? "", isTrial: lesson.isTrial })} className="rounded p-1 text-gray-400 hover:text-gray-700">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm(`${lesson.student.name} dersini sil?`)) deleteLesson.mutate({ id: lesson.id }); }} className="rounded p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          )}

          {/* Add new lesson row */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3">
            <Input
              placeholder="12:34"
              value={newLesson.time}
              onChange={(e) => setNewLesson(r => ({ ...r, time: formatTime(e.target.value) }))}
              className="h-9 w-20 font-mono text-sm"
              maxLength={5}
            />
            <Input
              placeholder="Student name"
              value={newLesson.student}
              onChange={(e) => setNewLesson(r => ({ ...r, student: e.target.value }))}
              className="h-9 min-w-0 flex-1"
            />
            <select
              value={newLesson.duration}
              onChange={(e) => setNewLesson(r => ({ ...r, duration: e.target.value }))}
              className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
            >
              <option value="">No duration</option>
              <option value="25">25 min</option>
              <option value="45">45 min</option>
            </select>
            <label className="flex cursor-pointer items-center gap-1 text-sm text-gray-600">
              <input type="checkbox" checked={newLesson.isTrial} onChange={(e) => setNewLesson(r => ({ ...r, isTrial: e.target.checked }))} />
              Trial
            </label>
            <Button
              size="sm"
              onClick={handleAddLesson}
              disabled={!newLesson.time || !newLesson.student || addLesson.isPending}
              className="ml-auto"
            >
              <Plus className="mr-1 h-3 w-3" />Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
