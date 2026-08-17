import type { Program, Deadline } from "./programs";
import type { Extraction } from "./verify";

export type ProgramFieldDiff = {
  type: "program_field";
  field: "pay_low" | "pay_high" | "pay_note" | "min_age" | "max_age";
  label: string;
  old_value: string | number | null;
  new_value: string | number | null;
};

export type DeadlineDiff = {
  type: "deadline";
  cycle_label: string;
  kind: string;
  old_due_at: string | null;
  new_due_at: string | null;
  source_tz: string | null;
  note: string | null;
};

export type FieldDiff = ProgramFieldDiff | DeadlineDiff;

function fieldDiff(
  field: ProgramFieldDiff["field"],
  label: string,
  oldValue: string | number | null,
  newValue: string | number | null
): ProgramFieldDiff | null {
  if (newValue == null) return null; // never diff away a value the extractor didn't find
  if (oldValue === newValue) return null;
  return { type: "program_field", field, label, old_value: oldValue, new_value: newValue };
}

export function diffExtraction(program: Program, storedDeadlines: Deadline[], extraction: Extraction): FieldDiff[] {
  const diffs: FieldDiff[] = [];

  const payLow = fieldDiff("pay_low", "Pay (low)", program.pay_low, extraction.pay_low);
  if (payLow) diffs.push(payLow);
  const payHigh = fieldDiff("pay_high", "Pay (high)", program.pay_high, extraction.pay_high);
  if (payHigh) diffs.push(payHigh);
  const payNote = fieldDiff("pay_note", "Pay note", program.pay_note, extraction.pay_note);
  if (payNote) diffs.push(payNote);
  const minAge = fieldDiff("min_age", "Minimum age", program.min_age, extraction.min_age);
  if (minAge) diffs.push(minAge);
  const maxAge = fieldDiff("max_age", "Maximum age", program.max_age, extraction.max_age);
  if (maxAge) diffs.push(maxAge);

  for (const d of extraction.deadlines) {
    if (!d.due_at) continue; // rolling/unknown, nothing to confirm
    const existing = storedDeadlines.find((sd) => sd.cycle_label === d.cycle_label && sd.kind === d.kind);
    if (!existing || existing.due_at !== d.due_at) {
      diffs.push({
        type: "deadline",
        cycle_label: d.cycle_label,
        kind: d.kind,
        old_due_at: existing?.due_at ?? null,
        new_due_at: d.due_at,
        source_tz: d.source_tz,
        note: d.note,
      });
    }
  }

  return diffs;
}
