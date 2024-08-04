import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from './../auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './certs.component.html',
  styleUrl: './certs.component.scss',
})
export class CertsComponent {
  protected authService: AuthService = inject(AuthService);
  protected matSnackBar: MatSnackBar = inject(MatSnackBar);
  protected router: Router = inject(Router);

  ngOnInit() {
    if (this.authService.hasAdmin()) {
      this.matSnackBar.open(
        'Hey! For admin tasks visit the ADMIN panel.',
        'Dismiss'
      );
    }

    this.fSearchGroup = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
        ),
      ]),
    });
  }

  protected onSubmit(): void {
    if (this.fSearchGroup.invalid) return;

    let { id } = this.fSearchGroup.value as { id: string };
    id = id.toLowerCase();

    this.router.navigate(['/certs/', id]);
  }

  protected fSearchGroup!: FormGroup;
}
