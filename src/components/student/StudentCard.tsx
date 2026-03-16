"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    phone: string | null;
    notes: string | null;
  };
}

export function StudentCard({ student }: StudentCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(student.phone ?? "");
  const [notes, setNotes] = useState(student.notes ?? "");
  const utils = trpc.useUtils();

  const updateMutation = trpc.student.update.useMutation({
    onSuccess: () => {
      utils.student.getById.invalidate({ id: student.id });
      setEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: student.id,
      name,
      phone: phone || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{editing ? "Edit Student" : student.name}</CardTitle>
        {!editing && (
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-500">Phone:</span>{" "}
              {student.phone || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-500">Notes:</span>{" "}
              {student.notes || "—"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
