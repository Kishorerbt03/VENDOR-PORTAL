import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { FinanceService } from '../../../core/services/finance.service';
import { LoginService } from '../../../core/services/login.service';
import { AgingRow } from '../../../shared/models/vendor.models';


Chart.register(...registerables);

@Component({
  selector: 'app-aging',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatFormFieldModule,
    MatSelectModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  templateUrl: './aging.component.html',
  styleUrls: ['./aging.component.scss'],
})
export class AgingComponent implements OnInit {
  loading = signal(true);
  rows = signal<AgingRow[]>([]);
  summary = signal<Record<string, number>>({});
  bucketFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);

  columns = ['belnr', 'bldat', 'faedt', 'dmbtr', 'aging_days', 'aging_bucket'];

  buckets = computed(() => ['All', ...Object.keys(this.summary())]);

  filtered = computed(() => {
    const b = this.bucketFilter();
    return b === 'All' ? this.rows() : this.rows().filter(r => r.aging_bucket === b);
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  hasActiveFilters = computed(() => this.bucketFilter() !== 'All');

  barData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 },
        callback: (v) => '₹' + Number(v).toLocaleString('en-IN') } },
    },
  };

  totalOutstanding = computed(() => this.rows().reduce((s, r) => s + r.dmbtr, 0));

  constructor(private api: FinanceService, private loginSvc: LoginService) {
    const vid = this.loginSvc.vendorId;
    if (vid) this.loadAging(vid);
  }

  ngOnInit() {}

  private loadAging(vendorId: string) {
    console.log('[AgingComponent] loading for vendorId:', vendorId);
    this.api.getAging(vendorId).subscribe({
      next: res => {
        console.log('[AgingComponent] got res:', res?.data?.length, 'rows', res?.summary);
        this.rows.set(res.data || []);
        this.summary.set(res.summary || {});
        const entries = Object.entries(res.summary || {});
        this.barData.set({
          labels: entries.map(([k]) => k),
          datasets: [{
            data: entries.map(([, v]) => v),
            backgroundColor: ['#43a047', '#fb8c00', '#ef5350', '#c62828'],
            borderRadius: 6,
          }],
        });
        this.loading.set(false);
      },
      error: (err) => { console.error('[AgingComponent] error:', err); this.loading.set(false); },
    });
  }

  setBucketFilter(val: string) { this.bucketFilter.set(val); this.pageIndex.set(0); }
  onPage(e: PageEvent)         { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters()               { this.bucketFilter.set('All'); this.pageIndex.set(0); }

  bucketClass(b: string) {
    if (b === 'Not Due')     return 'bucket-blue';
    if (b.includes('0–30'))  return 'bucket-green';
    if (b.includes('31–60')) return 'bucket-orange';
    return 'bucket-red';
  }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }
}
