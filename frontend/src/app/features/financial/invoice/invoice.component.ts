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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FinanceService } from '../../../core/services/finance.service';
import { LoginService } from '../../../core/services/login.service';
import { Invoice } from '../../../shared/models/vendor.models';


@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatTooltipModule, MatSnackBarModule,
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {
  loading = signal(true);
  all = signal<Invoice[]>([]);
  filter = signal('');
  statusFilter = signal('All');
  pageIndex = signal(0);
  pageSize = signal(10);
  pdfDownloading = signal<string | null>(null);

  // FRS-aligned columns: BELNR, BUDAT, FAEDT (DUE_DATE), DMBTR, WAERS, AGING, STATUS + PDF action
  columns = ['belnr', 'gjahr', 'budat', 'faedt', 'dmbtr', 'waers', 'aging_bucket', 'status', 'actions'];

  statusOptions = ['All', 'Open', 'Cleared'];

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    const s = this.statusFilter();
    return this.all().filter(r => {
      const matchText = !q || r.belnr.toLowerCase().includes(q);
      const matchStatus = s === 'All' || r.status === s;
      return matchText && matchStatus;
    });
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  hasActiveFilters = computed(() =>
    this.filter() !== '' || this.statusFilter() !== 'All'
  );

  summary = computed(() => {
    const d = this.all();
    const open = d.filter(i => i.status === 'Open' && i.dmbtr > 0);
    return {
      totalOpen:    open.reduce((s, i) => s + i.dmbtr, 0),
      countOpen:    open.length,
      countCleared: d.filter(i => i.status === 'Cleared').length,
      total:        d.length,
    };
  });

  constructor(private api: FinanceService, private snack: MatSnackBar, private loginSvc: LoginService) {}

  ngOnInit() {
    this.api.getInvoices().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setFilter(val: string)       { this.filter.set(val);       this.pageIndex.set(0); }
  setStatusFilter(val: string) { this.statusFilter.set(val); this.pageIndex.set(0); }
  onPage(e: PageEvent)         { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  clearFilters()               { this.filter.set(''); this.statusFilter.set('All'); this.pageIndex.set(0); }

  docTypeLabel(t: string) {
    return { 'RE': 'Invoice', 'KG': 'Credit Memo', 'KL': 'Debit Memo' }[t] ?? t;
  }

  docTypeClass(t: string) {
    return { 'RE': 'type-inv', 'KG': 'type-cr', 'KL': 'type-dr' }[t] ?? '';
  }

  badgeClass(s: string) { return s === 'Open' ? 'open' : 'cleared'; }

  agingClass(days: number) {
    if (days <= 0) return 'aging-ok';
    if (days <= 30) return 'aging-warn';
    if (days <= 60) return 'aging-orange';
    return 'aging-danger';
  }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(v));
  }

  downloadPdf(belnr: string) {
    this.pdfDownloading.set(belnr);
    this.api.downloadInvoicePdf(belnr).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${belnr}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.pdfDownloading.set(null);
        this.snack.open('Invoice PDF downloaded successfully.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('PDF download error:', err);
        this.snack.open('Error: No PDF available from SAP.', 'OK', { duration: 4000 });
        this.pdfDownloading.set(null);
      }
    });
  }
}
