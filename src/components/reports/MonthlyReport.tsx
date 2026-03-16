"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthName, minutesToHours } from "@/lib/utils";

interface MonthlyReportProps {
  summary: {
    year: number;
    month: number;
    totalLessons: number;
    totalMinutes: number;
    totalHours: number;
    trialLessons: number;
    regularLessons: number;
  };
  students: {
    studentId: string;
    studentName: string;
    lessonCount: number;
    totalMinutes: number;
    trialCount: number;
  }[];
}

export function MonthlyReport({ summary, students }: MonthlyReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Lessons</p>
            <p className="text-3xl font-bold">{summary.totalLessons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-3xl font-bold">{minutesToHours(summary.totalMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Regular Lessons</p>
            <p className="text-3xl font-bold">{summary.regularLessons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Trial Lessons</p>
            <p className="text-3xl font-bold">{summary.trialLessons}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Student Breakdown — {getMonthName(summary.month)} {summary.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">No lessons this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4 font-medium">Student</th>
                    <th className="pb-3 pr-4 font-medium">Lessons</th>
                    <th className="pb-3 pr-4 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Trials</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.studentId} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{s.studentName}</td>
                      <td className="py-2 pr-4">{s.lessonCount}</td>
                      <td className="py-2 pr-4">{minutesToHours(s.totalMinutes)}</td>
                      <td className="py-2">{s.trialCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
