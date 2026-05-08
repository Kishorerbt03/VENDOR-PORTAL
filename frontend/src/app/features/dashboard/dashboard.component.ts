import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { VendorService } from '../../core/services/vendor.service';
import { LoginService } from '../../core/services/login.service';
import { DashboardStats } from '../../shared/models/vendor.models';
import { staggerList, fadeSlideIn } from '../../shared/animations';


Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, BaseChartDirective],
  animations: [staggerList, fadeSlideIn],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  vendor = this.auth.currentVendor;

  barChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  doughnutData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  financeData  = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
    },
  };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 16 } } },
    cutout: '70%',
  };

  today = new Date();

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  constructor(private api: VendorService, public auth: LoginService) {
    // React to vendorId changes
    const vid = this.auth.vendorId;
    if (vid) this.loadStats(vid);
  }

  ngOnInit() {}

  private loadStats(vendorId: string) {
    console.log('[Dashboard] Loading stats for:', vendorId);
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);

        this.barChartData.set({
          labels: data.poTrend.map((p: any) => p.label),
          datasets: [{
            data: data.poTrend.map((p: any) => p.value),
            backgroundColor: '#1565c0',
            borderRadius: 6,
            hoverBackgroundColor: '#0d47a1',
          }],
        });

        this.doughnutData.set({
          labels: ['Open PO', 'Closed PO'],
          datasets: [{
            data: [data.openPO, data.totalPO - data.openPO],
            backgroundColor: ['#1565c0', '#e3f0ff'],
            borderWidth: 0,
            hoverOffset: 4,
          }],
        });

        this.financeData.set({
          labels: ['Open Payable', 'Cleared'],
          datasets: [{
            data: [data.openPayable, Math.max(0, (data.totalInvoices - (data.openPayable > 0 ? 1 : 0)) * 10000)],
            backgroundColor: ['#e53935', '#e8f5e9'],
            borderWidth: 0,
            hoverOffset: 4,
          }],
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}
