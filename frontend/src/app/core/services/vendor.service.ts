import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse, VendorProfile } from '../../shared/models/vendor.models';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(private http: HttpClient, private loginService: LoginService) {}

  getProfile() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<VendorProfile>>(`/api/profile/${vendorId}`).pipe(map(r => r.data));
  }

  getDashboardStats() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<any>>(`/api/dashboard/${vendorId}`).pipe(map(r => r.data));
  }
}
