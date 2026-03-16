"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search } from "lucide-react";

export default function StudentListPage() {
  const [search, setSearch] = useState("");
  const { data: students, isLoading } = trpc.student.list.useQuery({
    search: search || undefined,
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="All students from imported schedules"
      />

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
          description={search ? "Try a different search term." : "Students will appear after you import a schedule."}
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
