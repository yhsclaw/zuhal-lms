"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScheduleUploader } from "@/components/schedule/ScheduleUploader";
import { OcrPreview } from "@/components/schedule/OcrPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { parseOcrText } from "@/server/services/ocr";
import type { ParsedLessonEntry } from "@/types";
import { Loader2 } from "lucide-react";

export default function ScheduleImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [teacherName, setTeacherName] = useState("Cem Yigman");
  const [classroom, setClassroom] = useState("");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [lessons, setLessons] = useState<ParsedLessonEntry[]>([]);

  const importMutation = trpc.schedule.import.useMutation({
    onSuccess: (data) => {
      if (data) {
        router.push(`/schedule/${data.id}`);
      }
    },
  });

  const handleImageSelected = useCallback(async (file: File) => {
    setImageFile(file);
    setStep("processing");

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("tur+eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();

      setRawText(data.text);
      const parsed = parseOcrText(data.text);
      setTeacherName(parsed.teacherName || "Cem Yigman");
      setClassroom(parsed.classroom);
      setLessons(parsed.lessons);
      setStep("review");
    } catch {
      setRawText("");
      setLessons([]);
      setStep("review");
    }
  }, []);

  const handleConfirm = () => {
    importMutation.mutate({
      date: new Date(date),
      teacherName,
      classroom,
      rawOcrText: rawText || undefined,
      lessons: lessons
        .filter((l) => l.studentName && l.startTime)
        .map((l) => ({
          studentName: l.studentName,
          startTime: l.startTime,
          durationMin: l.durationMin,
          isTrial: l.isTrial,
        })),
    });
  };

  const handleManualEntry = () => {
    setStep("review");
  };

  return (
    <div>
      <PageHeader
        title="Import Schedule"
        description="Upload a schedule photo or enter manually"
      />

      {step === "upload" && (
        <div className="space-y-4">
          <ScheduleUploader onImageSelected={handleImageSelected} />
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-500">or</p>
            <Button variant="outline" onClick={handleManualEntry}>
              Enter Manually
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-brand-600" />
            <p className="text-sm text-gray-500">Processing image with OCR...</p>
            <p className="text-xs text-gray-400">This may take a moment</p>
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <div className="space-y-4">
          {rawText && (
            <Card>
              <CardHeader>
                <CardTitle>Raw OCR Text</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-600">
                  {rawText}
                </pre>
              </CardContent>
            </Card>
          )}

          <OcrPreview
            teacherName={teacherName}
            classroom={classroom}
            lessons={lessons}
            date={date}
            onTeacherNameChange={setTeacherName}
            onClassroomChange={setClassroom}
            onDateChange={setDate}
            onLessonsChange={setLessons}
            onConfirm={handleConfirm}
            isSubmitting={importMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
