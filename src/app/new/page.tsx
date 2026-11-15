"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Idea, Question } from "../../lib/db";

type Type = "TALK" | "IDEA" | null;

export default function NewDate() {
  const router = useRouter();
  const [type, setType] = useState<Type>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (t: "TALK" | "IDEA", exclude: number[] = []) => {
    const res = await fetch(`/api/suggestions?type=${t}&exclude=${exclude.join(",")}`, { cache: "no-store" });
    const data = await res.json();
    if (t === "TALK") setQuestions(data); else setIdeas(data);
  }, []);

  useEffect(() => { if (type) load(type); }, [type, load]);

  async function create(body: object) {
    setBusy(true);
    const res = await fetch("/api/dates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const { id } = await res.json();
    router.push(`/dates/${id}`);
    router.refresh();
  }

  if (!type) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Яке побачення сьогодні?</h1>
        <button onClick={() => setType("TALK")} className="block w-full rounded-2xl bg-white p-6 text-left ring-1 ring-rose-100 hover:shadow-md">
          <div className="text-xl font-medium">💬 Розмова</div>
          <p className="mt-1 text-stone-500">Питання одне до одного — щоб поговорити по-справжньому.</p>
        </button>
        <button onClick={() => setType("IDEA")} className="block w-full rounded-2xl bg-white p-6 text-left ring-1 ring-rose-100 hover:shadow-md">
          <div className="text-xl font-medium">💡 Ідея</div>
          <p className="mt-1 text-stone-500">Кілька ідей, як провести час — оберіть одну й реалізуйте.</p>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={() => setType(null)} className="text-sm text-stone-500 hover:underline">← Інший тип</button>
      {type === "TALK" ? (
        <>
          <h1 className="text-2xl font-semibold">Питання для розмови</h1>
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-2xl bg-white p-4 ring-1 ring-rose-100">
                <span className="mr-2 font-semibold text-rose-500">{i + 1}.</span>{q.text}
                <div className="mt-1 text-xs text-stone-400">{q.category}</div>
              </li>
            ))}
          </ol>
          <div className="flex gap-3">
            <button disabled={busy} onClick={() => load("TALK", questions.map((q) => q.id))} className="rounded-full bg-white px-5 py-2 ring-1 ring-rose-200 hover:bg-rose-50">🔀 Інші питання</button>
            <button disabled={busy || !questions.length} onClick={() => create({ type: "TALK", questionIds: questions.map((q) => q.id) })} className="rounded-full bg-rose-500 px-5 py-2 font-medium text-white hover:bg-rose-600 disabled:opacity-50">Обрати ці питання</button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Оберіть ідею</h1>
          <ul className="space-y-3">
            {ideas.map((i) => (
              <li key={i.id}>
                <button disabled={busy} onClick={() => create({ type: "IDEA", ideaId: i.id })} className="block w-full rounded-2xl bg-white p-4 text-left ring-1 ring-rose-100 hover:shadow-md disabled:opacity-50">
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-stone-500">{i.description}</div>
                  <div className="mt-1 text-xs text-stone-400">{i.category}</div>
                </button>
              </li>
            ))}
          </ul>
          <button disabled={busy} onClick={() => load("IDEA", ideas.map((i) => i.id))} className="rounded-full bg-white px-5 py-2 ring-1 ring-rose-200 hover:bg-rose-50">🔀 Інші ідеї</button>
        </>
      )}
    </div>
  );
}
