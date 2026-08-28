import type { IcsEvent } from "./ics";

// 21 of the dated rows are kind='opens' — the date applications OPEN, not the
// date they close. Labelling those "Due" would put a false deadline in an
// adviser's calendar, which is the single worst thing this feed could do.
export const VERB: Record<string, string> = {
  national: "Due",
  campus: "Campus deadline",
  intent_to_apply: "Intent to apply",
  opens: "Opens",
  rolling: "Rolling",
};

export type DeadlineRow = {
  deadline_id: string;
  due_at: string;
  kind: string;
  cycle_label: string | null;
  note: string | null;
  source_tz: string | null;
  slug: string;
  name: string;
  category: string | null;
  money_direction: string;
};

export function deadlineRowsToEvents(
  rows: DeadlineRow[],
  base: string,
  ref?: string | null
): IcsEvent[] {
  const suffix = ref ? `?ref=${encodeURIComponent(ref)}` : "";

  return rows.map((r) => {
    // due_at carries the program's own UTC offset, so the first ten characters
    // are already the correct local date — no conversion, and none wanted.
    const date = r.due_at.slice(0, 10);
    const localTime = r.due_at.slice(11, 16);
    const verb = VERB[r.kind] ?? "Deadline";
    const link = `${base}/programs/${r.slug}${suffix}`;

    const description = [
      `${verb} ${localTime}${r.source_tz ? ` ${r.source_tz}` : ""}.`,
      r.cycle_label ? `Cycle: ${r.cycle_label}.` : null,
      r.note,
      r.money_direction === "participant_earns"
        ? "This one pays the participant."
        : r.money_direction === "participant_pays"
          ? "This one charges the participant."
          : null,
      link,
      "Times are the program's own local time. Always confirm on the program's site.",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      // Stable across every regeneration, so refreshing updates events in
      // place instead of duplicating them.
      uid: `deadline-${r.deadline_id}@gapyearplatform`,
      date,
      summary: `${verb}: ${r.name}`,
      description,
      url: link,
      categories: r.category ? [r.category] : undefined,
      alarmDaysBefore: 7,
    };
  });
}
