import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { db, UPLOADS_DIR } from "../../../../lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const b = await req.json();
  const rating = b.rating == null || b.rating === "" ? null : Math.min(5, Math.max(1, Number(b.rating)));
  const doneAt = typeof b.doneAt === "string" && b.doneAt ? b.doneAt : new Date().toISOString().slice(0, 10);
  const r = db.prepare(
    "UPDATE dates SET status = 'DONE', done_at = ?, rating = ?, review = ? WHERE id = ?"
  ).run(doneAt, rating, b.review ? String(b.review) : null, Number(id));
  return r.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const photos = db.prepare("SELECT filename FROM photos WHERE date_id = ?").all(Number(id)) as { filename: string }[];
  photos.forEach((p) => fs.rmSync(path.join(UPLOADS_DIR, p.filename), { force: true }));
  db.prepare("DELETE FROM dates WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
