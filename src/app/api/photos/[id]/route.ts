import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { db, UPLOADS_DIR } from "../../../../lib/db";

type Ctx = { params: Promise<{ id: string }> };
const find = (id: string) =>
  db.prepare("SELECT filename, mime FROM photos WHERE id = ?").get(Number(id)) as { filename: string; mime: string } | undefined;

export async function GET(_req: NextRequest, { params }: Ctx) {
  const p = find((await params).id);
  if (!p) return new NextResponse("not found", { status: 404 });
  const file = path.join(UPLOADS_DIR, path.basename(p.filename));
  if (!fs.existsSync(file)) return new NextResponse("not found", { status: 404 });
  return new NextResponse(fs.readFileSync(file), { headers: { "Content-Type": p.mime, "Cache-Control": "private, max-age=31536000, immutable" } });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const p = find(id);
  if (p) {
    fs.rmSync(path.join(UPLOADS_DIR, path.basename(p.filename)), { force: true });
    db.prepare("DELETE FROM photos WHERE id = ?").run(Number(id));
  }
  return NextResponse.json({ ok: true });
}
