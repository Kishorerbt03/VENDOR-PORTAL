import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginService } from '../../../core/services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form = this.fb.group({
    vendor_id: ['', [Validators.required, Validators.minLength(5)]],
    password:  ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private auth: LoginService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { vendor_id, password } = this.form.value;
    this.auth.login(vendor_id!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/portal/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Login failed. Please try again.';
        this.snack.open(msg, 'Dismiss', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }
}
