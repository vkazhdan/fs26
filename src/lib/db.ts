import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { QUESTIONS, IDEAS } from "./data";

const g = globalThis as unknown as { _db?: Database.Database };

function init(): Database.Database {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, "pobachennya.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, text TEXT NOT NULL UNIQUE, category TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE, description TEXT NOT NULL, category TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS dates (
      id INTEGER PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('TALK','IDEA')),
      status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','DONE')),
      title TEXT NOT NULL,
      idea_id INTEGER REFERENCES ideas(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      done_at TEXT, rating INTEGER, review TEXT
    );
    CREATE TABLE IF NOT EXISTS date_questions (
      date_id INTEGER NOT NULL REFERENCES dates(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id),
      position INTEGER NOT NULL,
      PRIMARY KEY (date_id, question_id)
    );
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY,
      date_id INTEGER NOT NULL REFERENCES dates(id) ON DELETE CASCADE,
      filename TEXT NOT NULL, mime TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const iq = db.prepare("INSERT OR IGNORE INTO questions (text, category) VALUES (?, ?)");
  const ii = db.prepare("INSERT OR IGNORE INTO ideas (title, description, category) VALUES (?, ?, ?)");
  db.transaction(() => {
    QUESTIONS.forEach((q) => iq.run(...q));
    IDEAS.forEach((i) => ii.run(...i));
  })();
  return db;
}

export const db = g._db ?? (g._db = init());
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export type DateRow = {
  id: number; type: "TALK" | "IDEA"; status: "PLANNED" | "DONE"; title: string;
  idea_id: number | null; created_at: string; done_at: string | null;
  rating: number | null; review: string | null;
};
export type Question = { id: number; text: string; category: string };
export type Idea = { id: number; title: string; description: string; category: string };
