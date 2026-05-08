import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse, PurchaseOrder, GoodsReceipt, RFQ } from '../../shared/models/vendor.models';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class PoService {
  constructor(private http: HttpClient, private loginService: LoginService) {}

  getPO() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<PurchaseOrder[]>>(`/api/po/${vendorId}`).pipe(map(r => r.data));
  }

  getGR() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<GoodsReceipt[]>>(`/api/gr/${vendorId}`).pipe(map(r => r.data));
  }

  getRFQ() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<RFQ[]>>(`/api/rfq/${vendorId}`).pipe(map(r => r.data));
  }
}
