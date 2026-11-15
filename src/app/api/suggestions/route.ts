import { NextRequest, NextResponse } from "next/server";
import { suggestIdeas, suggestQuestions } from "../../../lib/suggestions";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const exclude = (req.nextUrl.searchParams.get("exclude") ?? "")
    .split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  if (type === "TALK") return NextResponse.json(suggestQuestions(5, exclude));
  if (type === "IDEA") return NextResponse.json(suggestIdeas(4, exclude));
  return NextResponse.json({ error: "bad type" }, { status: 400 });
}
