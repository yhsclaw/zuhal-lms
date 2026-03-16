"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Circle } from "lucide-react";

interface ProgressTimelineProps {
  studentId: string;
}

export function ProgressTimeline({ studentId }: ProgressTimelineProps) {
  const { data, isLoading } = trpc.chapter.getProgress.useQuery({ studentId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>D52 Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-gray-200" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const coveredCount = data.chapters.filter((ch) => ch.covered).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          D52 Progress
          <Badge variant="default">
            {coveredCount} / 52 chapters
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {data.chapters.map((chapter) => (
            <div
              key={chapter.number}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              {chapter.covered ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300" />
              )}
              <span className="font-mono text-xs text-gray-400">
                {String(chapter.number).padStart(2, "0")}
              </span>
              <span className={chapter.covered ? "text-gray-900" : "text-gray-400"}>
                {chapter.title}
              </span>
              {chapter.lessonCount > 1 && (
                <Badge variant="secondary" className="ml-auto">
                  {chapter.lessonCount}x
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
