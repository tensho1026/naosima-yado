import { describe, expect, it } from "vitest";
import { sha256 } from "@/lib/hash";
import type { VacancyEvent } from "@/lib/google-calendar";

describe("sha256", () => {
  it("returns the same hash for the same normalized events", () => {
    const events: VacancyEvent[] = [
      {
        date: "2026-08-03",
        summary: "追加",
      },
    ];

    expect(sha256(JSON.stringify(events))).toBe(
      sha256(JSON.stringify(events)),
    );
  });

  it("returns a different hash when the comparable event changes", () => {
    const before: VacancyEvent[] = [
      {
        date: "2026-08-03",
        summary: "追加",
      },
    ];
    const after: VacancyEvent[] = [
      {
        date: "2026-08-03",
        summary: "空室",
      },
    ];

    expect(sha256(JSON.stringify(before))).not.toBe(
      sha256(JSON.stringify(after)),
    );
  });
});
