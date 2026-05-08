import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse, Invoice } from '../../shared/models/vendor.models';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class MemoService {
  constructor(private http: HttpClient, private loginService: LoginService) {}

  getMemos() {
    const vendorId = this.loginService.vendorId;
    return this.http.get<ApiResponse<Invoice[]>>(`/api/memo/${vendorId}`).pipe(map(r => r.data));
  }
}
