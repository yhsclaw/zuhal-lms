"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Generate 5-minute interval time options from 07:00 to 22:00
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === 22 && m > 0) break;
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

interface LessonRow {
  time: string;
  student: string;
  duration: string;
  isTrial: boolean;
}

interface EditState {
  id: string;
  time: string;
  student: string;
  duration: string;
  isTrial: boolean;
}

export default function ScheduleManualEntryPage() {
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [teacherName] = useState("Cem Yigman");
  const [classroom, setClassroom] = useState("");
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  // New lesson form
  const [newLesson, setNewLesson] = useState<LessonRow>({
    time: "",
    student: "",
    duration: "",
    isTrial: false,
  });

  // Student autocomplete
  const [studentSearch, setStudentSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const studentsQuery = trpc.student.list.useQuery(
    { search: studentSearch },
    { enabled: studentSearch.length >= 1 },
  );

  // Fetch schedule for selected date
  const dateObj = useMemo(() => (date ? new Date(date + "T00:00:00") : null), [date]);
  const scheduleQuery = trpc.schedule.getByDate.useQuery(
    { date: dateObj! },
    { enabled: !!dateObj },
  );

  const schedule = scheduleQuery.data;

  // Sync scheduleId when schedule loads
  useEffect(() => {
    if (schedule) {
      setScheduleId(schedule.id);
      setClassroom(schedule.classroom);
    } else {
      setScheduleId(null);
    }
  }, [schedule]);

  const importMutation = trpc.schedule.import.useMutation({
    onSuccess: () => scheduleQuery.refetch(),
  });
  const addLessonMutation = trpc.schedule.addLesson.useMutation({
    onSuccess: () => scheduleQuery.refetch(),
  });
  const updateLessonMutation = trpc.schedule.updateLesson.useMutation({
    onSuccess: () => scheduleQuery.refetch(),
  });
  const deleteLessonMutation = trpc.schedule.deleteLesson.useMutation({
    onSuccess: () => scheduleQuery.refetch(),
  });

  const lessons = schedule?.lessons ?? [];

  const saveNewLesson = async () => {
    if (!newLesson.time || !newLesson.student || !date) return;

    let currentScheduleId = scheduleId;

    // Create schedule if none exists for this date
    if (!currentScheduleId) {
      if (!classroom) return;
      const result = await importMutation.mutateAsync({
        date: new Date(date + "T00:00:00"),
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

    await addLessonMutation.mutateAsync({
      scheduleId: currentScheduleId,
      startTime: newLesson.time,
      studentName: newLesson.student,
      durationMin: newLesson.duration ? parseInt(newLesson.duration) : undefined,
      isTrial: newLesson.isTrial,
    });

    setNewLesson({ time: "", student: "", duration: "", isTrial: false });
    setStudentSearch("");
  };

  const startEdit = (lesson: (typeof lessons)[0]) => {
    setEditState({
      id: lesson.id,
      time: lesson.startTime,
      student: lesson.student.name,
      duration: lesson.durationMin?.toString() ?? "",
      isTrial: lesson.isTrial,
    });
  };

  const saveEdit = async () => {
    if (!editState) return;
    await updateLessonMutation.mutateAsync({
      id: editState.id,
      startTime: editState.time,
      studentName: editState.student,
      durationMin: editState.duration ? parseInt(editState.duration) : undefined,
      isTrial: editState.isTrial,
    });
    setEditState(null);
  };

  const deleteLesson = async (id: string) => {
    await deleteLessonMutation.mutateAsync({ id });
  };

  const canSaveNew = newLesson.time.length > 0 && newLesson.student.length > 0 && (!!scheduleId || classroom.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual Schedule Entry"
        description="Select a date, then view or add lessons"
      />

      {/* Date Picker */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="date" className="mb-2 block text-lg font-semibold">
            Select Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="max-w-xs text-lg"
          />
        </CardContent>
      </Card>

      {/* Schedule Header */}
      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule Info</CardTitle>
          </CardHeader>
          <CardContent>
            {schedule ? (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span><strong>Teacher:</strong> {schedule.teacherName}</span>
                <span><strong>Classroom:</strong> {schedule.classroom}</span>
                <span><strong>Lessons:</strong> {lessons.length}</span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Teacher</Label>
                  <Input value={teacherName} disabled />
                </div>
                <div>
                  <Label htmlFor="classroom">Classroom</Label>
                  <Input
                    id="classroom"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="e.g. Bowie"
                  />
                  {!classroom && (
                    <p className="mt-1 text-xs text-amber-600">
                      Enter classroom name to create a schedule
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Lessons */}
      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lessons {scheduleQuery.isLoading && "(loading...)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lessons.length === 0 && !scheduleQuery.isLoading && (
              <p className="text-sm text-gray-500">No lessons for this date yet.</p>
            )}

            {lessons.map((lesson) =>
              editState?.id === lesson.id ? (
                /* Edit mode */
                <div
                  key={lesson.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 p-3"
                >
                  <select
                    value={editState.time}
                    onChange={(e) => setEditState((s) => s && { ...s, time: e.target.value })}
                    className="h-10 w-24 rounded-md border border-gray-300 bg-white px-2 font-mono text-sm"
                  >
                    <option value="">Time</option>
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Student name"
                    value={editState.student}
                    onChange={(e) => setEditState((s) => s && { ...s, student: e.target.value })}
                    className="min-w-0 flex-1"
                  />
                  <select
                    value={editState.duration}
                    onChange={(e) => setEditState((s) => s && { ...s, duration: e.target.value })}
                    className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                  >
                    <option value="">Duration</option>
                    <option value="25">25 min</option>
                    <option value="45">45 min</option>
                  </select>
                  <label className="flex cursor-pointer items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={editState.isTrial}
                      onChange={(e) => setEditState((s) => s && { ...s, isTrial: e.target.checked })}
                    />
                    Trial
                  </label>
                  <Button size="sm" onClick={saveEdit} disabled={updateLessonMutation.isPending}>
                    <Check className="mr-1 h-3 w-3" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditState(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                /* Display mode */
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3"
                >
                  <span className="w-14 font-mono text-sm font-medium text-gray-700">
                    {lesson.startTime}
                  </span>
                  <span className="flex-1 text-sm">{lesson.student.name}</span>
                  {lesson.durationMin && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      {lesson.durationMin} min
                    </span>
                  )}
                  {lesson.isTrial && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      Trial
                    </span>
                  )}
                  <button onClick={() => startEdit(lesson)} className="text-gray-400 hover:text-gray-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="text-red-400 hover:text-red-600"
                    disabled={deleteLessonMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      )}

      {/* Add New Lesson */}
      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-gray-300 p-3">
              {/* Time */}
              <div>
                <Label className="mb-1 block text-xs">Time</Label>
                <select
                  value={newLesson.time}
                  onChange={(e) => setNewLesson((r) => ({ ...r, time: e.target.value }))}
                  className="h-10 w-24 rounded-md border border-gray-300 bg-white px-2 font-mono text-sm"
                >
                  <option value="">--:--</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Student with autocomplete */}
              <div className="relative min-w-0 flex-1">
                <Label className="mb-1 block text-xs">Student</Label>
                <Input
                  placeholder="Student name"
                  value={newLesson.student}
                  onChange={(e) => {
                    setNewLesson((r) => ({ ...r, student: e.target.value }));
                    setStudentSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && studentsQuery.data && studentsQuery.data.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-white shadow-lg">
                    {studentsQuery.data.map((s) => (
                      <li
                        key={s.id}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                        onMouseDown={() => {
                          setNewLesson((r) => ({ ...r, student: s.name }));
                          setStudentSearch(s.name);
                          setShowSuggestions(false);
                        }}
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Duration */}
              <div>
                <Label className="mb-1 block text-xs">Duration</Label>
                <select
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson((r) => ({ ...r, duration: e.target.value }))}
                  className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
                >
                  <option value="">None</option>
                  <option value="25">25 min</option>
                  <option value="45">45 min</option>
                </select>
              </div>

              {/* Trial */}
              <div className="flex h-10 items-center">
                <label className="flex cursor-pointer items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={newLesson.isTrial}
                    onChange={(e) => setNewLesson((r) => ({ ...r, isTrial: e.target.checked }))}
                  />
                  Trial
                </label>
              </div>

              {/* Save */}
              <Button
                onClick={saveNewLesson}
                disabled={!canSaveNew || addLessonMutation.isPending || importMutation.isPending}
                className="ml-auto"
              >
                {addLessonMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
