import {
  fetchVacancyEvents,
  getComparisonStartDate,
  getMonitorTarget,
  getTargetMonth,
  type GoogleCalendarFetchResult,
  type VacancyEvent,
} from "@/lib/google-calendar";
import { sha256 } from "@/lib/hash";
import { prisma } from "@/lib/prisma";

export type VacancyCheckResult = {
  ok: true;
  target: string;
  comparisonStartDate: string;
  changed: boolean;
  hash: string;
  events: VacancyEvent[];
  ignoredEvents: VacancyEvent[];
  raw: GoogleCalendarFetchResult["raw"];
};

export function filterComparableEvents(
  events: VacancyEvent[],
  comparisonStartDate: string,
) {
  return events.filter((event) => event.date >= comparisonStartDate);
}

export function shouldNotifyVacancyChange({
  changed,
  events,
}: {
  changed: boolean;
  events: VacancyEvent[];
}) {
  return changed && events.length > 0;
}

export async function checkVacancyAndSave(): Promise<VacancyCheckResult> {
  const targetMonth = getTargetMonth();
  const target = getMonitorTarget(targetMonth);
  const comparisonStartDate = getComparisonStartDate(targetMonth);
  const calendarResult = await fetchVacancyEvents(targetMonth);
  const events = filterComparableEvents(
    calendarResult.events,
    comparisonStartDate,
  );
  const ignoredEvents = calendarResult.events.filter(
    (event) => event.date < comparisonStartDate,
  );
  const hash = sha256(JSON.stringify(events));
  const checkedAt = new Date();

  const previous = await prisma.monitorState.findUnique({
    where: { target },
    select: { hash: true },
  });

  await prisma.monitorState.upsert({
    where: { target },
    create: {
      target,
      hash,
      payload: events,
      checkedAt,
    },
    update: {
      hash,
      payload: events,
      checkedAt,
    },
  });

  return {
    ok: true,
    target,
    comparisonStartDate,
    changed: previous?.hash !== hash,
    hash,
    events,
    ignoredEvents,
    raw: calendarResult.raw,
  };
}
