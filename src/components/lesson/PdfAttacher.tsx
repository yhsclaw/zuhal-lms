"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, FileText, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PdfAttacherProps {
  lessonId: string;
  currentPdfs: { pdfId: string; pdf: { id: string; title: string; fileName: string } }[];
}

export function PdfAttacher({ lessonId, currentPdfs }: PdfAttacherProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentPdfs.map((p) => p.pdfId),
  );

  const { data: allPdfs } = trpc.library.list.useQuery({ search: search || undefined });
  const utils = trpc.useUtils();

  const attachMutation = trpc.lesson.attachPdfs.useMutation({
    onSuccess: () => utils.lesson.getById.invalidate({ id: lessonId }),
  });

  const togglePdf = (pdfId: string) => {
    setSelectedIds((prev) =>
      prev.includes(pdfId) ? prev.filter((id) => id !== pdfId) : [...prev, pdfId],
    );
  };

  const handleSave = () => {
    attachMutation.mutate({ id: lessonId, pdfIds: selectedIds });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attached PDFs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const pdf =
                  currentPdfs.find((p) => p.pdfId === id)?.pdf ??
                  allPdfs?.find((p) => p.id === id);
                return (
                  <Badge key={id} variant="default" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {pdf?.title ?? id}
                    <button onClick={() => togglePdf(id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          <Input
            placeholder="Search PDFs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-48 overflow-y-auto rounded border">
            {allPdfs?.map((pdf) => (
              <button
                key={pdf.id}
                onClick={() => togglePdf(pdf.id)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  selectedIds.includes(pdf.id) ? "bg-brand-50" : ""
                }`}
              >
                <FileText className="h-4 w-4 text-gray-400" />
                <span>{pdf.title}</span>
                {selectedIds.includes(pdf.id) && (
                  <Badge variant="success" className="ml-auto">
                    Selected
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <Button onClick={handleSave} disabled={attachMutation.isPending} size="sm">
            <Save className="mr-1 h-4 w-4" />
            Save Attachments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
