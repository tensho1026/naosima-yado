import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getDiscordWebhookUrl() {
  const value = process.env.DISCORD_WEBHOOK_URL;

  if (!value) {
    throw new Error("Missing required environment variable: DISCORD_WEBHOOK_URL");
  }

  return value;
}

export async function POST() {
  try {
    const response = await fetch(getDiscordWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          "<@572071291054587914> neconoshima vacancy monitor test notification",
        allowed_mentions: {
          parse: ["users"],
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Discord webhook request failed: ${response.status} ${body}`,
      );
    }

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
