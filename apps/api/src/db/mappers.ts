import type {
  CoverLetterDocument,
  JobApplication,
  JobColumn,
  JobStage,
  ResumeDocument,
  UserProfile,
} from '@penfolio/shared';

/* eslint-disable @typescript-eslint/no-explicit-any */

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || raw === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function mapUser(row: any): UserProfile {
  return {
    id: row.id,
    username: row.username,
    profilePicture: row.profile_picture ?? null,
    about: row.about ?? '',
    createdAt: row.created_at,
  };
}

export function mapResume(row: any): ResumeDocument {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    content: parseJson(row.content, {} as ResumeDocument['content']),
    customization: parseJson(row.customization, {} as ResumeDocument['customization']),
  };
}

export function mapCoverLetter(row: any): CoverLetterDocument {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    content: parseJson(row.content, {} as CoverLetterDocument['content']),
    customization: parseJson(row.customization, {} as CoverLetterDocument['customization']),
  };
}

export function mapColumn(row: any): JobColumn {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    stage: row.stage as JobStage,
    sortOrder: row.sort_order,
  };
}

export function mapApplication(row: any): JobApplication {
  return {
    id: row.id,
    columnId: row.column_id,
    company: row.company,
    role: row.role,
    location: row.location,
    source: row.source,
    url: row.url,
    salary: row.salary,
    notes: row.notes,
    appliedDate: row.applied_date,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
