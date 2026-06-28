import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  AboutInfo,
  AnalyticsResponse,
  CoverLetterDocument,
  CoverLetterInput,
  DatabaseExport,
  ImportResult,
  JobApplication,
  JobApplicationInput,
  JobBoard,
  JobColumn,
  JobColumnInput,
  PurgeResult,
  ResumeDocument,
  ResumeInput,
} from '@penfolio/shared';

/**
 * Thin typed wrapper over the PenFolio REST API. Every feature injects this
 * service rather than calling HttpClient directly, so the API surface lives in
 * one place and matches the shared contract types.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  // ---- Résumés ----
  listResumes(): Observable<ResumeDocument[]> {
    return this.http.get<ResumeDocument[]>(`${this.base}/resumes`);
  }
  getResume(id: number): Observable<ResumeDocument> {
    return this.http.get<ResumeDocument>(`${this.base}/resumes/${id}`);
  }
  createResume(input: ResumeInput): Observable<ResumeDocument> {
    return this.http.post<ResumeDocument>(`${this.base}/resumes`, input);
  }
  updateResume(id: number, input: ResumeInput): Observable<ResumeDocument> {
    return this.http.put<ResumeDocument>(`${this.base}/resumes/${id}`, input);
  }
  duplicateResume(id: number): Observable<ResumeDocument> {
    return this.http.post<ResumeDocument>(`${this.base}/resumes/${id}/duplicate`, {});
  }
  deleteResume(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/resumes/${id}`);
  }

  // ---- Cover letters ----
  listCoverLetters(): Observable<CoverLetterDocument[]> {
    return this.http.get<CoverLetterDocument[]>(`${this.base}/cover-letters`);
  }
  getCoverLetter(id: number): Observable<CoverLetterDocument> {
    return this.http.get<CoverLetterDocument>(`${this.base}/cover-letters/${id}`);
  }
  createCoverLetter(input: CoverLetterInput): Observable<CoverLetterDocument> {
    return this.http.post<CoverLetterDocument>(`${this.base}/cover-letters`, input);
  }
  updateCoverLetter(id: number, input: CoverLetterInput): Observable<CoverLetterDocument> {
    return this.http.put<CoverLetterDocument>(`${this.base}/cover-letters/${id}`, input);
  }
  duplicateCoverLetter(id: number): Observable<CoverLetterDocument> {
    return this.http.post<CoverLetterDocument>(`${this.base}/cover-letters/${id}/duplicate`, {});
  }
  deleteCoverLetter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cover-letters/${id}`);
  }

  // ---- Job tracker ----
  getBoard(): Observable<JobBoard> {
    return this.http.get<JobBoard>(`${this.base}/tracker`);
  }
  createColumn(input: JobColumnInput): Observable<JobColumn> {
    return this.http.post<JobColumn>(`${this.base}/tracker/columns`, input);
  }
  updateColumn(id: number, input: Partial<JobColumnInput>): Observable<JobColumn> {
    return this.http.put<JobColumn>(`${this.base}/tracker/columns/${id}`, input);
  }
  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tracker/columns/${id}`);
  }
  reorderColumns(ids: number[]): Observable<JobColumn[]> {
    return this.http.put<JobColumn[]>(`${this.base}/tracker/columns/reorder`, { ids });
  }
  createApplication(input: JobApplicationInput): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${this.base}/tracker/applications`, input);
  }
  updateApplication(id: number, input: Partial<JobApplicationInput>): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.base}/tracker/applications/${id}`, input);
  }
  moveApplication(id: number, columnId: number, sortOrder: number): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.base}/tracker/applications/${id}/move`, {
      columnId,
      sortOrder,
    });
  }
  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tracker/applications/${id}`);
  }

  // ---- Analytics ----
  getAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.base}/analytics`);
  }

  // ---- Settings ----
  getAbout(): Observable<AboutInfo> {
    return this.http.get<AboutInfo>(`${this.base}/settings/about`);
  }
  exportData(): Observable<DatabaseExport> {
    return this.http.get<DatabaseExport>(`${this.base}/settings/export`);
  }
  importData(data: DatabaseExport): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.base}/settings/import`, data);
  }
  purge(): Observable<PurgeResult> {
    return this.http.post<PurgeResult>(`${this.base}/settings/purge`, {});
  }
}
