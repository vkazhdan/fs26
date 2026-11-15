import Link from "next/link";
import { db, type DateRow } from "../lib/db";

export const dynamic = "force-dynamic";

const fmt = (s: string) => new Date(s.replace(" ", "T")).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });

export default async function Home({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const { type, status } = await searchParams;
  const where: string[] = [];
  const args: string[] = [];
  if (type === "TALK" || type === "IDEA") { where.push("type = ?"); args.push(type); }
  if (status === "PLANNED" || status === "DONE") { where.push("status = ?"); args.push(status); }
  const rows = db.prepare(
    `SELECT * FROM dates ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC, id DESC`
  ).all(...args) as DateRow[];

  const chip = (label: string, href: string, active: boolean) => (
    <Link key={label} href={href} className={`rounded-full px-3 py-1 text-sm ${active ? "bg-rose-500 text-white" : "bg-white text-stone-600 ring-1 ring-rose-100"}`}>{label}</Link>
  );
  const q = (t?: string, s?: string) => {
    const p = new URLSearchParams();
    if (t) p.set("type", t);
    if (s) p.set("status", s);
    const str = p.toString();
    return str ? `/?${str}` : "/";
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Історія побачень</h1>
      <div className="flex flex-wrap gap-2">
        {chip("Усі", q(undefined, status), !type)}
        {chip("💬 Розмова", q("TALK", status), type === "TALK")}
        {chip("💡 Ідея", q("IDEA", status), type === "IDEA")}
        <span className="mx-1 text-stone-300">|</span>
        {chip("Будь-який статус", q(type), !status)}
        {chip("Заплановані", q(type, "PLANNED"), status === "PLANNED")}
        {chip("Виконані", q(type, "DONE"), status === "DONE")}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-rose-100">
          <p className="mb-4 text-stone-500">Тут поки порожньо. Час запланувати перше побачення!</p>
          <Link href="/new" className="rounded-full bg-rose-500 px-5 py-2 font-medium text-white hover:bg-rose-600">Створити побачення</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((d) => (
            <li key={d.id}>
              <Link href={`/dates/${d.id}`} className="block rounded-2xl bg-white p-4 ring-1 ring-rose-100 transition hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{d.type === "TALK" ? "💬" : "💡"} {d.title}</div>
                    <div className="text-sm text-stone-500">
                      {d.status === "DONE" && d.done_at ? `Відбулось ${fmt(d.done_at)}` : `Створено ${fmt(d.created_at)}`}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {d.status === "DONE" ? (
                      <span className="text-amber-500">{"★".repeat(d.rating ?? 0)}{"☆".repeat(5 - (d.rating ?? 0))}</span>
                    ) : (
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-600">заплановано</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
