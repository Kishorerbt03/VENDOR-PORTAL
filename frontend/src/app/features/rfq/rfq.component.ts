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
import { PoService } from '../../core/services/po.service';
import { RFQ } from '../../shared/models/vendor.models';

interface GroupedRFQ {
  rfq_no: string;
  bsart: string;
  item_name?: string;
  quantity?: number;
  unit?: string;
  rfq_date: string;
  purchasing_org: string;
  status: string;
  items: RFQ[];
}

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss'],
})
export class RfqComponent implements OnInit {
  loading = signal(true);
  all = signal<RFQ[]>([]);
  filter = signal('');
  statusFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);

  // Modal State
  selectedRfq = signal<GroupedRFQ | null>(null);

  statusOptions = ['All', 'Open', 'Quoted', 'Closed'];

  columns = ['rfq_no', 'bsart', 'item_name', 'quantity', 'unit', 'rfq_date', 'purchasing_org', 'status'];

  // Group by document no
  grouped = computed(() => {
    const raw = this.all();
    const map = new Map<string, RFQ[]>();
    for (const r of raw) {
      if (!map.has(r.rfq_no)) {
        map.set(r.rfq_no, []);
      }
      map.get(r.rfq_no)!.push(r);
    }

    const list: GroupedRFQ[] = [];
    for (const [rfq_no, items] of map.entries()) {
      const first = items[0];
      list.push({
        rfq_no,
        bsart: first.bsart,
        item_name: first.item_name,
        quantity: first.quantity,
        unit: first.unit,
        rfq_date: first.rfq_date,
        purchasing_org: first.purchasing_org,
        status: first.status,
        items
      });
    }
    return list;
  });

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    const s = this.statusFilter();
    return this.grouped().filter(r => {
      const matchText = !q || r.rfq_no.toLowerCase().includes(q)
        || r.bsart.toLowerCase().includes(q)
        || r.purchasing_org.toLowerCase().includes(q)
        || r.items.some(item => item.item_name && item.item_name.toLowerCase().includes(q));
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
    const d = this.grouped();
    return {
      total: d.length,
    };
  });

  constructor(private api: PoService) {}

  ngOnInit() {
    this.api.getRFQ().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setFilter(val: string) { this.filter.set(val); this.pageIndex.set(0); }
  setStatusFilter(val: string) { this.statusFilter.set(val); this.pageIndex.set(0); }
  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters() { this.filter.set(''); this.statusFilter.set('All'); this.pageIndex.set(0); }

  openDetails(rfq: GroupedRFQ) {
    this.selectedRfq.set(rfq);
  }

  closeDetails() {
    this.selectedRfq.set(null);
  }

  badgeClass(status: string) {
    return { 'Open': 'open', 'RFQ': 'open', 'Quoted': 'quoted', 'Closed': 'closed' }[status] ?? 'closed';
  }
}
