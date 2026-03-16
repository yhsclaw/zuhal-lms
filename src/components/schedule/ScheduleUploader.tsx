"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ScheduleUploaderProps {
  onImageSelected: (file: File, previewUrl: string) => void;
}

export function ScheduleUploader({ onImageSelected }: ScheduleUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelected(file, url);
    },
    [onImageSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Upload className="mb-4 h-10 w-10 text-gray-400" />
        <p className="mb-2 text-sm text-gray-600">
          Drag and drop a schedule photo here, or
        </p>
        <label>
          <Button variant="outline" size="sm" asChild>
            <span>Browse Files</span>
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </label>
      </div>

      {preview && (
        <div className="overflow-hidden rounded-lg border">
          <img
            src={preview}
            alt="Schedule preview"
            className="max-h-[400px] w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
