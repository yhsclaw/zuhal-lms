"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, X, Save, Pencil, Trash2, Check } from "lucide-react";

interface StudentForm {
  firstName: string;
  lastName: string;
  firstLessonDate: string;
  instrument: string;
  phone: string;
  notes: string;
}

const emptyForm: StudentForm = { firstName: "", lastName: "", firstLessonDate: "", instrument: "", phone: "", notes: "" };

export default function StudentListPage() {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<StudentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StudentForm>(emptyForm);

  const utils = trpc.useUtils();
  const { data: students, isLoading } = trpc.student.list.useQuery({ search: search || undefined });

  const createMutation = trpc.student.create.useMutation({
    onSuccess: () => { utils.student.list.invalidate(); setShowAddForm(false); setAddForm(emptyForm); },
  });

  const updateMutation = trpc.student.update.useMutation({
    onSuccess: () => { utils.student.list.invalidate(); setEditingId(null); },
  });

  const deleteMutation = trpc.student.delete.useMutation({
    onSuccess: () => { utils.student.list.invalidate(); },
    onError: (err) => { alert(err.message); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.firstName || !addForm.lastName) return;
    createMutation.mutate({
      firstName: addForm.firstName,
      lastName: addForm.lastName,
      firstLessonDate: addForm.firstLessonDate ? new Date(addForm.firstLessonDate + "T12:00:00") : undefined,
      instrument: addForm.instrument || undefined,
      phone: addForm.phone || undefined,
      notes: addForm.notes || undefined,
    });
  };

  const startEdit = (student: { id: string; name: string; instrument?: string | null; phone?: string | null; notes?: string | null; firstLessonDate?: Date | null }) => {
    const parts = student.name.split(" ");
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    setEditingId(student.id);
    setEditForm({
      firstName,
      lastName,
      firstLessonDate: student.firstLessonDate ? new Date(student.firstLessonDate).toISOString().split("T")[0] : "",
      instrument: student.instrument ?? "",
      phone: student.phone ?? "",
      notes: student.notes ?? "",
    });
  };

  const handleUpdate = (id: string) => {
    if (!editForm.firstName) return;
    updateMutation.mutate({
      id,
      name: `${editForm.firstName} ${editForm.lastName}`.trim(),
      firstLessonDate: editForm.firstLessonDate ? new Date(editForm.firstLessonDate + "T12:00:00") : null,
      instrument: editForm.instrument || null,
      phone: editForm.phone || undefined,
      notes: editForm.notes || undefined,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" öğrencisini silmek istediğine emin misin? Tüm ders kayıtları etkilenebilir.`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description="All students"
        actions={
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        }
      />

      {/* Add Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Student</CardTitle>
            <button onClick={() => { setShowAddForm(false); setAddForm(emptyForm); }} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>First Name *</Label><Input value={addForm.firstName} onChange={(e) => setAddForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Ali" required /></div>
                <div><Label>Last Name *</Label><Input value={addForm.lastName} onChange={(e) => setAddForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Yılmaz" required /></div>
                <div><Label>First Lesson Date</Label><Input type="date" value={addForm.firstLessonDate} onChange={(e) => setAddForm(f => ({ ...f, firstLessonDate: e.target.value }))} /></div>
                <div><Label>Instrument</Label><Input value={addForm.instrument} onChange={(e) => setAddForm(f => ({ ...f, instrument: e.target.value }))} placeholder="Drums" /></div>
                <div><Label>Phone</Label><Input value={addForm.phone} onChange={(e) => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="0532 123 4567" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={addForm.notes} onChange={(e) => setAddForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <Button type="submit" disabled={createMutation.isPending || !addForm.firstName || !addForm.lastName}>
                <Save className="mr-2 h-4 w-4" />{createMutation.isPending ? "Saving..." : "Save Student"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />)}</div>
      ) : students?.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No students found" description={search ? "Try a different search term." : "Add a student manually or import a schedule."} />
      ) : (
        <div className="space-y-2">
          {students?.map((student) => {
            const presentCount = student.lessons.filter((l) => l.attendance === "PRESENT").length;
            const isEditing = editingId === student.id;

            return (
              <Card key={student.id} className={isEditing ? "border-blue-300" : ""}>
                <CardContent className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div><Label className="text-xs">First Name</Label><Input value={editForm.firstName} onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))} /></div>
                        <div><Label className="text-xs">Last Name</Label><Input value={editForm.lastName} onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))} /></div>
                        <div><Label className="text-xs">First Lesson Date</Label><Input type="date" value={editForm.firstLessonDate} onChange={(e) => setEditForm(f => ({ ...f, firstLessonDate: e.target.value }))} /></div>
                        <div><Label className="text-xs">Instrument</Label><Input value={editForm.instrument} onChange={(e) => setEditForm(f => ({ ...f, instrument: e.target.value }))} /></div>
                        <div><Label className="text-xs">Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
                      </div>
                      <div><Label className="text-xs">Notes</Label><Textarea value={editForm.notes} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdate(student.id)} disabled={updateMutation.isPending}>
                          <Check className="mr-1 h-3 w-3" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <Link href={`/students/${student.id}`} className="flex-1">
                        <p className="font-medium hover:text-brand-600">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          {student.lessons.length} lessons
                          {(student as unknown as { instrument?: string }).instrument && ` · ${(student as unknown as { instrument: string }).instrument}`}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2">
                        {(student as unknown as { lastChapter?: { number: number; title: string } | null }).lastChapter && (
                          <Badge variant="outline" className="text-xs">
                            Son: Bölüm {(student as unknown as { lastChapter: { number: number; title: string } }).lastChapter.number}
                          </Badge>
                        )}
                        {presentCount > 0 && <Badge variant="success">{presentCount} attended</Badge>}
                        <button onClick={() => startEdit(student as Parameters<typeof startEdit>[0])} className="rounded p-1 text-gray-400 hover:text-gray-700">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id, student.name)} className="rounded p-1 text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
