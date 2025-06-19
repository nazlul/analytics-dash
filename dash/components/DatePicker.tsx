"use client";

import React from "react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1; 

const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { name: "January", value: 1 },
  { name: "February", value: 2 },
  { name: "March", value: 3 },
  { name: "April", value: 4 },
  { name: "May", value: 5 },
  { name: "June", value: 6 },
  { name: "July", value: 7 },
  { name: "August", value: 8 },
  { name: "September", value: 9 },
  { name: "October", value: 10 },
  { name: "November", value: 11 },
  { name: "December", value: 12 },
];

interface DatePickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function DatePicker({ year, month, onChange }: DatePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm bg-[#439B82] text-[#35204D] font-semibold"
      >
        {months.map(({ name, value }) => {
          const isFutureMonth = year === currentYear && value > currentMonth;
          return (
            <option key={value} value={value} disabled={isFutureMonth}>
              {name}
            </option>
          );
        })}
      </select>
      <select
        value={year}
        onChange={(e) => {
          const newYear = Number(e.target.value);
          if (newYear === currentYear && month > currentMonth) {
            onChange(newYear, currentMonth);
          } else {
            onChange(newYear, month);
          }
        }}
        className="border rounded px-2 py-1 text-sm bg-[#439B82] text-[#35204D] font-semibold"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
