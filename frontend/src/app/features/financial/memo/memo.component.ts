import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MemoService } from '../../../core/services/memo.service';
import { LoginService } from '../../../core/services/login.service';


export interface Memo {
  belnr: string;
  gjahr: string;
  lifnr: string;
  budat: string;
  dmbtr: number;
  waers: string;
  type: string; // 'CREDIT' | 'DEBIT'
  [key: string]: any;
}

@Component({
  selector: 'app-memo',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatTooltipModule, MatTabsModule,
  ],
  templateUrl: './memo.component.html',
  styleUrls: ['./memo.component.scss'],
})
export class MemoComponent implements OnInit {
  loading = signal(true);
  all = signal<Memo[]>([]);
  filter = signal('');

  creditPageIndex = signal(0);
  debitPageIndex = signal(0);
  pageSize = signal(10);

  columns = ['belnr', 'gjahr', 'budat', 'dmbtr', 'waers', 'type'];

  credits = computed(() =>
    this.all().filter(m => (m.type || '').toUpperCase() === 'CREDIT')
  );

  debits = computed(() =>
    this.all().filter(m => (m.type || '').toUpperCase() === 'DEBIT')
  );

  filteredCredits = computed(() => {
    const q = this.filter().toLowerCase();
    return !q ? this.credits() : this.credits().filter(r =>
      r.belnr?.toLowerCase().includes(q) || r.gjahr?.toLowerCase().includes(q)
    );
  });

  filteredDebits = computed(() => {
    const q = this.filter().toLowerCase();
    return !q ? this.debits() : this.debits().filter(r =>
      r.belnr?.toLowerCase().includes(q) || r.gjahr?.toLowerCase().includes(q)
    );
  });

  paginatedCredits = computed(() => {
    const start = this.creditPageIndex() * this.pageSize();
    return this.filteredCredits().slice(start, start + this.pageSize());
  });

  paginatedDebits = computed(() => {
    const start = this.debitPageIndex() * this.pageSize();
    return this.filteredDebits().slice(start, start + this.pageSize());
  });

  summary = computed(() => ({
    total:       this.all().length,
    creditCount: this.credits().length,
    debitCount:  this.debits().length,
    creditTotal: this.credits().reduce((s, m) => s + Math.abs(m.dmbtr || 0), 0),
    debitTotal:  this.debits().reduce((s, m) => s + Math.abs(m.dmbtr || 0), 0),
    netBalance:  this.credits().reduce((s, m) => s + Math.abs(m.dmbtr || 0), 0)
               - this.debits().reduce((s, m) => s + Math.abs(m.dmbtr || 0), 0),
  }));

  constructor(private api: MemoService, private loginSvc: LoginService) {
    const vid = this.loginSvc.vendorId;
    if (vid) this.loadMemos(vid);
  }

  ngOnInit() {}

  private loadMemos(vendorId: string) {
    console.log('[MemoComponent] loading for vendorId:', vendorId);
    this.api.getMemos().subscribe({
      next: (d: any[]) => {
        console.log('[MemoComponent] got res:', d?.length, 'rows');
        this.all.set(d || []);
        this.loading.set(false);
      },
      error: (err) => { console.error('[MemoComponent] error:', err); this.loading.set(false); },
    });
  }

  setFilter(val: string)               { this.filter.set(val); this.creditPageIndex.set(0); this.debitPageIndex.set(0); }
  onCreditPage(e: PageEvent)           { this.creditPageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  onDebitPage(e: PageEvent)            { this.debitPageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilter()                        { this.filter.set(''); }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Math.abs(v || 0));
  }

  fmtDate(d: string) {
    if (!d) return '—';
    // Handle both YYYYMMDD and YYYY-MM-DD
    const s = d.replace(/-/g, '');
    if (s.length === 8) {
      const dt = new Date(`${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return d;
  }
}
