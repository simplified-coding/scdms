import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [MatProgressSpinner],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss',
})
export class AuthLoginComponent {
  private authService: AuthService = inject(AuthService);
  async ngOnInit(): Promise<void> {
    const search = new URLSearchParams(window.location.search);

    if (!search.has('code') || !search.has('state')) {
      await this.authService.genState();
      window.location.href = this.authService.discordRedirectURL();
    } else {
      this.authService.setState(search.get('state')!);
      this.authService.discordFinalize(search.get('code')!);
    }
  }
}
