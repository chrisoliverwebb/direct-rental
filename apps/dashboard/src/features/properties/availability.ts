type AvailabilityFeed = {
  sourceName: string;
  icalUrl: string;
};

export type AvailabilityRange = {
  start: Date;
  end: Date;
  sourceName: string;
};

export type AvailabilitySnapshot = {
  unavailableDates: Set<string>;
  upcomingRanges: AvailabilityRange[];
};

export async function loadAvailabilitySnapshot(feeds: AvailabilityFeed[]): Promise<AvailabilitySnapshot> {
  const calendars = await Promise.all(
    feeds.map(async (feed) => {
      const response = await fetch(feed.icalUrl, {
        headers: { Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Unable to load ${feed.sourceName} availability feed`);
      }

      return {
        sourceName: feed.sourceName,
        text: await response.text(),
      };
    }),
  );

  const unavailableDates = new Set<string>();
  const upcomingRanges = calendars
    .flatMap(({ sourceName, text }) => parseCalendar(text, sourceName))
    .filter((range) => range.end >= startOfToday())
    .sort((left, right) => left.start.getTime() - right.start.getTime());

  for (const range of upcomingRanges) {
    let cursor = startOfDay(range.start);

    while (cursor <= range.end) {
      unavailableDates.add(toDateKey(cursor));
      cursor = addDays(cursor, 1);
    }
  }

  return {
    unavailableDates,
    upcomingRanges,
  };
}

export function buildAvailabilityCalendar(unavailableDates: Set<string>, days = 42) {
  const start = startOfToday();

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    const key = toDateKey(date);

    return {
      key,
      date,
      isUnavailable: unavailableDates.has(key),
      isToday: index === 0,
    };
  });
}

function parseCalendar(calendarText: string, sourceName: string): AvailabilityRange[] {
  const normalized = calendarText.replace(/\r\n[ \t]/g, "").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const ranges: AvailabilityRange[] = [];
  let currentStart: Date | null = null;
  let currentEndExclusive: Date | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "BEGIN:VEVENT") {
      currentStart = null;
      currentEndExclusive = null;
      continue;
    }

    if (line.startsWith("DTSTART")) {
      currentStart = parseIcalDate(line.split(":")[1] ?? "");
      continue;
    }

    if (line.startsWith("DTEND")) {
      currentEndExclusive = parseIcalDate(line.split(":")[1] ?? "");
      continue;
    }

    if (line === "END:VEVENT" && currentStart && currentEndExclusive) {
      ranges.push({
        start: currentStart,
        end: addDays(currentEndExclusive, -1),
        sourceName,
      });
    }
  }

  return ranges;
}

function parseIcalDate(value: string) {
  const trimmed = value.trim();

  if (/^\d{8}$/.test(trimmed)) {
    const year = Number(trimmed.slice(0, 4));
    const month = Number(trimmed.slice(4, 6)) - 1;
    const day = Number(trimmed.slice(6, 8));

    return new Date(year, month, day);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? startOfToday() : startOfDay(parsed);
}

function startOfToday() {
  return startOfDay(new Date());
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
