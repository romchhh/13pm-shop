"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

function formatUa(value: string) {
  const dt = parseIso(value);
  if (!dt) return "";
  return dt.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Понеділок = 0 … Неділя = 6 */
function mondayIndex(year: number, month: number) {
  const js = new Date(year, month, 1).getDay();
  return js === 0 ? 6 : js - 1;
}

type BirthDatePickerProps = {
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export default function BirthDatePicker({
  value,
  onChange,
  disabled = false,
  className = "",
  id,
}: BirthDatePickerProps) {
  const selected = parseIso(value);
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const maxYear = today.getFullYear() - 14;
  const minYear = 1940;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? Math.min(maxYear, 2000)
  );
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? 0);
  const rootRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open && !disabled);

  useEffect(() => {
    if (!open) return;
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [maxYear]);

  const cells = useMemo(() => {
    const first = mondayIndex(viewYear, viewMonth);
    const total = daysInMonth(viewYear, viewMonth);
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevTotal = daysInMonth(prevYear, prevMonth);
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const out: Array<{
      day: number;
      inMonth: boolean;
      iso: string;
      disabled: boolean;
    }> = [];

    for (let i = 0; i < first; i += 1) {
      const day = prevTotal - first + i + 1;
      out.push({
        day,
        inMonth: false,
        iso: toIso(prevYear, prevMonth, day),
        disabled: true,
      });
    }

    for (let day = 1; day <= total; day += 1) {
      const dt = new Date(viewYear, viewMonth, day);
      out.push({
        day,
        inMonth: true,
        iso: toIso(viewYear, viewMonth, day),
        disabled: dt > today || viewYear < minYear || viewYear > maxYear,
      });
    }

    let nextDay = 1;
    while (out.length < 42) {
      out.push({
        day: nextDay,
        inMonth: false,
        iso: toIso(nextYear, nextMonth, nextDay),
        disabled: true,
      });
      nextDay += 1;
    }

    return out;
  }, [viewYear, viewMonth, maxYear, today]);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    const y = Math.min(maxYear, Math.max(minYear, d.getFullYear()));
    setViewYear(y);
    setViewMonth(d.getMonth());
  };

  const display = value ? formatUa(value) : "";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-xl border border-black/12 bg-white px-4 py-3.5 text-left font-['Montserrat'] text-sm transition-colors focus:border-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]/12 disabled:cursor-not-allowed disabled:bg-black/[0.03] ${
          open ? "border-[#1C1C1C] ring-2 ring-[#1C1C1C]/12" : ""
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={display ? "text-[#1C1C1C]" : "text-black/35"}>
          {display || "дд.мм.рррр"}
        </span>
        <svg
          className="h-5 w-5 text-black/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {open && !disabled ? (
        <div
          role="dialog"
          aria-label="Календар дати народження"
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_16px_48px_rgba(0,0,0,0.14)] sm:right-auto sm:w-[320px]"
        >
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-black/10 text-[#1C1C1C] transition-colors hover:bg-black/[0.04]"
              aria-label="Попередній місяць"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="h-9 min-w-0 flex-1 rounded-xl border border-black/10 bg-[#faf9f7] px-2 font-['Montserrat'] text-sm text-[#1C1C1C] focus:border-[#1C1C1C] focus:outline-none"
            >
              {MONTHS.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="h-9 w-[5.5rem] flex-shrink-0 rounded-xl border border-black/10 bg-[#faf9f7] px-2 font-['Montserrat'] text-sm text-[#1C1C1C] focus:border-[#1C1C1C] focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-black/10 text-[#1C1C1C] transition-colors hover:bg-black/[0.04]"
              aria-label="Наступний місяць"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center font-['Montserrat'] text-[11px] font-semibold uppercase tracking-wide text-black/40"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const isSelected = value === cell.iso;
              return (
                <button
                  key={`${cell.iso}-${i}`}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => {
                    onChange(cell.iso);
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center justify-center rounded-xl font-['Montserrat'] text-sm tabular-nums transition-colors ${
                    isSelected
                      ? "bg-[#1C1C1C] font-semibold text-white"
                      : cell.inMonth
                        ? "text-[#1C1C1C] hover:bg-[var(--site-accent,#5A6B47)]/15"
                        : "text-black/25"
                  } disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/[0.06] pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="rounded-xl px-3 py-1.5 font-['Montserrat'] text-xs font-medium text-black/50 transition-colors hover:bg-black/[0.04] hover:text-[#1C1C1C]"
            >
              Очистити
            </button>
            <p className="font-['Montserrat'] text-[11px] text-black/40">
              Можна вказати лише один раз
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
