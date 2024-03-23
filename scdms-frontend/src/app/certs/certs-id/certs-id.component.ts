import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { ApiGetCert } from '../../api';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-certs-id',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './certs-id.component.html',
  styleUrl: './certs-id.component.scss',
})
export class CertsIdComponent {
  protected route: ActivatedRoute = inject(ActivatedRoute);
  protected apiService: ApiService = inject(ApiService);

  ngOnInit(): void {
    let cert$ = this.route.paramMap.pipe(
      switchMap((params) => this.apiService.getCert(params.get('id')!))
    );

    cert$.subscribe((v) => {
      this.cert = v;
      this.cert.certCreated = new Date(this.cert.certCreated).toLocaleString()

      this.lastViewed = `${new Date().toLocaleString()} (${new Date().toUTCString()})`;
    });
  }

  protected lastViewed: string = 'Loading...';
  protected cert?: ApiGetCert;

  protected share() {
    navigator.share({ url: window.location.href });
  }
}
