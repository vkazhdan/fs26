import { db, type Question, type Idea } from "./db";

// Випадкові елементи, яких ще не було в історії; коли банк вичерпано — беремо з усіх.
export function suggestQuestions(count = 5, exclude: number[] = []): Question[] {
  const ex = exclude.length ? exclude.join(",") : "0";
  let rows = db.prepare(
    `SELECT * FROM questions WHERE id NOT IN (SELECT question_id FROM date_questions) AND id NOT IN (${ex}) ORDER BY RANDOM() LIMIT ?`
  ).all(count) as Question[];
  if (rows.length < count) {
    const have = [...exclude, ...rows.map((r) => r.id)];
    const more = db.prepare(
      `SELECT * FROM questions WHERE id NOT IN (${have.join(",") || "0"}) ORDER BY RANDOM() LIMIT ?`
    ).all(count - rows.length) as Question[];
    rows = rows.concat(more);
  }
  return rows;
}

export function suggestIdeas(count = 4, exclude: number[] = []): Idea[] {
  const ex = exclude.length ? exclude.join(",") : "0";
  let rows = db.prepare(
    `SELECT * FROM ideas WHERE id NOT IN (SELECT idea_id FROM dates WHERE idea_id IS NOT NULL) AND id NOT IN (${ex}) ORDER BY RANDOM() LIMIT ?`
  ).all(count) as Idea[];
  if (rows.length < count) {
    const have = [...exclude, ...rows.map((r) => r.id)];
    const more = db.prepare(
      `SELECT * FROM ideas WHERE id NOT IN (${have.join(",") || "0"}) ORDER BY RANDOM() LIMIT ?`
    ).all(count - rows.length) as Idea[];
    rows = rows.concat(more);
  }
  return rows;
}
