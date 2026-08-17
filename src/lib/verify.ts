import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_EXTRACTION_MODEL || "claude-sonnet-4-6";

let anthropic: Anthropic | null = null;
function client(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

export type ExtractedDeadline = {
  cycle_label: string;
  kind: "national" | "campus" | "intent_to_apply" | "opens" | "rolling";
  due_at: string | null;
  source_tz: string | null;
  note: string | null;
};

export type Extraction = {
  deadlines: ExtractedDeadline[];
  pay_low: number | null;
  pay_high: number | null;
  pay_note: string | null;
  min_age: number | null;
  max_age: number | null;
  suspension_language: string | null;
};

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18000);
}

const SYSTEM_PROMPT = `You extract structured facts about a gap-year / post-grad program from a fetched web page. Output JSON only. No prose, no markdown code fences, no explanation — the raw JSON object and nothing else. If a field cannot be determined from the page, use null (or an empty array for deadlines). Never invent a date or number that is not present in the source text.

Output shape exactly:
{
  "deadlines": [{"cycle_label": string, "kind": "national"|"campus"|"intent_to_apply"|"opens"|"rolling", "due_at": string|null (ISO8601 with UTC offset, null if rolling/unknown), "source_tz": string|null, "note": string|null}],
  "pay_low": integer cents or null,
  "pay_high": integer cents or null,
  "pay_note": string or null,
  "min_age": integer or null,
  "max_age": integer or null,
  "suspension_language": string or null (a short quote from the page if it mentions the program being paused, suspended, cancelled, defunded, or not accepting applications this cycle; null otherwise)
}`;

// Never throws on a bad extraction — returns null so the caller can leave
// the stored record untouched, per spec: "Parse defensively. On parse
// failure, leave the record untouched and log."
export async function fetchAndExtract(sourceUrl: string, programName: string): Promise<Extraction | null> {
  const c = client();
  if (!c) {
    console.error(`[verify] ANTHROPIC_API_KEY not set, skipping extraction for ${programName}`);
    return null;
  }

  let text: string;
  try {
    const res = await fetch(sourceUrl, { redirect: "follow" });
    if (!res.ok) {
      console.error(`[verify] fetch ${sourceUrl} -> ${res.status}`);
      return null;
    }
    text = htmlToText(await res.text());
  } catch (err) {
    console.error(`[verify] fetch failed for ${sourceUrl}:`, err);
    return null;
  }

  try {
    const msg = await c.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Program: ${programName}\nSource URL: ${sourceUrl}\n\nPage text:\n${text}`,
        },
      ],
    });
    const block = msg.content[0];
    if (block.type !== "text") return null;
    const raw = block.text.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(raw) as Extraction;
    if (!Array.isArray(parsed.deadlines)) return null;
    return parsed;
  } catch (err) {
    console.error(`[verify] extraction failed for ${programName}:`, err);
    return null;
  }
}
