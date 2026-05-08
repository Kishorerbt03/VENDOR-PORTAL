import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse } from '../../shared/models/vendor.models';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly TOKEN_KEY = 'vp_token';
  private readonly VENDOR_KEY = 'vp_vendor';

  currentVendor = signal<AuthResponse['vendor'] | null>(this.loadVendor());

  constructor(private http: HttpClient, private router: Router) {}

  login(vendorId: string, password: string) {
    return this.http.get<AuthResponse>(`/api/login?vendorId=${vendorId}&password=${password}`).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.VENDOR_KEY, JSON.stringify(res.vendor));
          this.currentVendor.set(res.vendor);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.VENDOR_KEY);
    this.currentVendor.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get vendorId(): string {
    const v = this.currentVendor();
    return v ? v.vendor_id : '';
  }

  private loadVendor(): AuthResponse['vendor'] | null {
    const raw = localStorage.getItem(this.VENDOR_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
