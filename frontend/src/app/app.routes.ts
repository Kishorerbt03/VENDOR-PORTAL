import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'portal',
    loadComponent: () => import('./features/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'profile',   loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'rfq',       loadComponent: () => import('./features/rfq/rfq.component').then(m => m.RfqComponent) },
      { path: 'po',        loadComponent: () => import('./features/purchase-order/po.component').then(m => m.PoComponent) },
      { path: 'gr',        loadComponent: () => import('./features/goods-receipt/gr.component').then(m => m.GrComponent) },
      { path: 'invoices',  loadComponent: () => import('./features/financial/invoice/invoice.component').then(m => m.InvoiceComponent) },
      { path: 'aging',     loadComponent: () => import('./features/financial/aging/aging.component').then(m => m.AgingComponent) },
      { path: 'memos',     loadComponent: () => import('./features/financial/memo/memo.component').then(m => m.MemoComponent) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
