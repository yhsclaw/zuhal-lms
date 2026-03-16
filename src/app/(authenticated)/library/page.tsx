"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { PdfUploader } from "@/components/library/PdfUploader";
import { PdfGrid } from "@/components/library/PdfGrid";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();
  const { data: pdfs, isLoading } = trpc.library.list.useQuery({
    search: search || undefined,
  });

  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => utils.library.list.invalidate(),
  });

  const handleUpload = async (title: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const res = await fetch("/api/upload/pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    utils.library.list.invalidate();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this PDF?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div>
      <PageHeader
        title="PDF Library"
        description="Upload and manage exercise PDFs"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search PDFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : (
            <PdfGrid pdfs={pdfs ?? []} onDelete={handleDelete} />
          )}
        </div>

        <div>
          <PdfUploader onUpload={handleUpload} />
        </div>
      </div>
    </div>
  );
}
