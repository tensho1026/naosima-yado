import type { VacancyEvent } from "@/lib/google-calendar";

const DISCORD_USER_ID = "572071291054587914";

function getDiscordWebhookUrl() {
  const value = process.env.DISCORD_WEBHOOK_URL;

  if (!value) {
    throw new Error("Missing required environment variable: DISCORD_WEBHOOK_URL");
  }

  return value;
}

async function sendDiscordMessage(content: string) {
  const response = await fetch(getDiscordWebhookUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      allowed_mentions: {
        users: [DISCORD_USER_ID],
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord webhook request failed: ${response.status} ${body}`);
  }
}

export function buildDiscordTestMessage() {
  return `<@${DISCORD_USER_ID}> neconoshima vacancy monitor test notification`;
}

export function buildVacancyChangedMessage({
  target,
  events,
}: {
  target: string;
  events: VacancyEvent[];
}) {
  const eventLines = events
    .map((event) => `- ${event.date}: ${event.summary || "(no summary)"}`)
    .join("\n");

  return [
    `<@${DISCORD_USER_ID}> neconoshima vacancy calendar updated.`,
    `target: ${target}`,
    "追加/変更検知イベント:",
    eventLines,
  ].join("\n");
}

export async function sendDiscordTestNotification() {
  await sendDiscordMessage(buildDiscordTestMessage());
}

export async function sendVacancyChangedNotification({
  target,
  events,
}: {
  target: string;
  events: VacancyEvent[];
}) {
  await sendDiscordMessage(buildVacancyChangedMessage({ target, events }));
}
