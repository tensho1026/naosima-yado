export type VacancyEvent = {
  date: string;
  summary: string;
  updated?: string;
  etag?: string;
};

type GoogleCalendarEvent = {
  summary?: unknown;
  updated?: unknown;
  etag?: unknown;
  start?: {
    date?: unknown;
    dateTime?: unknown;
  };
};

type GoogleCalendarResponse = {
  items?: unknown;
};

const GOOGLE_CALENDAR_EVENTS_URL =
  "https://clients6.google.com/calendar/v3/calendars";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseTargetMonth(targetMonth: string) {
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    throw new Error("TARGET_MONTH must use YYYY-MM format.");
  }

  const [yearText, monthText] = targetMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (month < 1 || month > 12) {
    throw new Error("TARGET_MONTH month must be between 01 and 12.");
  }

  const start = `${targetMonth}-01T00:00:00+09:00`;
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const nextYear = nextMonth.getUTCFullYear();
  const nextMonthNumber = String(nextMonth.getUTCMonth() + 1).padStart(2, "0");
  const end = `${nextYear}-${nextMonthNumber}-01T00:00:00+09:00`;

  return { start, end };
}

function buildGoogleCalendarUrl(targetMonth: string) {
  const calendarId = requireEnv("GOOGLE_CALENDAR_ID");
  const apiKey = requireEnv("GOOGLE_API_KEY");
  const { start, end } = parseTargetMonth(targetMonth);
  const url = new URL(
    `${GOOGLE_CALENDAR_EVENTS_URL}/${encodeURIComponent(calendarId)}/events`,
  );

  url.searchParams.set("calendarId", calendarId);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.append("eventTypes", "default");
  url.searchParams.append("eventTypes", "focusTime");
  url.searchParams.append("eventTypes", "outOfOffice");
  url.searchParams.set("timeZone", "Asia/Tokyo");
  url.searchParams.set("maxAttendees", "1");
  url.searchParams.set("maxResults", "250");
  url.searchParams.set("sanitizeHtml", "true");
  url.searchParams.set("timeMin", start);
  url.searchParams.set("timeMax", end);
  url.searchParams.set("key", apiKey);

  return url;
}

function isGoogleCalendarResponse(
  value: unknown,
): value is GoogleCalendarResponse {
  return typeof value === "object" && value !== null && "items" in value;
}

function normalizeEvent(event: GoogleCalendarEvent): VacancyEvent | null {
  const date = event.start?.date;

  if (typeof date !== "string") {
    return null;
  }

  return {
    date,
    summary: typeof event.summary === "string" ? event.summary : "",
    updated: typeof event.updated === "string" ? event.updated : undefined,
    etag: typeof event.etag === "string" ? event.etag : undefined,
  };
}

export async function fetchVacancyEvents(targetMonth: string) {
  const url = buildGoogleCalendarUrl(targetMonth);
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Calendar API request failed: ${response.status} ${body}`,
    );
  }

  const data: unknown = await response.json();

  if (!isGoogleCalendarResponse(data) || !Array.isArray(data.items)) {
    throw new Error("Invalid Google Calendar API response format.");
  }

  return data.items
    .map((item) => normalizeEvent(item as GoogleCalendarEvent))
    .filter((event): event is VacancyEvent => Boolean(event))
    .filter((event) => event.date.startsWith(targetMonth))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTargetMonth() {
  return process.env.TARGET_MONTH ?? "2026-08";
}

export function getMonitorTarget(targetMonth: string) {
  return `neconoshima-${targetMonth}`;
}
