"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { PageHeader } from "@/components/shared/PageHeader";
import { MonthlyReport } from "@/components/reports/MonthlyReport";
import { Select } from "@/components/ui/select";
import { getMonthName } from "@/lib/utils";

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: summary } = trpc.report.monthly.useQuery({ year, month });
  const { data: studentData } = trpc.report.studentMonthly.useQuery({ year, month });

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div>
      <PageHeader
        title="Monthly Reports"
        description="View lesson totals and per-student breakdown"
      />

      <div className="mb-6 flex gap-4">
        <Select
          value={month.toString()}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="w-40"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {getMonthName(m)}
            </option>
          ))}
        </Select>
        <Select
          value={year.toString()}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-28"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      {summary && studentData ? (
        <MonthlyReport summary={summary} students={studentData.students} />
      ) : (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      )}
    </div>
  );
}
