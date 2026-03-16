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
import { Users, Search, Plus, X, Save } from "lucide-react";

export default function StudentListPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstLessonDate, setFirstLessonDate] = useState("");
  const [instrument, setInstrument] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: students, isLoading } = trpc.student.list.useQuery({
    search: search || undefined,
  });

  const createMutation = trpc.student.create.useMutation({
    onSuccess: () => {
      utils.student.list.invalidate();
      setShowForm(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setFirstLessonDate("");
    setInstrument("");
    setPhone("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    createMutation.mutate({
      firstName,
      lastName,
      firstLessonDate: firstLessonDate ? new Date(firstLessonDate) : undefined,
      instrument: instrument || undefined,
      phone: phone || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description="All students from imported schedules"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        }
      />

      {/* Add Student Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Student</CardTitle>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Ali"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Yılmaz"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstLessonDate">First Lesson Date</Label>
                  <Input
                    id="firstLessonDate"
                    type="date"
                    value={firstLessonDate}
                    onChange={(e) => setFirstLessonDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="instrument">Instrument</Label>
                  <Input
                    id="instrument"
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    placeholder="e.g. Drums, Piano"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0532 123 4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about the student..."
                  rows={2}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending || !firstName || !lastName}>
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Saving..." : "Save Student"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : students?.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No students found"
          description={search ? "Try a different search term." : "Students will appear after you import a schedule or add one manually."}
          action={
            !search ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {students?.map((student) => {
            const totalLessons = student.lessons.length;
            const presentCount = student.lessons.filter((l) => l.attendance === "PRESENT").length;

            return (
              <Link key={student.id} href={`/students/${student.id}`}>
                <Card className="transition-colors hover:bg-gray-50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        {totalLessons} lessons total
                        {(student as unknown as { instrument?: string }).instrument &&
                          ` · ${(student as unknown as { instrument: string }).instrument}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {presentCount > 0 && (
                        <Badge variant="success">{presentCount} attended</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
