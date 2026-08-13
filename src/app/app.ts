import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReportStore } from './core/report.store';
import { Severity } from './core/report.models';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly store = inject(ReportStore);
  private readonly http = inject(HttpClient);
  protected readonly dragging = signal(false);
  protected readonly darkMode = signal(true);
  protected readonly severities: Array<Severity | 'ALL'> = ['ALL', 'BLOCK', 'WARN', 'PASS'];

  protected async openFile(file: File | undefined): Promise<void> {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json') && !file.name.toLowerCase().endsWith('.sarif')) {
      this.store.error.set('Choose a .json or .sarif report file.');
      return;
    }
    this.store.load(await file.text());
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    void this.openFile(event.dataTransfer?.files[0]);
  }

  protected loadSample(): void {
    this.http.get('samples/repoready-sample.json', { responseType: 'text' }).subscribe({
      next: (content) => this.store.load(content),
      error: () => this.store.error.set('The sample report could not be loaded.'),
    });
  }

  protected toggleTheme(): void {
    this.darkMode.update((value) => !value);
  }

  protected selectSeverity(severity: Severity | 'ALL'): void {
    this.store.severity.set(severity);
  }

  protected countFor(severity: Severity | 'ALL'): number {
    if (severity === 'ALL') return this.store.report()?.findings.length ?? 0;
    return this.store.counts()[severity];
  }

  protected percent(severity: Severity): number {
    const total = this.store.report()?.findings.length || 1;
    return (this.store.counts()[severity] / total) * 100;
  }

  @HostListener('document:keydown.escape')
  protected closeDetails(): void {
    this.store.selectedId.set(null);
  }
}

