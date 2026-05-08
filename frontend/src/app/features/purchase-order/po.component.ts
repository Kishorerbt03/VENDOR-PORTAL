import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PoService } from '../../core/services/po.service';
import { PurchaseOrder } from '../../shared/models/vendor.models';

@Component({
  selector: 'app-po',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './po.component.html',
  styleUrls: ['./po.component.scss'],
})
export class PoComponent implements OnInit {
  loading = signal(true);
  all = signal<PurchaseOrder[]>([]);
  filter = signal('');
  statusFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);

  columns = ['po_no', 'bsart', 'po_date', 'net_value', 'status', 'currency'];

  statusOptions = ['All', 'Open', 'Partially Delivered', 'Closed'];

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    const s = this.statusFilter();
    return this.all().filter(r => {
      const matchText = !q || r.po_no.toLowerCase().includes(q)
        || r.bsart.toLowerCase().includes(q)
        || r.status.toLowerCase().includes(q);
      const matchStatus = s === 'All' || r.status === s;
      return matchText && matchStatus;
    });
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  hasActiveFilters = computed(() => this.filter() !== '' || this.statusFilter() !== 'All');

  summary = computed(() => {
    const d = this.all();
    return {
      total: d.length,
      open: d.filter(r => r.status === 'Open').length,
      value: d.reduce((s, r) => s + r.net_value, 0),
      openValue: d.filter(r => r.status === 'Open').reduce((s, r) => s + r.net_value, 0),
    };
  });

  constructor(private api: PoService) {}

  ngOnInit() {
    this.api.getPO().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setFilter(val: string) { this.filter.set(val); this.pageIndex.set(0); }
  setStatusFilter(val: string) { this.statusFilter.set(val); this.pageIndex.set(0); }
  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters() { this.filter.set(''); this.statusFilter.set('All'); this.pageIndex.set(0); }



  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }
}
