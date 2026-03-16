"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

interface AttendanceToggleProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
}

const options: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "PRESENT", label: "Present", color: "bg-green-500 text-white" },
  { value: "ABSENT", label: "Absent", color: "bg-red-500 text-white" },
  { value: "PENDING", label: "Pending", color: "bg-gray-300 text-gray-700" },
];

export function AttendanceToggle({ value, onChange }: AttendanceToggleProps) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
            value === opt.value ? opt.color : "bg-gray-100 text-gray-500 hover:bg-gray-200",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
