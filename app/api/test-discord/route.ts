import { NextResponse } from "next/server";
import { sendDiscordTestNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await sendDiscordTestNotification();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send Discord test notification.", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to send Discord test notification.",
      },
      { status: 500 },
    );
  }
}
