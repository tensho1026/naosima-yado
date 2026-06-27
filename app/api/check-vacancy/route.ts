import { NextResponse } from "next/server";
import {
  fetchVacancyEvents,
  getComparisonStartDate,
  getMonitorTarget,
  getTargetMonth,
} from "@/lib/google-calendar";
import { sha256 } from "@/lib/hash";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const targetMonth = getTargetMonth();
    const target = getMonitorTarget(targetMonth);
    const comparisonStartDate = getComparisonStartDate(targetMonth);
    const calendarResult = await fetchVacancyEvents(targetMonth);
    const events = calendarResult.events.filter(
      (event) => event.date >= comparisonStartDate,
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

    return NextResponse.json({
      ok: true,
      target,
      comparisonStartDate,
      changed: previous?.hash !== hash,
      hash,
      events,
      ignoredEvents,
      raw: calendarResult.raw,
    });
  } catch (error) {
    console.error("Failed to check vacancy.", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to check vacancy.",
      },
      { status: 500 },
    );
  }
}
