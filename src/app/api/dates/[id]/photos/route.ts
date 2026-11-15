import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db, UPLOADS_DIR } from "../../../../../lib/db";

const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/heic": ".heic" };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exists = db.prepare("SELECT 1 FROM dates WHERE id = ?").get(Number(id));
  if (!exists) return NextResponse.json({ error: "not found" }, { status: 404 });
  const form = await req.formData();
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const ids: number[] = [];
  for (const f of form.getAll("photos")) {
    if (!(f instanceof File) || !EXT[f.type] || f.size > 15 * 1024 * 1024) continue;
    const filename = crypto.randomUUID() + EXT[f.type];
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(await f.arrayBuffer()));
    const r = db.prepare("INSERT INTO photos (date_id, filename, mime) VALUES (?, ?, ?)").run(Number(id), filename, f.type);
    ids.push(Number(r.lastInsertRowid));
  }
  return NextResponse.json({ ids }, { status: 201 });
}
