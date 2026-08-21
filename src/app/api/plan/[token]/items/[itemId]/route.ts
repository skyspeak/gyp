import { NextRequest, NextResponse } from "next/server";
import { getPlanByToken, removePlanItem, updatePlanItem } from "@/lib/plans";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;
  const plan = await getPlanByToken(token);
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  await updatePlanItem(plan.id, itemId, {
    startsOn: body?.startsOn === undefined ? undefined : body.startsOn || null,
    endsOn: body?.endsOn === undefined ? undefined : body.endsOn || null,
    note: body?.note === undefined ? undefined : String(body.note).trim().slice(0, 500) || null,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> }
) {
  const { token, itemId } = await params;
  const plan = await getPlanByToken(token);
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  await removePlanItem(plan.id, itemId);
  return NextResponse.json({ ok: true });
}
