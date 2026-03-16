"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Check } from "lucide-react";
import type { ParsedLessonEntry } from "@/types";

interface OcrPreviewProps {
  teacherName: string;
  classroom: string;
  lessons: ParsedLessonEntry[];
  date: string;
  onTeacherNameChange: (name: string) => void;
  onClassroomChange: (classroom: string) => void;
  onDateChange: (date: string) => void;
  onLessonsChange: (lessons: ParsedLessonEntry[]) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function OcrPreview({
  teacherName,
  classroom,
  lessons,
  date,
  onTeacherNameChange,
  onClassroomChange,
  onDateChange,
  onLessonsChange,
  onConfirm,
  isSubmitting,
}: OcrPreviewProps) {
  const updateLesson = (index: number, field: keyof ParsedLessonEntry, value: string | number | boolean) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    onLessonsChange(updated);
  };

  const removeLesson = (index: number) => {
    onLessonsChange(lessons.filter((_, i) => i !== index));
  };

  const addLesson = () => {
    onLessonsChange([
      ...lessons,
      { startTime: "", studentName: "", isTrial: false },
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Edit Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="date">Lesson Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="teacher">Teacher</Label>
            <Input
              id="teacher"
              value={teacherName}
              onChange={(e) => onTeacherNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="classroom">Classroom</Label>
            <Input
              id="classroom"
              value={classroom}
              onChange={(e) => onClassroomChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Lessons</Label>
            <Button variant="outline" size="sm" onClick={addLesson}>
              <Plus className="mr-1 h-4 w-4" />
              Add Lesson
            </Button>
          </div>

          {lessons.map((lesson, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md border bg-gray-50 p-3"
            >
              <Input
                placeholder="HH:mm"
                value={lesson.startTime}
                onChange={(e) => updateLesson(index, "startTime", e.target.value)}
                className="w-20"
              />
              <Input
                placeholder="Student name"
                value={lesson.studentName}
                onChange={(e) => updateLesson(index, "studentName", e.target.value)}
                className="flex-1"
              />
              <select
                value={lesson.durationMin ?? ""}
                onChange={(e) =>
                  updateLesson(
                    index,
                    "durationMin",
                    e.target.value ? parseInt(e.target.value) : undefined as unknown as number,
                  )
                }
                className="h-10 rounded-md border border-gray-300 px-2 text-sm"
              >
                <option value="">Duration</option>
                <option value="25">25 min</option>
                <option value="45">45 min</option>
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={lesson.isTrial}
                  onChange={(e) => updateLesson(index, "isTrial", e.target.checked)}
                />
                Trial
              </label>
              <button
                onClick={() => removeLesson(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button onClick={onConfirm} disabled={isSubmitting} className="w-full">
          <Check className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Confirm & Save Schedule"}
        </Button>
      </CardContent>
    </Card>
  );
}
