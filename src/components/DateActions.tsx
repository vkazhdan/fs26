"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { id: number; status: "PLANNED" | "DONE"; doneAt: string | null; rating: number | null; review: string | null; photoIds: number[] };

export default function DateActions({ id, status, doneAt, rating: r0, review: rv0, photoIds }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(doneAt ?? new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState(r0 ?? 5);
  const [review, setReview] = useState(rv0 ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const done = status === "DONE";

  async function save() {
    setBusy(true);
    await fetch(`/api/dates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doneAt: date, rating, review }) });
    if (files.length) {
      const fd = new FormData();
      files.forEach((f) => fd.append("photos", f));
      await fetch(`/api/dates/${id}/photos`, { method: "POST", body: fd });
    }
    setFiles([]); setOpen(false); setEditing(false); setBusy(false);
    router.refresh();
  }
  async function removePhoto(pid: number) {
    await fetch(`/api/photos/${pid}`, { method: "DELETE" });
    router.refresh();
  }
  async function remove() {
    if (!confirm("Видалити це побачення?")) return;
    await fetch(`/api/dates/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const showForm = open || editing;

  return (
    <div className="space-y-4">
      {done && !editing && (
        <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-rose-100">
          <div className="text-sm text-stone-500">Відбулось: {doneAt && new Date(doneAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}</div>
          <div className="text-amber-500">{"★".repeat(r0 ?? 0)}{"☆".repeat(5 - (r0 ?? 0))}</div>
          {rv0 && <p className="whitespace-pre-wrap">{rv0}</p>}
        </div>
      )}

      {photoIds.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photoIds.map((pid) => (
            <div key={pid} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos/${pid}`} alt="Фото з побачення" className="aspect-square w-full rounded-xl object-cover" />
              <button onClick={() => removePhoto(pid)} title="Видалити фото" className="absolute right-1 top-1 rounded-full bg-black/50 px-2 text-white">×</button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-rose-100">
          <label className="block text-sm">Дата
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-lg border border-stone-200 p-2" />
          </label>
          <div>
            <div className="mb-1 text-sm">Наскільки було класно?</div>
            <div className="flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? "text-amber-400" : "text-stone-300"}>★</button>
              ))}
            </div>
          </div>
          <label className="block text-sm">Відгук
            <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={4} placeholder="Як усе пройшло?" className="mt-1 block w-full rounded-lg border border-stone-200 p-2" />
          </label>
          <label className="block text-sm">Фото
            <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="mt-1 block w-full text-sm" />
          </label>
          <div className="flex gap-3">
            <button onClick={save} disabled={busy} className="rounded-full bg-rose-500 px-5 py-2 font-medium text-white hover:bg-rose-600 disabled:opacity-50">Зберегти</button>
            <button onClick={() => { setOpen(false); setEditing(false); }} className="rounded-full px-5 py-2 text-stone-500">Скасувати</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          {done ? (
            <button onClick={() => setEditing(true)} className="rounded-full bg-white px-5 py-2 ring-1 ring-rose-200 hover:bg-rose-50">Редагувати відгук / додати фото</button>
          ) : (
            <button onClick={() => setOpen(true)} className="rounded-full bg-rose-500 px-5 py-2 font-medium text-white hover:bg-rose-600">✓ Відмітити виконаним</button>
          )}
          <button onClick={remove} className="rounded-full px-5 py-2 text-stone-400 hover:text-red-500">Видалити</button>
        </div>
      )}
    </div>
  );
}
