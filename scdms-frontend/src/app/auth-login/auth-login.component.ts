import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [MatProgressSpinner],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss',
})
export class AuthLoginComponent {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  async ngOnInit(): Promise<void> {
    const search = new URLSearchParams(window.location.search);

    if (search.has('logout')) {
      this.authService.clean();
      this.router.navigate(['/']);
    } else if (!search.has('code') || !search.has('state')) {
      await this.authService.genState();
      window.location.href = this.authService.discordRedirectURL();
    } else {
      this.authService.setState(search.get('state')!);
      await this.authService.discordFinalize(search.get('code')!);
      this.router.navigate(['/']);
    }
  }
}
