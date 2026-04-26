"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EventMonthCalendarEvent = {
  id: string;
  title: string;
  date: Date;
  endDate?: Date | null;
  tone?: "default" | "success" | "warning";
  meta?: string | null;
  href?: string;
};

type EventRenderContext = {
  continuesBefore: boolean;
  continuesAfter: boolean;
  spanDays: number;
};

const BAR_HEIGHT = 24;
const BAR_GAP = 6;
const HEADER_OFFSET = 28;
const DAY_CELL_BASE_HEIGHT = 112;

export function EventMonthCalendar({
  month,
  initialMonth,
  events,
  emptyMessage,
  onDateClick,
  onMonthChange,
  renderEvent,
  storageKey,
}: {
  month?: Date;
  initialMonth?: Date;
  events: EventMonthCalendarEvent[];
  emptyMessage?: string;
  onDateClick?: (date: Date) => void;
  onMonthChange?: (month: Date) => void;
  renderEvent?: (event: EventMonthCalendarEvent, context: EventRenderContext) => React.ReactNode;
  storageKey?: string;
}) {
  const derivedInitialMonth = useMemo(() => {
    if (initialMonth) return startOfMonth(initialMonth);
    if (events.length > 0) {
      const sorted = [...events].sort((left, right) => left.date.getTime() - right.date.getTime());
      return startOfMonth(sorted[0]?.date ?? new Date());
    }
    return startOfMonth(new Date());
  }, [events, initialMonth]);
  const derivedInitialMonthTime = derivedInitialMonth.getTime();

  const [internalMonth, setInternalMonth] = useState(() => {
    if (month) return startOfMonth(month);
    if (storageKey && typeof window !== "undefined") {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const [y, m] = stored.split("-").map(Number);
        if (y && m) return new Date(y, m - 1, 1);
      }
    }
    return derivedInitialMonth;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeMonth = month ? startOfMonth(month) : internalMonth;
  const days = buildCalendarDays(activeMonth);
  const weeks = chunk(days, 7);

  useEffect(() => {
    if (!month) {
      setInternalMonth((current) =>
        current.getTime() === derivedInitialMonthTime ? current : new Date(derivedInitialMonthTime),
      );
    }
  }, [derivedInitialMonthTime, month]);

  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      const key = `${activeMonth.getFullYear()}-${String(activeMonth.getMonth() + 1).padStart(2, "0")}`;
      window.localStorage.setItem(storageKey, key);
    }
  }, [activeMonth, storageKey]);

  const setMonth = (nextMonth: Date) => {
    const normalized = startOfMonth(nextMonth);
    if (!month) {
      setInternalMonth(normalized);
    }
    onMonthChange?.(normalized);
    setPickerOpen(false);
  };

  return (
    <div className="grid gap-3 p-4">
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="grid items-center gap-3 p-4 md:grid-cols-[auto_1fr_auto]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 rounded-md px-3 text-xs font-medium"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <div className="flex items-center justify-center gap-1 justify-self-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-md px-3 text-sm font-medium text-slate-900"
              onClick={() => setPickerOpen((open) => !open)}
            >
              {new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(activeMonth)}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div />
        </div>
        {pickerOpen ? (
          <div className="flex flex-wrap items-center gap-2 border-t bg-slate-50 p-3">
            {Array.from({ length: 12 }, (_, index) => {
              const candidate = new Date(activeMonth.getFullYear(), index, 1);
              const isSelected = index === activeMonth.getMonth();
              return (
                <Button
                  key={index}
                  type="button"
                  size="sm"
                  variant={isSelected ? "secondary" : "ghost"}
                  className="h-8 rounded-md px-3 text-xs"
                  onClick={() => setMonth(candidate)}
                >
                  {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(candidate)}
                </Button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              {buildYearOptions(activeMonth).map((year) => (
                <Button
                  key={year}
                  type="button"
                  size="sm"
                  variant={year === activeMonth.getFullYear() ? "secondary" : "ghost"}
                  className="h-8 rounded-md px-3 text-xs"
                  onClick={() => setMonth(new Date(year, activeMonth.getMonth(), 1))}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid gap-1">
        {weeks.map((week, weekIndex) => {
          const weekLayout = buildWeekLayout(week, events);
          const weekMinHeight = DAY_CELL_BASE_HEIGHT + Math.max(0, weekLayout.laneCount - 1) * (BAR_HEIGHT + BAR_GAP);

          return (
            <div key={`week-${weekIndex}`} className="relative">
              {weekLayout.segments.map((segment) => {
                const left = `${(segment.startColumn / 7) * 100}%`;
                const width = `${(segment.spanDays / 7) * 100}%`;

                return (
                  <div
                    key={`${segment.event.id}-${segment.startColumn}-${segment.lane}`}
                    className="absolute px-0.5"
                    style={{ left, width, top: `${HEADER_OFFSET + segment.lane * (BAR_HEIGHT + BAR_GAP)}px`, height: `${BAR_HEIGHT}px` }}
                  >
                    {renderEvent
                      ? renderEvent(segment.event, {
                        continuesBefore: segment.continuesBefore,
                        continuesAfter: segment.continuesAfter,
                        spanDays: segment.spanDays,
                      })
                      : <DefaultCalendarEvent event={segment.event} continuesBefore={segment.continuesBefore} continuesAfter={segment.continuesAfter} />}
                  </div>
                );
              })}

              <div className="grid grid-cols-7 gap-1">
                {week.map((day) => {
                  const key = toDateKey(day.date);
                  const isToday = isSameCalendarDay(day.date, new Date());
                  const isPast = isBeforeToday(day.date);
                  const isFuture = !isPast;

                  if (!day.inCurrentMonth) {
                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-dashed border-slate-100 bg-transparent"
                        style={{ minHeight: `${weekMinHeight}px` }}
                      />
                    );
                  }

                  return (
                    <div
                      key={key}
                      className={cn(
                        "group min-h-[112px] rounded-lg border bg-white p-1.5",
                        isToday
                          ? "border-primary ring-2 ring-primary/10"
                          : isPast
                            ? "border-slate-200 bg-slate-50/80"
                            : "border-slate-200 hover:border-slate-300",
                      )}
                      style={{ minHeight: `${weekMinHeight}px` }}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className={cn("text-xs font-medium", isToday ? "text-primary" : isPast ? "text-slate-400" : "")}>
                          {day.date.getDate()}
                        </span>
                        {onDateClick && isFuture ? (
                          <button
                            type="button"
                            onClick={() => onDateClick(day.date)}
                            className="h-5 rounded bg-slate-100 px-1.5 text-[10px] text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200"
                          >
                            Add
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && emptyMessage ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : null}
    </div>
  );
}

function DefaultCalendarEvent({
  event,
  continuesBefore,
  continuesAfter,
}: {
  event: EventMonthCalendarEvent;
  continuesBefore: boolean;
  continuesAfter: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full items-center overflow-hidden px-2 text-left text-[11px]",
        event.tone === "warning"
          ? "bg-amber-100 text-amber-900"
          : event.tone === "success"
            ? "bg-emerald-100 text-emerald-900"
            : "bg-slate-100 text-slate-700",
        continuesBefore ? "rounded-r-md" : "rounded-l-md rounded-r-md",
        continuesAfter ? "rounded-l-md" : "",
      )}
    >
      <p className="truncate font-medium">{event.title}</p>
      {event.meta ? <p className="ml-2 truncate opacity-80">{event.meta}</p> : null}
    </div>
  );
}

function buildWeekLayout(week: CalendarDay[], events: EventMonthCalendarEvent[]) {
  const weekStart = startOfDay(week[0]?.date ?? new Date());
  const weekEnd = startOfDay(week[6]?.date ?? weekStart);
  const activeMonth = week.find((day) => day.inCurrentMonth)?.date.getMonth();
  const activeYear = week.find((day) => day.inCurrentMonth)?.date.getFullYear();
  const visibleColumns = week
    .map((day, index) => (day.inCurrentMonth ? index : -1))
    .filter((index) => index >= 0);
  const visibleStartColumn = visibleColumns[0];
  const visibleEndColumn = visibleColumns[visibleColumns.length - 1];

  if (visibleStartColumn === undefined || visibleEndColumn === undefined) {
    return { laneCount: 0, segments: [] };
  }

  const relevant = events
    .map((event) => ({
      event,
      start: startOfDay(event.date),
      end: startOfDay(event.endDate ?? event.date),
    }))
    .filter(({ start, end }) => {
      const touchesActiveMonth = eachDayInRange(start, end).some(
        (day) => day.getMonth() === activeMonth && day.getFullYear() === activeYear,
      );
      if (!touchesActiveMonth) return false;
      if (end < weekStart || start > weekEnd) return false;
      const rawStartColumn = Math.max(0, differenceInDays(weekStart, start));
      const rawEndColumn = Math.min(6, differenceInDays(weekStart, end));
      const visibleSegmentStart = Math.max(rawStartColumn, visibleStartColumn);
      const visibleSegmentEnd = Math.min(rawEndColumn, visibleEndColumn);
      return visibleSegmentStart <= visibleSegmentEnd;
    })
    .sort((left, right) => left.start.getTime() - right.start.getTime());

  const laneEndColumns: number[] = [];
  const segments = relevant.map(({ event, start, end }) => {
    const rawStartColumn = Math.max(0, differenceInDays(weekStart, start));
    const rawEndColumn = Math.min(6, differenceInDays(weekStart, end));
    const startColumn = Math.max(rawStartColumn, visibleStartColumn);
    const endColumn = Math.min(rawEndColumn, visibleEndColumn);
    let lane = 0;

    while (true) {
      const laneEnd = laneEndColumns[lane];
      if (laneEnd === undefined || laneEnd < startColumn) {
        break;
      }
      lane += 1;
    }

    laneEndColumns[lane] = endColumn;

    return {
      event,
      lane,
      startColumn,
      spanDays: endColumn - startColumn + 1,
      continuesBefore: start < weekStart || rawStartColumn < visibleStartColumn,
      continuesAfter: end > weekEnd || rawEndColumn > visibleEndColumn,
    };
  });

  return {
    laneCount: laneEndColumns.length,
    segments,
  };
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function differenceInDays(from: Date, to: Date) {
  const fromTime = startOfDay(from).getTime();
  const toTime = startOfDay(to).getTime();
  return Math.round((toTime - fromTime) / 86400000);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildYearOptions(month: Date) {
  const currentYear = month.getFullYear();
  return Array.from({ length: 9 }, (_, index) => currentYear - 4 + index);
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function isBeforeToday(date: Date) {
  const today = new Date();
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return dateOnly < todayOnly;
}

type CalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
};

function buildCalendarDays(month: Date): CalendarDay[] {
  const firstDay = startOfMonth(month);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return { date, inCurrentMonth: date.getMonth() === month.getMonth() };
  });
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eachDayInRange(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = startOfDay(start);
  const finish = startOfDay(end);

  while (cursor <= finish) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
