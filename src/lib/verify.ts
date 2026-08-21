import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// The extraction step is a narrow job — page text in, one JSON object out — so
// it doesn't much matter who does it. Provider is chosen by whichever key is
// present, so deploying with either key just works. GEMINI_API_KEY wins if both
// are set. Everything downstream (the diffing, the review queue, the rule that
// nothing auto-publishes) is provider-independent.
type Provider = "gemini" | "anthropic";

function activeProvider(): Provider | null {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

const GEMINI_MODEL = process.env.GEMINI_EXTRACTION_MODEL || "gemini-2.5-flash";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_EXTRACTION_MODEL || "claude-sonnet-4-6";

let anthropic: Anthropic | null = null;
let gemini: GoogleGenAI | null = null;

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
  const provider = activeProvider();
  if (!provider) {
    console.error(
      `[verify] no extraction key set (GEMINI_API_KEY or ANTHROPIC_API_KEY), skipping ${programName}`
    );
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

  const userPrompt = `Program: ${programName}\nSource URL: ${sourceUrl}\n\nPage text:\n${text}`;

  try {
    let raw: string | undefined;

    if (provider === "gemini") {
      if (!gemini) gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const res = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          // Guarantees parseable output rather than relying on the model to
          // skip the code fences the prompt already asks it to omit.
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        },
      });
      raw = res.text;
    } else {
      if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });
      const block = msg.content[0];
      raw = block.type === "text" ? block.text : undefined;
    }

    if (!raw) return null;
    // Strip fences defensively: responseMimeType makes them unlikely on the
    // Gemini path, but the Anthropic path has no such guarantee.
    const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as Extraction;
    if (!Array.isArray(parsed.deadlines)) return null;
    return parsed;
  } catch (err) {
    console.error(`[verify] extraction failed for ${programName} via ${provider}:`, err);
    return null;
  }
}
