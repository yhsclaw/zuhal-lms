"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface PdfItem {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  createdAt: Date;
}

interface PdfGridProps {
  pdfs: PdfItem[];
  onDelete: (id: string) => void;
}

export function PdfGrid({ pdfs, onDelete }: PdfGridProps) {
  if (pdfs.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No PDFs yet"
        description="Upload your first exercise PDF to get started."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pdfs.map((pdf) => (
        <Card key={pdf.id} className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-4">
            <div className="mb-3 flex items-start gap-3">
              <FileText className="mt-0.5 h-8 w-8 shrink-0 text-red-500" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-gray-900">{pdf.title}</h3>
                <p className="truncate text-xs text-gray-500">{pdf.fileName}</p>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={`/${pdf.filePath}`} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-1 h-3 w-3" />
                  View
                </a>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(pdf.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
