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
import { GoodsReceipt } from '../../shared/models/vendor.models';

interface GroupedGoodsReceipt {
  gr_no: string;
  gr_year: string;
  item_name?: string;
  material: string;
  gr_date: string;
  quantity: number;
  uom: string;
  items: GoodsReceipt[];
}

@Component({
  selector: 'app-gr',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './gr.component.html',
  styleUrls: ['./gr.component.scss'],
})
export class GrComponent implements OnInit {
  loading = signal(true);
  all = signal<GoodsReceipt[]>([]);
  filter = signal('');
  yearFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);

  // Modal State
  selectedGr = signal<GroupedGoodsReceipt | null>(null);

  columns = ['gr_no', 'gr_year', 'item_name', 'material', 'gr_date', 'quantity', 'uom'];

  years = computed(() => {
    const list = new Set(this.all().map(r => r.gr_year));
    return ['All', ...Array.from(list).sort().reverse()];
  });

  // Group GR by gr_no and sum quantities of items
  grouped = computed(() => {
    const raw = this.all();
    const map = new Map<string, GoodsReceipt[]>();
    for (const r of raw) {
      if (!map.has(r.gr_no)) {
        map.set(r.gr_no, []);
      }
      map.get(r.gr_no)!.push(r);
    }

    const list: GroupedGoodsReceipt[] = [];
    for (const [gr_no, items] of map.entries()) {
      const first = items[0];
      const totalQty = items.reduce((s, item) => s + item.quantity, 0);
      list.push({
        gr_no,
        gr_year: first.gr_year,
        item_name: first.item_name,
        material: first.material,
        gr_date: first.gr_date,
        quantity: totalQty,
        uom: first.uom,
        items
      });
    }
    return list;
  });

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    const y = this.yearFilter();
    return this.grouped().filter(r => {
      const matchText = !q || r.gr_no.toLowerCase().includes(q)
        || r.material.toLowerCase().includes(q)
        || r.gr_year.toLowerCase().includes(q)
        || r.items.some(item => item.item_name && item.item_name.toLowerCase().includes(q));
      const matchYear = y === 'All' || r.gr_year === y;
      return matchText && matchYear;
    });
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  hasActiveFilters = computed(() => this.filter() !== '' || this.yearFilter() !== 'All');

  summary = computed(() => {
    const d = this.grouped();
    return {
      total: d.length,
      totalQuantity: d.reduce((s, r) => s + r.quantity, 0),
    };
  });

  constructor(private api: PoService) {}

  ngOnInit() {
    this.api.getGR().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setFilter(val: string) { this.filter.set(val); this.pageIndex.set(0); }
  setYearFilter(val: string) { this.yearFilter.set(val); this.pageIndex.set(0); }
  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters() { this.filter.set(''); this.yearFilter.set('All'); this.pageIndex.set(0); }

  openDetails(gr: GroupedGoodsReceipt) {
    this.selectedGr.set(gr);
  }

  closeDetails() {
    this.selectedGr.set(null);
  }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }
}
