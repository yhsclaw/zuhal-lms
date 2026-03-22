"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";

type Difficulty = "BEGINNER" | "ADVANCED";

export default function SongNotationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotation, setEditNotation] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>("BEGINNER");

  const utils = trpc.useUtils();
  const { data: notation, isLoading } = trpc.songNotation.getById.useQuery({
    id: params.id,
  });

  const saveMutation = trpc.songNotation.save.useMutation({
    onSuccess: () => {
      utils.songNotation.getById.invalidate({ id: params.id });
      setEditing(false);
    },
  });

  useEffect(() => {
    if (notation) {
      setEditTitle(notation.title);
      setEditNotation(notation.notation);
      setEditDifficulty(notation.difficulty);
    }
  }, [notation]);

  const handleSave = () => {
    saveMutation.mutate({
      id: params.id,
      title: editTitle,
      notation: editNotation,
      difficulty: editDifficulty,
    });
  };

  const handleCancel = () => {
    if (notation) {
      setEditTitle(notation.title);
      setEditNotation(notation.notation);
      setEditDifficulty(notation.difficulty);
    }
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!notation) {
    return (
      <div className="text-center text-gray-500">Notasyon bulunamadı.</div>
    );
  }

  return (
    <div>
      <PageHeader
        title={editing ? "Notasyonu Düzenle" : notation.title}
        description={
          editing
            ? undefined
            : `Son güncelleme: ${new Date(notation.updatedAt).toLocaleDateString("tr-TR")}`
        }
        actions={
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  İptal
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/song-notation">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Geri
                  </Link>
                </Button>
              </>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {editing ? (
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Şarkı adı"
                  className="flex-1"
                />
                <select
                  value={editDifficulty}
                  onChange={(e) =>
                    setEditDifficulty(e.target.value as Difficulty)
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="BEGINNER">Başlangıç</option>
                  <option value="ADVANCED">İleri</option>
                </select>
              </div>
            ) : (
              <>
                <CardTitle>{notation.title}</CardTitle>
                <Badge
                  variant={
                    notation.difficulty === "BEGINNER"
                      ? "secondary"
                      : "default"
                  }
                >
                  {notation.difficulty === "BEGINNER" ? "Başlangıç" : "İleri"}
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <textarea
              value={editNotation}
              onChange={(e) => setEditNotation(e.target.value)}
              className="h-[500px] w-full rounded-md border border-input bg-gray-50 p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
              spellCheck={false}
            />
          ) : (
            <pre className="overflow-x-auto rounded-md bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-800">
              {notation.notation}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
