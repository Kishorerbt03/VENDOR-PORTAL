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

interface GroupedPurchaseOrder {
  po_no: string;
  bsart: string;
  item_name?: string;
  quantity?: number;
  unit?: string;
  po_date: string;
  net_value: number;
  status: string;
  currency: string;
  items: PurchaseOrder[];
}

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
  typeFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);

  // Modal State
  selectedPo = signal<GroupedPurchaseOrder | null>(null);

  columns = ['po_no', 'bsart', 'item_name', 'quantity', 'unit', 'po_date', 'net_value', 'status', 'currency'];

  statusOptions = ['All', 'Open', 'Partially Delivered', 'Closed'];

  bsartOptions = computed(() => {
    const list = new Set(this.all().map(r => r.bsart));
    return ['All', ...Array.from(list).sort()];
  });

  // Group POs by po_no and sum net_value of items
  grouped = computed(() => {
    const raw = this.all();
    const map = new Map<string, PurchaseOrder[]>();
    for (const r of raw) {
      if (!map.has(r.po_no)) {
        map.set(r.po_no, []);
      }
      map.get(r.po_no)!.push(r);
    }

    const list: GroupedPurchaseOrder[] = [];
    for (const [po_no, items] of map.entries()) {
      const first = items[0];
      const totalNetValue = items.reduce((s, item) => s + item.net_value, 0);
      list.push({
        po_no,
        bsart: first.bsart,
        item_name: first.item_name,
        quantity: first.quantity,
        unit: first.unit,
        po_date: first.po_date,
        net_value: totalNetValue,
        status: first.status,
        currency: first.currency,
        items
      });
    }
    return list;
  });

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    const s = this.statusFilter();
    const t = this.typeFilter();
    return this.grouped().filter(r => {
      const matchText = !q || r.po_no.toLowerCase().includes(q)
        || r.bsart.toLowerCase().includes(q)
        || r.status.toLowerCase().includes(q)
        || r.items.some(item => item.item_name && item.item_name.toLowerCase().includes(q));
      const matchStatus = s === 'All' || r.status === s;
      const matchType = t === 'All' || r.bsart === t;
      return matchText && matchStatus && matchType;
    });
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  hasActiveFilters = computed(() => this.filter() !== '' || this.statusFilter() !== 'All' || this.typeFilter() !== 'All');

  summary = computed(() => {
    const d = this.grouped();
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
  setTypeFilter(val: string) { this.typeFilter.set(val); this.pageIndex.set(0); }
  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters() { 
    this.filter.set(''); 
    this.statusFilter.set('All'); 
    this.typeFilter.set('All'); 
    this.pageIndex.set(0); 
  }

  openDetails(po: GroupedPurchaseOrder) {
    this.selectedPo.set(po);
  }

  closeDetails() {
    this.selectedPo.set(null);
  }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }
}
