// An iCalendar feed of application deadlines, for advisers who would rather
// have these in the calendar they already look at than on a page they have to
// remember to visit.
//
// RFC 5545 is unforgiving in three specific ways, and every one of them fails
// silently — the feed simply does not appear, or appears duplicated:
//   * lines are folded at 75 OCTETS, not characters
//   * CRLF, everywhere, including the last line
//   * UIDs must be stable, or every refresh re-adds every event

export type IcsEvent = {
  uid: string;
  /** Local calendar date, YYYY-MM-DD. All-day, see buildEvent. */
  date: string;
  summary: string;
  description?: string;
  url?: string;
  categories?: string[];
  /** Days before the date to fire a reminder. Omit for none. */
  alarmDaysBefore?: number;
};

// RFC 5545 §3.3.11. Backslash first or it would double-escape the others.
// A colon is NOT escaped in a value — escaping it breaks Outlook.
function escapeText(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// Fold to 75 octets per line with a single leading space on continuations.
// Counting characters instead of bytes is the classic bug: one accented
// character in a program name pushes the line over the limit and strict
// parsers reject the whole calendar.
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;

  // Iterate by code point so a multi-byte character is never split in half.
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > limit) {
      out.push(current);
      current = " ";
      bytes = 1;
      limit = 75;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n");
}

function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dateOnly(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

// All-day rather than timed, deliberately. A deadline is a day in the reader's
// head, and an all-day event lands on the correct day for a subscriber in any
// timezone. A timed event would be technically truer to "17:00 ET" but shows
// up as 22:00 in London and 06:00 the next morning in Seoul, which is exactly
// the confusion a deadline calendar must not create. The precise local time
// goes in the description instead, where it cannot be misread.
function buildEvent(e: IcsEvent, stamp: string): string[] {
  const end = new Date(`${e.date}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const lines = [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dateOnly(e.date)}`,
    `DTEND;VALUE=DATE:${dateOnly(end.toISOString().slice(0, 10))}`,
    `SUMMARY:${escapeText(e.summary)}`,
    // Deadlines should not make an adviser look busy to their colleagues.
    "TRANSP:TRANSPARENT",
  ];

  if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
  if (e.url) lines.push(`URL:${e.url}`);
  if (e.categories?.length) lines.push(`CATEGORIES:${e.categories.map(escapeText).join(",")}`);

  if (e.alarmDaysBefore) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `TRIGGER:-P${e.alarmDaysBefore}D`,
      `DESCRIPTION:${escapeText(e.summary)}`,
      "END:VALARM"
    );
  }

  lines.push("END:VEVENT");
  return lines;
}

export function buildCalendar(opts: {
  name: string;
  description: string;
  events: IcsEvent[];
  /** Fixed clock for tests; defaults to now. */
  now?: Date;
}): string {
  const stamp = utcStamp(opts.now ?? new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gap Year Platform//Deadlines//EN",
    "CALSCALE:GREGORIAN",
    // No METHOD: a subscription feed with METHOD:PUBLISH is treated by some
    // clients as an invitation to import once rather than a live feed.
    `X-WR-CALNAME:${escapeText(opts.name)}`,
    `X-WR-CALDESC:${escapeText(opts.description)}`,
    "X-PUBLISHED-TTL:PT12H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
  ];

  for (const e of opts.events) lines.push(...buildEvent(e, stamp));

  lines.push("END:VCALENDAR");

  // Trailing CRLF matters: a calendar whose final line is unterminated is
  // rejected by strict parsers.
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
