import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendVacancyChangedNotification } from "@/lib/discord";
import {
  checkVacancyAndSave,
  shouldNotifyVacancyChange,
} from "@/lib/vacancy-monitor";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const source = request.headers.get("x-trigger-source") ?? "unknown";
    const githubRunId = request.headers.get("x-github-run-id");
    const githubRunNumber = request.headers.get("x-github-run-number");
    const result = await checkVacancyAndSave();
    const shouldNotify = shouldNotifyVacancyChange({
      changed: result.changed,
      events: result.events,
    });

    console.log("[vacancy cron]", {
      source,
      githubRunId,
      githubRunNumber,
      target: result.target,
      changed: result.changed,
      events: result.events.length,
      ignoredEvents: result.ignoredEvents.length,
      notified: shouldNotify,
    });

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
