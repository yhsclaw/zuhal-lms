"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LessonFormProps {
  lessonId: string;
  currentChapters: { chapterNumber: number; notes: string | null }[];
  homeworkNotes: string | null;
}

export function LessonForm({ lessonId, currentChapters, homeworkNotes }: LessonFormProps) {
  const [homework, setHomework] = useState(homeworkNotes ?? "");
  const [selectedChapters, setSelectedChapters] = useState<
    { chapterNumber: number; notes?: string }[]
  >(currentChapters.map((c) => ({ chapterNumber: c.chapterNumber, notes: c.notes ?? undefined })));

  const { data: allChapters } = trpc.chapter.list.useQuery();
  const utils = trpc.useUtils();

  const setChaptersMutation = trpc.lesson.setChapters.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: lessonId }),
  });

  const updateHomeworkMutation = trpc.lesson.updateHomework.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: lessonId }),
  });

  const toggleChapter = (chapterNumber: number) => {
    setSelectedChapters((prev) => {
      const exists = prev.find((c) => c.chapterNumber === chapterNumber);
      if (exists) {
        return prev.filter((c) => c.chapterNumber !== chapterNumber);
      }
      return [...prev, { chapterNumber }];
    });
  };

  const handleSaveChapters = () => {
    setChaptersMutation.mutate({ id: lessonId, chapters: selectedChapters });
  };

  const handleSaveHomework = () => {
    updateHomeworkMutation.mutate({ id: lessonId, homeworkNotes: homework });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chapters Covered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {allChapters?.map((chapter) => {
              const isSelected = selectedChapters.some(
                (c) => c.chapterNumber === chapter.number,
              );
              return (
                <button
                  key={chapter.number}
                  onClick={() => toggleChapter(chapter.number)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {chapter.number}. {chapter.title}
                </button>
              );
            })}
          </div>
          <Button
            onClick={handleSaveChapters}
            disabled={setChaptersMutation.isPending}
            size="sm"
          >
            <Save className="mr-1 h-4 w-4" />
            Save Chapters
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homework Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="What was assigned as homework..."
              rows={4}
            />
            <Button
              onClick={handleSaveHomework}
              disabled={updateHomeworkMutation.isPending}
              size="sm"
            >
              <Save className="mr-1 h-4 w-4" />
              Save Homework
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
