"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, Pencil, Check, X, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LessonRow {
  time: string;
  student: string;
  duration: string;
  isTrial: boolean;
}

interface SavedLesson {
  id: string;
  startTime: string;
  studentName: string;
  durationMin: number | null;
  isTrial: boolean;
}

export default function ScheduleManualEntryPage() {
  const router = useRouter();

  const [teacherName, setTeacherName] = useState("Cem Yigman");
  const [classroom, setClassroom] = useState("");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [rows, setRows] = useState<LessonRow[]>([
    { time: "", student: "", duration: "", isTrial: false },
  ]);

  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<LessonRow>({ time: "", student: "", duration: "", isTrial: false });

  const importMutation = trpc.schedule.import.useMutation();
  const addLessonMutation = trpc.schedule.addLesson.useMutation();
  const updateLessonMutation = trpc.schedule.updateLesson.useMutation();
  const deleteLessonMutation = trpc.schedule.deleteLesson.useMutation();

  const updateRow = (index: number, field: keyof LessonRow, value: string | boolean) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { time: "", student: "", duration: "", isTrial: false }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const saveRow = async (index: number) => {
    const row = rows[index];
    if (!row.time || !row.student || !date || !teacherName || !classroom) return;

    let currentScheduleId = scheduleId;

    // Create schedule if not yet created
    if (!currentScheduleId) {
      const result = await importMutation.mutateAsync({
        date: new Date(date),
        teacherName,
        classroom,
        lessons: [],
      });
      if (result) {
        currentScheduleId = result.id;
        setScheduleId(result.id);
      }
    }

    if (!currentScheduleId) return;

    const lesson = await addLessonMutation.mutateAsync({
      scheduleId: currentScheduleId,
      startTime: row.time,
      studentName: row.student,
      durationMin: row.duration ? parseInt(row.duration) : undefined,
      isTrial: row.isTrial,
    });

    if (lesson) {
      setSavedLessons((prev) => [
        ...prev,
        {
          id: lesson.id,
          startTime: lesson.startTime,
          studentName: lesson.student.name,
          durationMin: lesson.durationMin,
          isTrial: lesson.isTrial,
        },
      ]);
      // Clear the saved row
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const startEdit = (lesson: SavedLesson) => {
    setEditingId(lesson.id);
    setEditRow({
      time: lesson.startTime,
      student: lesson.studentName,
      duration: lesson.durationMin?.toString() ?? "",
      isTrial: lesson.isTrial,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const updated = await updateLessonMutation.mutateAsync({
      id: editingId,
      startTime: editRow.time,
      studentName: editRow.student,
      durationMin: editRow.duration ? parseInt(editRow.duration) : undefined,
      isTrial: editRow.isTrial,
    });
    if (updated) {
      setSavedLessons((prev) =>
        prev.map((l) =>
          l.id === updated.id
            ? { id: updated.id, startTime: updated.startTime, studentName: updated.student.name, durationMin: updated.durationMin, isTrial: updated.isTrial }
            : l,
        ),
      );
      setEditingId(null);
    }
  };

  const deleteLesson = async (id: string) => {
    await deleteLessonMutation.mutateAsync({ id });
    setSavedLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const canSaveRow = (row: LessonRow) => row.time.length > 0 && row.student.length > 0 && classroom.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual Schedule Entry"
        description="Fill in the schedule details and add lessons below"
      />

      {/* Schedule Details */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="date">Lesson Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!!scheduleId}
              />
            </div>
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <Input
                id="teacher"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                disabled={!!scheduleId}
              />
            </div>
            <div>
              <Label htmlFor="classroom">Classroom</Label>
              <Input
                id="classroom"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="e.g. Bowie"
                disabled={!!scheduleId}
              />
            </div>
          </div>
          {!classroom && (
            <p className="mt-2 text-sm text-amber-600">⚠ Please enter classroom name before saving lessons.</p>
          )}
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">

          {/* Saved lessons */}
          {savedLessons.map((lesson) =>
            editingId === lesson.id ? (
              <div key={lesson.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 p-3">
                <Input
                  placeholder="HH:mm"
                  value={editRow.time}
                  onChange={(e) => setEditRow((r) => ({ ...r, time: e.target.value }))}
                  className="w-24"
                />
                <Input
                  placeholder="Student name"
                  value={editRow.student}
                  onChange={(e) => setEditRow((r) => ({ ...r, student: e.target.value }))}
                  className="min-w-0 flex-1"
                />
                <select
                  value={editRow.duration}
                  onChange={(e) => setEditRow((r) => ({ ...r, duration: e.target.value }))}
                  className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                >
                  <option value="">Duration</option>
                  <option value="25">25 min</option>
                  <option value="45">45 min</option>
                </select>
                <label className="flex cursor-pointer items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={editRow.isTrial}
                    onChange={(e) => setEditRow((r) => ({ ...r, isTrial: e.target.checked }))}
                  />
                  Trial
                </label>
                <Button size="sm" onClick={saveEdit} disabled={updateLessonMutation.isPending}>
                  <Check className="mr-1 h-3 w-3" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div key={lesson.id} className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
                <span className="w-14 font-mono text-sm font-medium text-gray-700">{lesson.startTime}</span>
                <span className="flex-1 text-sm">{lesson.studentName}</span>
                {lesson.durationMin && (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{lesson.durationMin} min</span>
                )}
                {lesson.isTrial && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Trial</span>
                )}
                <button onClick={() => startEdit(lesson)} className="text-gray-400 hover:text-gray-700">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteLesson(lesson.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          )}

          {/* New lesson rows */}
          {rows.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3">
              <Input
                placeholder="HH:mm"
                value={row.time}
                onChange={(e) => updateRow(index, "time", e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="Student name"
                value={row.student}
                onChange={(e) => updateRow(index, "student", e.target.value)}
                className="min-w-0 flex-1"
              />
              <select
                value={row.duration}
                onChange={(e) => updateRow(index, "duration", e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
              >
                <option value="">Duration</option>
                <option value="25">25 min</option>
                <option value="45">45 min</option>
              </select>
              <label className="flex cursor-pointer items-center gap-1 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={row.isTrial}
                  onChange={(e) => updateRow(index, "isTrial", e.target.checked)}
                />
                Trial
              </label>
              <Button
                size="sm"
                onClick={() => saveRow(index)}
                disabled={!canSaveRow(row) || addLessonMutation.isPending || importMutation.isPending}
              >
                <Save className="mr-1 h-3 w-3" /> Save
              </Button>
              {rows.length > 1 && (
                <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add row + Done */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 h-4 w-4" /> Add Row
            </Button>
            {savedLessons.length > 0 && scheduleId && (
              <Button onClick={() => router.push(`/schedule/${scheduleId}`)}>
                <Check className="mr-2 h-4 w-4" /> Done — View Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
