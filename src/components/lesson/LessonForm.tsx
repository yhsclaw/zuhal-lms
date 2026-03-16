"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LessonFormProps {
  lessonId: string;
  currentChapters: { chapterNumber: number; notes: string | null }[];
  homeworkNotes: string | null;
}

export function LessonForm({ lessonId, homeworkNotes }: LessonFormProps) {
  const [homework, setHomework] = useState(homeworkNotes ?? "");
  const utils = trpc.useUtils();

  const updateHomeworkMutation = trpc.lesson.updateHomework.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: lessonId }),
  });

  const handleSaveHomework = () => {
    updateHomeworkMutation.mutate({ id: lessonId, homeworkNotes: homework });
  };

  return (
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
  );
}
