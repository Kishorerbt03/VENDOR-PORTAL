import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse, Invoice, AgingRow } from '../../shared/models/vendor.models';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  constructor(private http: HttpClient, private loginService: LoginService) {}

  getInvoices() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<Invoice[]>>(`/api/finance/${vendorId}`).pipe(map(r => r.data));
  }

  getAging(vendorId?: string) {
    const id = vendorId || this.loginService.vendorId;
    return this.http.get<{ success: boolean; data: any[]; summary: Record<string, number> }>(`/api/aging/${id}`);
  }

  downloadInvoicePdf(belnr: string) {
    return this.http.get(`/api/invoice/${belnr}`, { responseType: 'blob' });
  }
}
