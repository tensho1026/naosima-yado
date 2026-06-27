import { describe, expect, it } from "vitest";
import {
  filterComparableEvents,
  shouldNotifyVacancyChange,
} from "@/lib/vacancy-monitor";
import type { VacancyEvent } from "@/lib/google-calendar";

describe("vacancy monitor", () => {
  const comparisonStartDate = "2026-08-03";

  it("ignores the known 2026-08-02 event", () => {
    const events: VacancyEvent[] = [
      {
        date: "2026-08-02",
        summary: "－",
        updated: "2026-06-14T10:24:03.487Z",
        etag: "\"3562865286975326\"",
      },
    ];

    expect(filterComparableEvents(events, comparisonStartDate)).toEqual([]);
  });

  it("keeps events added on or after 2026-08-03", () => {
    const events: VacancyEvent[] = [
      {
        date: "2026-08-02",
        summary: "－",
      },
      {
        date: "2026-08-03",
        summary: "追加",
      },
      {
        date: "2026-08-04",
        summary: "空室",
      },
    ];

    expect(filterComparableEvents(events, comparisonStartDate)).toEqual([
      {
        date: "2026-08-03",
        summary: "追加",
      },
      {
        date: "2026-08-04",
        summary: "空室",
      },
    ]);
  });

  it("notifies only when the comparable events changed and are not empty", () => {
    expect(
      shouldNotifyVacancyChange({
        changed: false,
        events: [],
      }),
    ).toBe(false);

    expect(
      shouldNotifyVacancyChange({
        changed: true,
        events: [],
      }),
    ).toBe(false);

    expect(
      shouldNotifyVacancyChange({
        changed: true,
        events: [
          {
            date: "2026-08-03",
            summary: "追加",
          },
        ],
      }),
    ).toBe(true);
  });
});
