"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PracticesDoneProps {
  lessonId: string;
  currentChapters: { chapterNumber: number; notes: string | null }[];
  practiceNotes: string | null;
}

export function PracticesDone({ lessonId, currentChapters, practiceNotes }: PracticesDoneProps) {
  const [notes, setNotes] = useState(practiceNotes ?? "");
  const [selectedChapters, setSelectedChapters] = useState<
    { chapterNumber: number; notes?: string }[]
  >(currentChapters.map((c) => ({ chapterNumber: c.chapterNumber, notes: c.notes ?? undefined })));

  const { data: allChapters } = trpc.chapter.list.useQuery();
  const utils = trpc.useUtils();

  const updatePracticeNotes = trpc.lesson.updatePracticeNotes.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: lessonId }),
  });

  const setChaptersMutation = trpc.lesson.setChapters.useMutation({
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

  const handleSavePractices = () => {
    updatePracticeNotes.mutate({ id: lessonId, practiceNotes: notes });
    setChaptersMutation.mutate({ id: lessonId, chapters: selectedChapters });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practices Done This Lesson</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>D52 Chapters Practiced</Label>
          <div className="mt-2 flex flex-wrap gap-2">
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
        </div>

        <div>
          <Label htmlFor="practiceNotes">Practice Notes (free text)</Label>
          <Textarea
            id="practiceNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was practiced this lesson..."
            rows={3}
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleSavePractices}
          disabled={updatePracticeNotes.isPending || setChaptersMutation.isPending}
          size="sm"
        >
          <Save className="mr-1 h-4 w-4" />
          Save Practices
        </Button>
      </CardContent>
    </Card>
  );
}
