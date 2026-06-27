import { NextResponse } from "next/server";
import { sendVacancyChangedNotification } from "@/lib/discord";
import { checkVacancyAndSave } from "@/lib/vacancy-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkVacancyAndSave();
    const shouldNotify = result.changed && result.events.length > 0;

    if (shouldNotify) {
      await sendVacancyChangedNotification({
        target: result.target,
        events: result.events,
      });
    }

    return NextResponse.json({
      ...result,
      notified: shouldNotify,
    });
  } catch (error) {
    console.error("Failed to run vacancy cron.", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to run vacancy cron.",
      },
      { status: 500 },
    );
  }
}
