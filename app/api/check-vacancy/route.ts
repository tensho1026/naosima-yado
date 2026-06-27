import { NextResponse } from "next/server";
import {
  fetchVacancyEvents,
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
    const events = await fetchVacancyEvents(targetMonth);
    const hash = sha256(JSON.stringify(events));
    const checkedAt = new Date();

    const previous = await prisma.monitorState.findUnique({
      where: { target },
      select: { hash: true },
    });

    await prisma.monitorState.upsert({
      where: { target },
      create: {
        id: 1,
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
      changed: previous?.hash !== hash,
      hash,
      events,
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
