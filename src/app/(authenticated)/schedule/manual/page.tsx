"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Pencil, Trash2, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SavedLesson {
  id: string;
  startTime: string;
  studentName: string;
  durationMin: number | null;
  isTrial: boolean;
}

export default function ScheduleManualEntryPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Schedule header state
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("Cem Yigman");
  const [classroom, setClassroom] = useState("");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [headerSaved, setHeaderSaved] = useState(false);

  // New row state
  const [newTime, setNewTime] = useState("");
  const [newStudent, setNewStudent] = useState("");
  const [newDuration, setNewDuration] = useState<string>("");
  const [newTrial, setNewTrial] = useState(false);

  // Saved lessons
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editStudent, setEditStudent] = useState("");
  const [editDuration, setEditDuration] = useState<string>("");
  const [editTrial, setEditTrial] = useState(false);

  const importMutation = trpc.schedule.import.useMutation({
    onSuccess: (data) => {
      if (data) {
        setScheduleId(data.id);
        setHeaderSaved(true);
        // Map returned lessons to our SavedLesson format
        const lessons = data.lessons.map((l) => ({
          id: l.id,
          startTime: l.startTime,
          studentName: l.student.name,
          durationMin: l.durationMin,
          isTrial: l.isTrial,
        }));
        setSavedLessons(lessons);
      }
    },
  });

  const addLessonMutation = trpc.schedule.addLesson.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSavedLessons((prev) => [
          ...prev,
          {
            id: data.id,
            startTime: data.startTime,
            studentName: data.student.name,
            durationMin: data.durationMin,
            isTrial: data.isTrial,
          },
        ]);
        setNewTime("");
        setNewStudent("");
        setNewDuration("");
        setNewTrial(false);
      }
    },
  });

  const updateLessonMutation = trpc.schedule.updateLesson.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSavedLessons((prev) =>
          prev.map((l) =>
            l.id === data.id
              ? {
                  id: data.id,
                  startTime: data.startTime,
                  studentName: data.student.name,
                  durationMin: data.durationMin,
                  isTrial: data.isTrial,
                }
              : l,
          ),
        );
        setEditingId(null);
      }
    },
  });

  const deleteLessonMutation = trpc.schedule.deleteLesson.useMutation({
    onSuccess: (_data, variables) => {
      setSavedLessons((prev) => prev.filter((l) => l.id !== variables.id));
    },
  });

  const handleCreateSchedule = () => {
    if (!date || !teacherName || !classroom) return;
    importMutation.mutate({
      date: new Date(date),
      teacherName,
      classroom,
      lessons: [],
    });
  };

  const handleAddLesson = () => {
    if (!scheduleId || !newTime || !newStudent) return;
    addLessonMutation.mutate({
      scheduleId,
      startTime: newTime,
      studentName: newStudent,
      durationMin: newDuration ? parseInt(newDuration) : undefined,
      isTrial: newTrial,
    });
  };

  const startEditing = (lesson: SavedLesson) => {
    setEditingId(lesson.id);
    setEditTime(lesson.startTime);
    setEditStudent(lesson.studentName);
    setEditDuration(lesson.durationMin?.toString() ?? "");
    setEditTrial(lesson.isTrial);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editTime || !editStudent) return;
    updateLessonMutation.mutate({
      id: editingId,
      startTime: editTime,
      studentName: editStudent,
      durationMin: editDuration ? parseInt(editDuration) : undefined,
      isTrial: editTrial,
    });
  };

  const handleDeleteLesson = (id: string) => {
    deleteLessonMutation.mutate({ id });
  };

  return (
    <div>
      <PageHeader
        title="Manual Schedule Entry"
        description="Create a schedule and add lessons one by one"
      />

      {/* Schedule Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="date">Lesson Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={headerSaved}
              />
            </div>
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <Input
                id="teacher"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                disabled={headerSaved}
              />
            </div>
            <div>
              <Label htmlFor="classroom">Classroom</Label>
              <Input
                id="classroom"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="e.g. Room 3"
                disabled={headerSaved}
              />
            </div>
          </div>
          {!headerSaved && (
            <Button
              onClick={handleCreateSchedule}
              disabled={importMutation.isPending || !date || !teacherName || !classroom}
            >
              <Save className="mr-2 h-4 w-4" />
              {importMutation.isPending ? "Saving..." : "Create Schedule"}
            </Button>
          )}
          {headerSaved && (
            <Badge variant="success">Schedule created</Badge>
          )}
        </CardContent>
      </Card>

      {/* Lessons Section — only after schedule is created */}
      {headerSaved && (
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Saved lessons */}
            {savedLessons.map((lesson) =>
              editingId === lesson.id ? (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 rounded-md border border-brand-300 bg-brand-50 p-3"
                >
                  <Input
                    placeholder="HH:mm"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-20"
                  />
                  <Input
                    placeholder="Student name"
                    value={editStudent}
                    onChange={(e) => setEditStudent(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="h-10 rounded-md border border-gray-300 px-2 text-sm"
                  >
                    <option value="">Duration</option>
                    <option value="25">25 min</option>
                    <option value="45">45 min</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={editTrial}
                      onChange={(e) => setEditTrial(e.target.checked)}
                    />
                    Trial
                  </label>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateLessonMutation.isPending}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 rounded-md border bg-gray-50 p-3"
                >
                  <span className="font-mono text-sm">{lesson.startTime}</span>
                  <span className="flex-1 text-sm font-medium">{lesson.studentName}</span>
                  {lesson.durationMin && (
                    <Badge variant="secondary">{lesson.durationMin} min</Badge>
                  )}
                  {lesson.isTrial && <Badge variant="warning">Trial</Badge>}
                  <button
                    onClick={() => startEditing(lesson)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            )}

            {/* New lesson row */}
            <div className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 p-3">
              <Input
                placeholder="HH:mm"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-20"
              />
              <Input
                placeholder="Student name"
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                className="flex-1"
              />
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="h-10 rounded-md border border-gray-300 px-2 text-sm"
              >
                <option value="">Duration</option>
                <option value="25">25 min</option>
                <option value="45">45 min</option>
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={newTrial}
                  onChange={(e) => setNewTrial(e.target.checked)}
                />
                Trial
              </label>
              <Button
                size="sm"
                onClick={handleAddLesson}
                disabled={addLessonMutation.isPending || !newTime || !newStudent}
              >
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>

            {/* Done button */}
            {savedLessons.length > 0 && (
              <div className="pt-4">
                <Button onClick={() => router.push(`/schedule/${scheduleId}`)}>
                  <Check className="mr-2 h-4 w-4" />
                  Done — View Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
