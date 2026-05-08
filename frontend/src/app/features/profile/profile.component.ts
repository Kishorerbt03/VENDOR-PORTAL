import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VendorService } from '../../core/services/vendor.service';
import { VendorProfile } from '../../shared/models/vendor.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  loading = signal(true);
  profile = signal<VendorProfile | null>(null);

  constructor(private api: VendorService) {}
  ngOnInit() {
    this.api.getProfile().subscribe({ next: p => { this.profile.set(p); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  Math = Math;
  stars(rating: number): number[] { return Array.from({ length: 5 }, (_, i) => i); }
}
