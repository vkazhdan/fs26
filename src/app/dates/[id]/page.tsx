import Link from "next/link";
import { notFound } from "next/navigation";
import { db, type DateRow, type Idea, type Question } from "../../../lib/db";
import DateActions from "../../../components/DateActions";

export const dynamic = "force-dynamic";

export default async function DatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = db.prepare("SELECT * FROM dates WHERE id = ?").get(Number(id)) as DateRow | undefined;
  if (!d) notFound();
  const questions = db.prepare(
    "SELECT q.* FROM date_questions dq JOIN questions q ON q.id = dq.question_id WHERE dq.date_id = ? ORDER BY dq.position"
  ).all(d.id) as Question[];
  const idea = d.idea_id ? (db.prepare("SELECT * FROM ideas WHERE id = ?").get(d.idea_id) as Idea) : null;
  const photos = db.prepare("SELECT id FROM photos WHERE date_id = ? ORDER BY id").all(d.id) as { id: number }[];

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-stone-500 hover:underline">← Історія</Link>
      <h1 className="text-2xl font-semibold">{d.type === "TALK" ? "💬" : "💡"} {d.title}</h1>

      {idea && (
        <div className="rounded-2xl bg-white p-4 ring-1 ring-rose-100">
          <p>{idea.description}</p>
          <div className="mt-1 text-xs text-stone-400">{idea.category}</div>
        </div>
      )}
      {questions.length > 0 && (
        <ol className="space-y-3">
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-2xl bg-white p-4 ring-1 ring-rose-100">
              <span className="mr-2 font-semibold text-rose-500">{i + 1}.</span>{q.text}
            </li>
          ))}
        </ol>
      )}

      <DateActions
        id={d.id}
        status={d.status}
        doneAt={d.done_at}
        rating={d.rating}
        review={d.review}
        photoIds={photos.map((p) => p.id)}
      />
    </div>
  );
}
