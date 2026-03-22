"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Plus,
  Search,
  Trash2,
  Globe,
  Loader2,
  Save,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

type Difficulty = "BEGINNER" | "ADVANCED";

interface SongsterrTrack {
  instrumentId: number;
  instrument: string;
  name: string;
  hash: string;
}

interface SongsterrResult {
  songId: number;
  artist: string;
  title: string;
  tracks: SongsterrTrack[];
  popularTrackDrum: number;
}

interface DrumOption {
  song: SongsterrResult;
  track: SongsterrTrack;
  trackIndex: number;
}

export default function SongNotationListPage() {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    Difficulty | undefined
  >(undefined);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("BEGINNER");

  // Songsterr search state
  const [showSongsterr, setShowSongsterr] = useState(false);
  const [songsterrQuery, setSongsterrQuery] = useState("");
  const [songsterrResults, setSongsterrResults] = useState<DrumOption[]>([]);
  const [songsterrLoading, setSongsterrLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<DrumOption | null>(null);
  const [svgLoading, setSvgLoading] = useState(false);
  const [svgData, setSvgData] = useState<string[]>([]);
  const [svgError, setSvgError] = useState<string | null>(null);
  const [svgZoom, setSvgZoom] = useState(100);
  const [saveName, setSaveName] = useState("");
  const [saveDifficulty, setSaveDifficulty] =
    useState<Difficulty>("BEGINNER");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Reset Songsterr state
      resetSongsterrState();
    },
  });

  const deleteMutation = trpc.songNotation.delete.useMutation({
    onSuccess: () => {
      utils.songNotation.list.invalidate();
    },
  });

  const resetSongsterrState = () => {
    setShowSongsterr(false);
    setSongsterrQuery("");
    setSongsterrResults([]);
    setSelectedSong(null);
    setSvgData([]);
    setSvgError(null);
    setSvgZoom(100);
    setSaveName("");
  };

  const searchSongsterr = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSongsterrResults([]);
      return;
    }

    setSongsterrLoading(true);
    try {
      const res = await fetch(
        `https://www.songsterr.com/api/songs?pattern=${encodeURIComponent(query)}&size=10`
      );
      if (!res.ok) throw new Error("Songsterr API hatası");
      const data: SongsterrResult[] = await res.json();

      // Filter songs with drum tracks and create options
      const options: DrumOption[] = [];
      for (const song of data) {
        if (song.popularTrackDrum >= 0) {
          const drumTracks = song.tracks.filter(
            (t) => t.instrument === "Drums"
          );
          if (drumTracks.length > 0) {
            for (const track of drumTracks) {
              options.push({
                song,
                track,
                trackIndex: song.popularTrackDrum,
              });
            }
          }
        }
      }
      setSongsterrResults(options);
    } catch {
      setSongsterrResults([]);
    } finally {
      setSongsterrLoading(false);
    }
  }, []);

  const handleSongsterrQueryChange = (value: string) => {
    setSongsterrQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchSongsterr(value), 500);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelectSong = async (option: DrumOption) => {
    setSelectedSong(option);
    setSvgLoading(true);
    setSvgError(null);
    setSvgData([]);
    setSaveName(`${option.song.artist} - ${option.song.title}`);

    try {
      const params = new URLSearchParams({
        songId: String(option.song.songId),
        trackIndex: String(option.trackIndex),
        artist: option.song.artist,
        title: option.song.title,
      });
      const res = await fetch(`/api/songsterr-notation?${params}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setSvgError(
          data.error ||
            "Notasyon yüklenemedi, Songsterr erişimi kısıtlı olabilir"
        );
        return;
      }

      if (data.svgs && data.svgs.length > 0) {
        setSvgData(data.svgs);
      } else {
        setSvgError("Notasyon yüklenemedi, SVG verisi bulunamadı");
      }
    } catch {
      setSvgError("Notasyon yüklenemedi, Songsterr erişimi kısıtlı olabilir");
    } finally {
      setSvgLoading(false);
    }
  };

  const handleSaveSongsterr = () => {
    if (!saveName.trim() || !selectedSong) return;
    createMutation.mutate({
      title: saveName.trim(),
      notation: `// Songsterr: ${selectedSong.song.artist} - ${selectedSong.song.title}\n// Track: ${selectedSong.track.name}`,
      difficulty: saveDifficulty,
      songsterrSongId: selectedSong.song.songId,
      songsterrTrackIndex: selectedSong.trackIndex,
      svgData: JSON.stringify(svgData),
    });
  };

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSongsterr(true);
                setShowAddForm(false);
              }}
            >
              <Globe className="mr-2 h-4 w-4" />
              Songsterr&apos;dan Ara
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(true);
                resetSongsterrState();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Notasyon
            </Button>
          </div>
        }
      />

      {/* Songsterr Search Panel */}
      {showSongsterr && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Songsterr&apos;dan Şarkı Ara
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSongsterrState}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Şarkı veya sanatçı adı yazın..."
                value={songsterrQuery}
                onChange={(e) => handleSongsterrQueryChange(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Search results */}
            {songsterrLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aranıyor...
              </div>
            )}

            {!songsterrLoading &&
              songsterrResults.length > 0 &&
              !selectedSong && (
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {songsterrResults.map((option, i) => (
                    <button
                      key={`${option.song.songId}-${option.track.hash}-${i}`}
                      onClick={() => handleSelectSong(option)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                    >
                      <span className="font-medium">
                        {option.song.artist}
                      </span>
                      {" - "}
                      <span>{option.song.title}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({option.track.name})
                      </span>
                    </button>
                  ))}
                </div>
              )}

            {!songsterrLoading &&
              songsterrQuery.length >= 2 &&
              songsterrResults.length === 0 &&
              !selectedSong && (
                <p className="py-2 text-sm text-gray-500">
                  Davul track&apos;i olan şarkı bulunamadı
                </p>
              )}

            {/* SVG Loading */}
            {svgLoading && (
              <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Notasyon yükleniyor...
              </div>
            )}

            {/* SVG Error */}
            {svgError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {svgError}
              </div>
            )}

            {/* SVG Preview */}
            {svgData.length > 0 && selectedSong && (
              <div className="mt-3">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedSong.song.artist} -{" "}
                    {selectedSong.song.title}
                    <span className="ml-2 text-xs text-gray-500">
                      ({svgData.length} sayfa)
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSvgZoom((z) => Math.max(25, z - 25))
                      }
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-gray-500">
                      {svgZoom}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSvgZoom((z) => Math.min(200, z + 25))
                      }
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-md border bg-white p-2">
                  {svgData.map((svg, i) => (
                    <div
                      key={i}
                      className="svg-container overflow-x-auto"
                      style={{
                        transform: `scale(${svgZoom / 100})`,
                        transformOrigin: "top left",
                      }}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ))}
                </div>

                {/* Save form */}
                <div className="mt-4 flex flex-col gap-3 rounded-md border bg-gray-50 p-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Kayıt Adı
                    </label>
                    <Input
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Notasyon adı..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Seviye
                    </label>
                    <select
                      value={saveDifficulty}
                      onChange={(e) =>
                        setSaveDifficulty(e.target.value as Difficulty)
                      }
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="BEGINNER">Başlangıç</option>
                      <option value="ADVANCED">İleri</option>
                    </select>
                  </div>
                  <Button
                    onClick={handleSaveSongsterr}
                    disabled={
                      createMutation.isPending || !saveName.trim()
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {createMutation.isPending
                      ? "Kaydediliyor..."
                      : "Kaydet"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
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
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-200"
            />
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
            <Card
              key={notation.id}
              className="transition-colors hover:bg-gray-50"
            >
              <CardContent className="flex items-center justify-between p-4">
                <Link
                  href={`/song-notation/${notation.id}`}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3">
                    {notation.svgData ? (
                      <Globe className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Music className="h-5 w-5 text-brand-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {notation.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notation.updatedAt).toLocaleDateString(
                          "tr-TR"
                        )}
                        {notation.svgData && (
                          <span className="ml-2 text-blue-500">
                            Songsterr
                          </span>
                        )}
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
                    if (
                      confirm(
                        "Bu notasyonu silmek istediğinize emin misiniz?"
                      )
                    ) {
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
