"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Globe,
} from "lucide-react";

type Difficulty = "BEGINNER" | "ADVANCED";

export default function SongNotationDetailPage() {
  const params = useParams<{ id: string }>();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotation, setEditNotation] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>("BEGINNER");
  const [svgZoom, setSvgZoom] = useState(100);
  const [textOverlay, setTextOverlay] = useState("");
  const [showOverlayInput, setShowOverlayInput] = useState(false);

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

  const parsedSvgs: string[] = notation?.svgData
    ? (() => {
        try {
          return JSON.parse(notation.svgData);
        } catch {
          return [];
        }
      })()
    : [];

  const hasSvg = parsedSvgs.length > 0;

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
                <CardTitle className="flex items-center gap-2">
                  {hasSvg && <Globe className="h-5 w-5 text-blue-600" />}
                  {notation.title}
                </CardTitle>
                <Badge
                  variant={
                    notation.difficulty === "BEGINNER"
                      ? "secondary"
                      : "default"
                  }
                >
                  {notation.difficulty === "BEGINNER" ? "Başlangıç" : "İleri"}
                </Badge>
                {notation.songsterrSongId && (
                  <Badge variant="outline" className="text-blue-600">
                    Songsterr
                  </Badge>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* SVG Notation Display */}
          {hasSvg && !editing && (
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Davul Notasyonu ({parsedSvgs.length} sayfa)
                </p>
                <div className="flex items-center gap-2">
                  {!showOverlayInput && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOverlayInput(true)}
                    >
                      Not Ekle
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSvgZoom((z) => Math.max(25, z - 25))}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-500">{svgZoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSvgZoom((z) => Math.min(200, z + 25))}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {showOverlayInput && (
                <div className="mb-3 flex gap-2">
                  <Input
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    placeholder="Not yazın (notasyonun üstünde görünecek)..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowOverlayInput(false);
                      setTextOverlay("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="space-y-2 overflow-x-auto rounded-md border bg-white p-4">
                {textOverlay && (
                  <div className="mb-2 rounded bg-yellow-50 p-2 text-sm font-medium text-yellow-800">
                    {textOverlay}
                  </div>
                )}
                {parsedSvgs.map((svg: string, i: number) => (
                  <div
                    key={i}
                    className="svg-notation-page overflow-x-auto"
                    style={{
                      transform: `scale(${svgZoom / 100})`,
                      transformOrigin: "top left",
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text Notation */}
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
