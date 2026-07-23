import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.1-flash-lite";

type VisionCheckResult = {
  valid: boolean;
  reason: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const path = typeof body?.path === "string" ? body.path : "";

    if (!path) {
      return NextResponse.json({ error: "Missing uploaded photo path." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Invalid photo path." }, { status: 403 });
    }

    const { data: file, error: downloadError } = await supabase.storage
      .from("student-id-photos")
      .download(path);

    if (downloadError || !file) {
      console.error("Student ID verification: storage download failed", downloadError);
      return NextResponse.json({ error: "Could not read the uploaded photo." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const result = await checkStudentId(base64, mimeType);

    if (!result) {
      return NextResponse.json(
        { valid: false, reason: "Couldn't analyze the photo right now. Please try again." },
        { status: 200 },
      );
    }

    if (result.valid) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          student_id_verified: true,
          student_id_verified_at: new Date().toISOString(),
          student_id_image_path: path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Student ID verification: profile update failed", updateError);
        return NextResponse.json({ error: "Could not save verification status." }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Student ID verification: unhandled error", error);
    return NextResponse.json(
      { valid: false, error: "Something went wrong verifying your ID. Please try again." },
      { status: 500 },
    );
  }
}

async function checkStudentId(base64Image: string, mimeType: string): Promise<VisionCheckResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_key") return null;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "Set Thwal Student ID Verification",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You verify photos of student ID cards for University of Information Technology (UIT), Myanmar, for a signup flow. A photo is valid ONLY if it is a card-like document that visibly shows the exact Burmese institution name 'သတင်းအချက်အလက်နည်းပညာတက္ကသိုလ်' somewhere on it, along with a photo of a person and a name field. The English name 'University of Information Technology' alone, without the Burmese text also being present, is NOT sufficient — the Burmese institution name specifically must be legible in the photo. If that Burmese text is missing, illegible, or the card is from a different school, mark it invalid. A blue diamond-shaped 'UIT' logo alone is also not sufficient without the Burmese text. Be lenient about glare, angle, lighting, rotation, or partial crops of the rest of the card, but the Burmese institution name must actually be readable somewhere in the photo. Respond only with JSON matching the schema.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Does this photo show a valid University of Information Technology (UIT) student ID card with the Burmese institution name 'သတင်းအချက်အလက်နည်းပညာတက္ကသိုလ်' visible on it?",
              },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "student_id_check",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                valid: { type: "boolean" },
                reason: { type: "string" },
              },
              required: ["valid", "reason"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      console.warn("Student ID verification request failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const content = getMessageContent(data);
    if (!content) return null;

    const parsed = JSON.parse(content) as VisionCheckResult;
    if (typeof parsed.valid !== "boolean") return null;

    return { valid: parsed.valid, reason: parsed.reason ?? "" };
  } catch (error) {
    console.warn("Student ID verification: request threw", error);
    return null;
  }
}

function getMessageContent(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") return null;
  const message = (firstChoice as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;
  const content = (message as { content?: unknown }).content;

  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return null;

  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}
