import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import type { JobApplication, JobBoard, JobColumn, JobStage } from '@penfolio/shared';
import { JOB_STAGES } from '@penfolio/shared';
import { ApiService } from '../../core/api.service';
import { CountsService } from '../../core/counts.service';
import { Icon } from '../../shared/icon';
import { ToastService } from '../../shared/toast';
import { ConfirmService } from '../../shared/confirm';

const COLUMN_COLORS = ['#8AA0C2', '#8B7BFF', '#E8B45A', '#4ADE80', '#F08C8C', '#56C7D6', '#C58AF0', '#7C8493'];

interface AppForm extends Partial<JobApplication> {
  columnId: number;
}

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [FormsModule, RouterLink, CdkDropListGroup, CdkDropList, CdkDrag, Icon],
  templateUrl: './tracker.html',
  styleUrl: './tracker.scss',
})
export class Tracker implements OnInit {
  private readonly api = inject(ApiService);
  private readonly counts = inject(CountsService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly columns = signal<JobColumn[]>([]);
  readonly apps = signal<JobApplication[]>([]);
  readonly q = signal('');
  readonly loading = signal(true);

  readonly stages = JOB_STAGES.filter((s) => s.stage !== 'other');
  readonly colors = COLUMN_COLORS;

  // Modals
  readonly appModal = signal<{ form: AppForm; isNew: boolean } | null>(null);
  readonly colModal = signal<{ form: Partial<JobColumn>; isNew: boolean } | null>(null);

  readonly listIds = computed(() => this.columns().map((c) => 'col-' + c.id));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getBoard().subscribe({
      next: (b: JobBoard) => {
        this.columns.set([...b.columns].sort((a, c) => a.sortOrder - c.sortOrder));
        this.apps.set(b.applications);
        this.counts.set(b.applications.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  appsFor(columnId: number): JobApplication[] {
    const ql = this.q().trim().toLowerCase();
    return this.apps()
      .filter((a) => a.columnId === columnId)
      .filter((a) => !ql || a.company.toLowerCase().includes(ql) || a.role.toLowerCase().includes(ql))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  countFor(columnId: number): number {
    return this.apps().filter((a) => a.columnId === columnId).length;
  }

  when(a: JobApplication): string {
    const d = a.appliedDate || a.createdAt;
    if (!d) return '';
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days < 1) return 'today';
    if (days < 14) return `${days} days ago`;
    if (days < 56) return `${Math.round(days / 7)} weeks ago`;
    return `${Math.round(days / 30)} months ago`;
  }

  // ---- Drag & drop ----
  drop(event: CdkDragDrop<JobApplication[]>, targetColumn: JobColumn): void {
    const app = event.item.data as JobApplication;
    if (event.previousContainer === event.container) {
      const list = this.appsFor(targetColumn.id);
      moveItemInArray(list, event.previousIndex, event.currentIndex);
      this.persistOrder(list, targetColumn.id);
    } else {
      app.columnId = targetColumn.id;
      this.apps.update((all) => [...all]);
      const list = this.appsFor(targetColumn.id);
      // place dragged app at the drop index
      const without = list.filter((x) => x.id !== app.id);
      without.splice(event.currentIndex, 0, app);
      this.persistOrder(without, targetColumn.id);
      this.api.moveApplication(app.id, targetColumn.id, event.currentIndex).subscribe({
        error: () => this.load(),
      });
    }
  }

  private persistOrder(list: JobApplication[], columnId: number): void {
    list.forEach((a, i) => {
      a.sortOrder = i;
      a.columnId = columnId;
    });
    this.apps.update((all) => [...all]);
  }

  // ---- Application CRUD ----
  openNewApp(columnId: number): void {
    this.appModal.set({
      form: { columnId, company: '', role: '', location: '', source: '', url: '', salary: '', notes: '', appliedDate: '' },
      isNew: true,
    });
  }
  openEditApp(a: JobApplication): void {
    this.appModal.set({ form: { ...a }, isNew: false });
  }
  saveApp(): void {
    const m = this.appModal();
    if (!m || !m.form.company?.trim()) return;
    const f = m.form;
    if (m.isNew) {
      this.api
        .createApplication({
          columnId: f.columnId,
          company: f.company!,
          role: f.role,
          location: f.location,
          source: f.source,
          url: f.url,
          salary: f.salary,
          notes: f.notes,
          appliedDate: f.appliedDate,
        })
        .subscribe({
          next: () => {
            this.appModal.set(null);
            this.toast.success('Application added');
            this.load();
          },
          error: () => this.toast.error('Could not save'),
        });
    } else {
      this.api.updateApplication(f.id!, f).subscribe({
        next: () => {
          this.appModal.set(null);
          this.toast.success('Application updated');
          this.load();
        },
        error: () => this.toast.error('Could not save'),
      });
    }
  }
  async deleteApp(a: JobApplication): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete application',
      message: `Remove “${a.company}” from your tracker? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteApplication(a.id).subscribe({
      next: () => {
        this.appModal.set(null);
        this.load();
      },
    });
  }

  // ---- Column CRUD ----
  openNewColumn(): void {
    this.colModal.set({ form: { name: '', color: '#8B7BFF', stage: 'applied' }, isNew: true });
  }
  openEditColumn(c: JobColumn): void {
    this.colModal.set({ form: { ...c }, isNew: false });
  }
  saveColumn(): void {
    const m = this.colModal();
    if (!m || !m.form.name?.trim()) return;
    const f = m.form;
    if (m.isNew) {
      this.api.createColumn({ name: f.name!, color: f.color, stage: f.stage as JobStage }).subscribe({
        next: () => {
          this.colModal.set(null);
          this.load();
        },
      });
    } else {
      this.api.updateColumn(f.id!, { name: f.name, color: f.color, stage: f.stage as JobStage }).subscribe({
        next: () => {
          this.colModal.set(null);
          this.load();
        },
      });
    }
  }
  async deleteColumn(c: JobColumn): Promise<void> {
    const n = this.countFor(c.id);
    const ok = await this.confirm.ask({
      title: 'Delete column',
      message: n
        ? `“${c.name}” has ${n} application(s). Deleting the column removes them too.`
        : `Delete the “${c.name}” column?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteColumn(c.id).subscribe({
      next: () => {
        this.colModal.set(null);
        this.load();
      },
    });
  }

  stageColor(stage: JobStage): string {
    return JOB_STAGES.find((s) => s.stage === stage)?.color ?? '#8B7BFF';
  }
}
