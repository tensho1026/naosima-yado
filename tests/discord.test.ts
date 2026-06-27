import { describe, expect, it } from "vitest";
import {
  buildDiscordTestMessage,
  buildVacancyChangedMessage,
} from "@/lib/discord";

describe("discord messages", () => {
  it("mentions the configured Discord user in the test notification", () => {
    expect(buildDiscordTestMessage()).toContain("<@572071291054587914>");
  });

  it("mentions the configured Discord user and includes changed events", () => {
    const message = buildVacancyChangedMessage({
      target: "neconoshima-2026-08-from-03",
      events: [
        {
          date: "2026-08-03",
          summary: "追加",
        },
      ],
    });

    expect(message).toContain("<@572071291054587914>");
    expect(message).toContain("target: neconoshima-2026-08-from-03");
    expect(message).toContain("- 2026-08-03: 追加");
  });
});
