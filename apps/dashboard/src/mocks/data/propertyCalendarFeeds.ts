import type { PropertyAvailability } from "@repo/api-contracts";

type MockBookingSeed = {
  start: string;
  end: string;
  guestName: string;
  bookingName: string;
  externalBookingId: string;
  creationDate: string;
  guestEmail: string;
  guestPhone: string;
  adults: number;
  children: number;
  dog: boolean;
  propertyName: string;
  unitName: string;
  referrer: string;
  notes: string | null;
};

const feedEntries = [
  {
    url: "https://calendar.example.test/harbour-view-airbnb.ics",
    bookings: [
      seed("20260503", "20260507", "Sophie Carter", "Airbnb stay", "84986120", "2026-04-03T09:14:00Z", "scarter.113@guest.airbnb.com", "+44 7700 900111", 2, 1, false, "Harbour View Cottage", "Harbour View", "airbnb", "Late arrival after 8pm"),
      seed("20260512", "20260515", "Daniel Moore", "Airbnb stay", "84986121", "2026-04-05T15:22:00Z", "dmoore.204@guest.airbnb.com", "+44 7700 900222", 2, 0, false, "Harbour View Cottage", "Harbour View", "airbnb", null),
      seed("20260524", "20260529", "Emma Wilson", "Airbnb stay", "84986123", "2026-04-09T11:03:00Z", "ewilson.991@guest.airbnb.com", "+44 7700 900333", 4, 0, true, "Harbour View Cottage", "Harbour View", "airbnb", "Travelling with one small dog"),
      seed("20260605", "20260610", "Noah Taylor", "Airbnb stay", "84986124", "2026-04-11T08:47:00Z", "ntaylor.441@guest.airbnb.com", "+44 7700 900444", 2, 2, false, "Harbour View Cottage", "Harbour View", "airbnb", "Needs parking for one vehicle"),
    ],
  },
  {
    url: "https://calendar.example.test/harbour-view-booking.ics",
    bookings: [
      seed("20260508", "20260510", "Olivia Harris", "Booking.com stay", "84986125", "2026-04-07T10:11:00Z", "oharris.332@guest.booking.com", "+49 1521 6954831", 2, 0, false, "Harbour View Cottage", "Harbour View", "booking.com", "Requires invoice on departure"),
      seed("20260518", "20260521", "Jack Evans", "Booking.com stay", "84986126", "2026-04-08T17:35:00Z", "jevans.115@guest.booking.com", "+49 1521 6954832", 2, 2, false, "Harbour View Cottage", "Harbour View", "booking.com", null),
      seed("20260614", "20260618", "Amelia Hall", "Booking.com stay", "84986127", "2026-04-10T12:19:00Z", "ahall.554@guest.booking.com", "+49 1521 6954833", 3, 1, false, "Harbour View Cottage", "Harbour View", "booking.com", "Please confirm sea-view room setup"),
    ],
  },
  {
    url: "https://calendar.example.test/meadow-lodge-vrbo.ics",
    bookings: [
      seed("20260501", "20260505", "George Young", "Vrbo stay", "84986128", "2026-04-02T08:05:00Z", "gyoung.810@guest.vrbo.com", "+44 7700 900555", 4, 0, false, "Meadow Lodge", "Meadow Lodge 01", "vrbo", "Twin beds preferred for children"),
      seed("20260516", "20260520", "Mia King", "Vrbo stay", "84986129", "2026-04-06T13:52:00Z", "mking.104@guest.vrbo.com", "+44 7700 900666", 2, 2, true, "Meadow Lodge", "Meadow Lodge 01", "vrbo", "Bringing one dog and two bikes"),
      seed("20260601", "20260606", "Arthur Scott", "Vrbo stay", "84986130", "2026-04-12T09:38:00Z", "ascott.510@guest.vrbo.com", "+44 7700 900777", 5, 1, false, "Meadow Lodge", "Meadow Lodge 01", "vrbo", null),
      seed("20260620", "20260625", "Isla Green", "Vrbo stay", "84986131", "2026-04-14T16:21:00Z", "igreen.204@guest.vrbo.com", "+44 7700 900888", 2, 3, false, "Meadow Lodge", "Meadow Lodge 01", "vrbo", "Travel cot requested"),
    ],
  },
];

const feedMap = new Map(feedEntries.map((entry) => [entry.url, buildCalendar(entry.bookings)]));
const bookingMap = new Map(feedEntries.map((entry) => [entry.url, entry.bookings]));

export function getMockCalendarFeed(url: string) {
  return feedMap.get(url) ?? null;
}

export function buildMockPropertyAvailability(propertyId: string, feeds: Array<{ sourceName: string; icalUrl: string }>): PropertyAvailability {
  const ranges = feeds
    .flatMap((feed) => parseCalendar(bookingMap.get(feed.icalUrl) ?? [], feed.sourceName))
    .filter((range) => range.endDate >= startOfTodayKey())
    .sort((left, right) => left.startDate.localeCompare(right.startDate));

  return {
    propertyId,
    generatedAt: new Date().toISOString(),
    feeds: feeds.map((feed) => ({
      sourceName: feed.sourceName,
      provider: "provider" in feed ? (feed as { provider?: string | null }).provider ?? null : null,
      isConnected: Boolean(getMockCalendarFeed(feed.icalUrl)),
      lastSyncedAt: new Date().toISOString(),
    })),
    ranges,
  };
}

function buildCalendar(events: MockBookingSeed[]) {
  const body = events.map(({ start, end, guestName, bookingName }, index) => [
    "BEGIN:VEVENT",
    `UID:mock-event-${index + 1}@directrental.test`,
    "DTSTAMP:20260426T090000Z",
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${bookingName}`,
    `DESCRIPTION:Guest ${guestName}`,
    `X-GUEST-NAME:${guestName}`,
    "END:VEVENT",
  ].join("\r\n")).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Direct Rental//Property Availability Mock//EN",
    "CALSCALE:GREGORIAN",
    body,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function parseCalendar(bookings: MockBookingSeed[], sourceName: string) {
  return bookings.map((booking) => ({
    externalBookingId: booking.externalBookingId,
    creationDate: booking.creationDate,
    bookingName: booking.bookingName,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    adults: booking.adults,
    children: booking.children,
    dog: booking.dog,
    propertyName: booking.propertyName,
    unitName: booking.unitName,
    referrer: booking.referrer,
    notes: booking.notes,
    sourceName,
    startDate: normalizeIcalDate(booking.start),
    endDate: addDaysToKey(normalizeIcalDate(booking.end), -1),
  }));
}

function seed(
  start: string,
  end: string,
  guestName: string,
  bookingName: string,
  externalBookingId: string,
  creationDate: string,
  guestEmail: string,
  guestPhone: string,
  adults: number,
  children: number,
  dog: boolean,
  propertyName: string,
  unitName: string,
  referrer: string,
  notes: string | null,
): MockBookingSeed {
  return {
    start,
    end,
    guestName,
    bookingName,
    externalBookingId,
    creationDate,
    guestEmail,
    guestPhone,
    adults,
    children,
    dog,
    propertyName,
    unitName,
    referrer,
    notes,
  };
}

function normalizeIcalDate(value: string) {
  const trimmed = value.trim();

  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? startOfTodayKey() : toDateKey(parsed);
}

function addDaysToKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function startOfTodayKey() {
  return toDateKey(new Date());
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
