import { NextRequest, NextResponse } from "next/server";
import { db, type DateRow } from "../../../lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(db.prepare("SELECT * FROM dates ORDER BY created_at DESC, id DESC").all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.type === "TALK") {
    const ids: number[] = (body.questionIds ?? []).map(Number).filter(Number.isInteger);
    if (!ids.length) return NextResponse.json({ error: "no questions" }, { status: 400 });
    const id = db.transaction(() => {
      const r = db.prepare("INSERT INTO dates (type, title) VALUES ('TALK', 'Побачення-розмова')").run();
      const ins = db.prepare("INSERT INTO date_questions (date_id, question_id, position) VALUES (?, ?, ?)");
      ids.forEach((q, i) => ins.run(r.lastInsertRowid, q, i));
      return Number(r.lastInsertRowid);
    })();
    return NextResponse.json({ id }, { status: 201 });
  }
  if (body.type === "IDEA") {
    const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(Number(body.ideaId)) as { id: number; title: string } | undefined;
    if (!idea) return NextResponse.json({ error: "idea not found" }, { status: 400 });
    const r = db.prepare("INSERT INTO dates (type, title, idea_id) VALUES ('IDEA', ?, ?)").run(idea.title, idea.id);
    return NextResponse.json({ id: Number(r.lastInsertRowid) }, { status: 201 });
  }
  return NextResponse.json({ error: "bad type" }, { status: 400 });
}
export type { DateRow };
