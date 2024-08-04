import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiGetCertsByName } from '../api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTabsModule,
    MatFormField,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatDividerModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  protected apiService: ApiService = inject(ApiService);
  protected matSnackBar: MatSnackBar = inject(MatSnackBar);

  ngOnInit() {
    this.tabControl = new FormControl(0);
    this.fCertificateLookup = new FormGroup({
      fullname: new FormControl(''),
      loading: new FormControl(false),
    });
    this.fCertificateEditor = new FormGroup({
      deactivationReason: new FormControl(''),
      loading: new FormControl(false),
    });
  }

  protected tabControl!: FormControl;
  protected fCertificateLookup!: FormGroup;
  protected fCertificateEditor!: FormGroup;
  protected fCertificateLookupSubmit() {
    if (this.fCertificateLookup.invalid) return;

    this.fCertificateLookup.controls['loading'].setValue(true);
    this.lookupResults = [];
    this.apiService
      .getCertsByName(this.fCertificateLookup.value.fullname)
      .subscribe((response) => {
        this.fCertificateLookup.controls['loading'].setValue(false);
        this.lookupResults = response.map((certificate) => {
          certificate.Created = new Date(certificate.Created).toLocaleString();
          return certificate;
        });
      });
  }

  protected certificateEditorRevoke(confirm?: boolean) {
    if (this.fCertificateEditor.invalid || confirm === false) return;
    if (confirm == undefined)
      this.certificateEditorRevoke(
        window.confirm(
          `Are you sure you want to revoke certificate with ID: ${
            this.selectedCertificate!.ID
          }`
        )
      );

    this.fCertificateEditor.controls['loading'].setValue(true);
    this.apiService
      .revokeCert(
        this.selectedCertificate!.ID,
        this.selectedCertificate!.Email,
        this.fCertificateEditor.value.deactivationReason
      )
      .subscribe((response) => {
        this.fCertificateEditor.controls['loading'].setValue(false);
        this.matSnackBar.open(
          `Successfully revoked the certificate with ID: ${
            this.selectedCertificate!.ID
          }. Email ID: ${response.emailID}`,
          'Dismiss'
        );
      });
  }

  protected certificateEditorReinstate(confirm?: boolean) {
    if (confirm === false) return;

    if (confirm == undefined)
      this.certificateEditorReinstate(
        window.confirm(
          `Are you sure you want to reinstate certificate with ID: ${
            this.selectedCertificate!.ID
          }`
        )
      );

    this.fCertificateEditor.setValue({
      deactivationReason: 'N/A',
      loading: true,
    });
    this.apiService
      .reinstateCert(
        this.selectedCertificate!.ID,
        this.selectedCertificate!.Email
      )
      .subscribe((response) => {
        this.fCertificateEditor.controls['loading'].setValue(false);
        this.matSnackBar.open(
          `Successfully reinstated the certificate with ID: ${
            this.selectedCertificate!.ID
          }. Email ID: ${response.emailID}`,
          'Dismiss'
        );
      });
  }

  protected certificateLookupSelect(certificate: ApiGetCertsByName) {
    this.selectedCertificate = certificate;
    this.matSnackBar.open(
      `Successfully selected certificate: ${certificate.ID}!`,
      'Dismiss'
    );

    this.tabControl.setValue(1);
  }

  lookupColumns: string[] = [
    'ID',
    'Fullname',
    'Email',
    'Course',
    'Status',
    'DeactivationReason',
    'DaysDeactivated',
    'Created',
    'Actions',
  ];
  protected lookupResults: ApiGetCertsByName[] = [];
  protected selectedCertificate?: ApiGetCertsByName;
}
