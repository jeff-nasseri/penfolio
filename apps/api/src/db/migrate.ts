import { hashPassword } from '../auth/password';
import { env } from '../env';
import { nowIso } from '../util/time';
import { getDb } from './connection';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS app_user (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  username        TEXT    NOT NULL,
  password_hash   TEXT    NOT NULL,
  profile_picture TEXT,
  about           TEXT    NOT NULL DEFAULT '',
  created_at      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS resume (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  tag           TEXT,
  content       TEXT    NOT NULL DEFAULT '{}',
  customization TEXT    NOT NULL DEFAULT '{}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS cover_letter (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  tag           TEXT,
  content       TEXT    NOT NULL DEFAULT '{}',
  customization TEXT    NOT NULL DEFAULT '{}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS job_column (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  color      TEXT    NOT NULL DEFAULT '#8B7BFF',
  stage      TEXT    NOT NULL DEFAULT 'applied',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS job_application (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  column_id    INTEGER NOT NULL REFERENCES job_column(id) ON DELETE CASCADE,
  company      TEXT    NOT NULL,
  role         TEXT    NOT NULL DEFAULT '',
  location     TEXT    NOT NULL DEFAULT '',
  source       TEXT    NOT NULL DEFAULT '',
  url          TEXT    NOT NULL DEFAULT '',
  salary       TEXT    NOT NULL DEFAULT '',
  notes        TEXT    NOT NULL DEFAULT '',
  applied_date TEXT    NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL,
  updated_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_application_column ON job_application(column_id);
`;

/** Data tables (everything except the user account), in dependency order. */
export const DATA_TABLES = ['resume', 'cover_letter', 'job_column', 'job_application'] as const;

/** A full export includes the data tables plus the user account. */
export const EXPORT_TABLES = [...DATA_TABLES, 'app_user'] as const;

/**
 * An import restores only the data tables. The user account (`app_user`) is
 * deliberately left out so importing a backup can never change the password or
 * lock you out.
 */
export const IMPORT_TABLES = [...DATA_TABLES] as const;

const DEFAULT_COLUMNS: { name: string; color: string; stage: string }[] = [
  { name: 'Saved', color: '#8AA0C2', stage: 'saved' },
  { name: 'Applied', color: '#8B7BFF', stage: 'applied' },
  { name: 'Interview', color: '#E8B45A', stage: 'interview' },
  { name: 'Offer', color: '#4ADE80', stage: 'offer' },
  { name: 'Rejected', color: '#F08C8C', stage: 'rejected' },
];

export function migrate(): void {
  const db = getDb();
  db.exec(SCHEMA);
  seedDefaultUser();
  seedDefaultColumns();
}

function seedDefaultUser(): void {
  const db = getDb();
  if (db.prepare('SELECT id FROM app_user WHERE id = 1').get()) return;
  db.prepare(
    `INSERT INTO app_user (id, username, password_hash, profile_picture, about, created_at)
     VALUES (1, ?, ?, NULL, '', ?)`,
  ).run(env.defaultUsername, hashPassword(env.defaultPassword), nowIso());
}

function seedDefaultColumns(): void {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) AS c FROM job_column').get() as { c: number }).c;
  if (count > 0) return;
  const insert = db.prepare(
    'INSERT INTO job_column (name, color, stage, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
  );
  const now = nowIso();
  DEFAULT_COLUMNS.forEach((c, i) => insert.run(c.name, c.color, c.stage, i, now));
}
