import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { LoginService } from '../../core/services/login.service';
import {
  sidebarAnim, rightPanelAnim, routeAnim, fadeSlideIn, staggerList
} from '../../shared/animations';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  group?: string;
  badge?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule,
  ],
  animations: [sidebarAnim, rightPanelAnim, routeAnim, fadeSlideIn, staggerList],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  collapsed   = signal(false);
  panelOpen   = signal(false);
  vendor      = computed(() => this.auth.currentVendor());

  navItems: NavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',        route: '/portal/dashboard', group: 'Overview' },
    { label: 'My Profile',      icon: 'person',           route: '/portal/profile',   group: 'Overview' },
    { label: 'RFQ',             icon: 'request_quote',    route: '/portal/rfq',       group: 'Procurement' },
    { label: 'Purchase Orders', icon: 'shopping_cart',    route: '/portal/po',        group: 'Procurement' },
    { label: 'Goods Receipt',   icon: 'local_shipping',   route: '/portal/gr',        group: 'Procurement' },
    { label: 'Invoices',        icon: 'receipt_long',     route: '/portal/invoices',  group: 'Financial' },
    { label: 'Aging Report',    icon: 'schedule',         route: '/portal/aging',     group: 'Financial' },
    { label: 'Credit / Debit',  icon: 'swap_horiz',       route: '/portal/memos',     group: 'Financial' },
  ];

  groups = [...new Set(this.navItems.map(n => n.group!))];

  quickLinks = [
    { icon: 'request_quote', label: 'RFQ',           route: '/portal/rfq',      color: '#2962ff' },
    { icon: 'shopping_cart', label: 'Purchase Orders', route: '/portal/po',     color: '#e65100' },
    { icon: 'local_shipping', label: 'Goods Receipts', route: '/portal/gr',     color: '#2e7d32' },
    { icon: 'receipt_long',  label: 'Invoices',       route: '/portal/invoices', color: '#6a1b9a' },
    { icon: 'schedule',      label: 'Aging Report',   route: '/portal/aging',    color: '#0277bd' },
    { icon: 'swap_horiz',    label: 'Memos',          route: '/portal/memos',    color: '#558b2f' },
  ];

  today = new Date();

  constructor(public auth: LoginService) {}

  logout() { this.auth.logout(); }
  togglePanel() { this.panelOpen.update(v => !v); }
  getRoute(outlet: RouterOutlet) { return outlet?.activatedRouteData?.['animation'] ?? ''; }
}
