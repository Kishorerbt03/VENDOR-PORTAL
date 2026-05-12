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
  plantFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);

  columns = ['gr_no', 'gr_year', 'item_name', 'material', 'gr_date', 'quantity', 'uom'];

  plants = computed(() => ['All']);

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    return this.all().filter(r => {
      const matchText = !q || r.gr_no.toLowerCase().includes(q)
        || r.material.toLowerCase().includes(q)
        || (r.item_name && r.item_name.toLowerCase().includes(q))
        || r.gr_year.toLowerCase().includes(q);
      return matchText;
    });
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  hasActiveFilters = computed(() => this.filter() !== '');

  summary = computed(() => {
    const d = this.all();
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
  onPage(e: PageEvent) { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters() { this.filter.set(''); this.pageIndex.set(0); }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }
}
