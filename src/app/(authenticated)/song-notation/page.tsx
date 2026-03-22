"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Plus, Search, Trash2 } from "lucide-react";

type Difficulty = "BEGINNER" | "ADVANCED";

export default function SongNotationListPage() {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    Difficulty | undefined
  >(undefined);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("BEGINNER");

  const utils = trpc.useUtils();
  const { data: notations, isLoading } = trpc.songNotation.list.useQuery({
    search: search || undefined,
    difficulty: difficultyFilter,
  });

  const createMutation = trpc.songNotation.save.useMutation({
    onSuccess: () => {
      utils.songNotation.list.invalidate();
      setShowAddForm(false);
      setNewTitle("");
    },
  });

  const deleteMutation = trpc.songNotation.delete.useMutation({
    onSuccess: () => {
      utils.songNotation.list.invalidate();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate({
      title: newTitle.trim(),
      notation: defaultNotation(newTitle.trim()),
      difficulty: newDifficulty,
    });
  };

  return (
    <div>
      <PageHeader
        title="Şarkı Notasyonu"
        description="Davul notasyonlarını arayın, görüntüleyin ve düzenleyin"
        actions={
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Notasyon
          </Button>
        }
      />

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Şarkı Adı
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Şarkı adını girin..."
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Seviye
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) =>
                    setNewDifficulty(e.target.value as Difficulty)
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="BEGINNER">Başlangıç</option>
                  <option value="ADVANCED">İleri</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Kaydediliyor..." : "Oluştur"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Şarkı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={difficultyFilter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter(undefined)}
          >
            Tümü
          </Button>
          <Button
            variant={difficultyFilter === "BEGINNER" ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter("BEGINNER")}
          >
            Başlangıç
          </Button>
          <Button
            variant={difficultyFilter === "ADVANCED" ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter("ADVANCED")}
          >
            İleri
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : notations?.length === 0 ? (
        <EmptyState
          icon={<Music className="h-12 w-12" />}
          title="Notasyon bulunamadı"
          description={
            search
              ? "Farklı bir arama terimi deneyin"
              : "Yeni bir notasyon ekleyerek başlayın"
          }
        />
      ) : (
        <div className="space-y-2">
          {notations?.map((notation) => (
            <Card key={notation.id} className="transition-colors hover:bg-gray-50">
              <CardContent className="flex items-center justify-between p-4">
                <Link
                  href={`/song-notation/${notation.id}`}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3">
                    <Music className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {notation.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notation.updatedAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        notation.difficulty === "BEGINNER"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {notation.difficulty === "BEGINNER"
                        ? "Başlangıç"
                        : "İleri"}
                    </Badge>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Bu notasyonu silmek istediğinize emin misiniz?")) {
                      deleteMutation.mutate({ id: notation.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function defaultNotation(title: string): string {
  return `// ${title} - Davul Notasyonu
// Tempo: 120 BPM | 4/4

// HH = Hi-Hat, SD = Snare, BD = Bass Drum
// x = vuruş, o = açık, - = sus

//         1 e & a 2 e & a 3 e & a 4 e & a
// HH  |   x - x - x - x - x - x - x - x - |
// SD  |   - - - - x - - - - - - - x - - - |
// BD  |   x - - - - - - - x - - - - - - - |

// Burada notasyonu düzenleyebilirsiniz...
`;
}
