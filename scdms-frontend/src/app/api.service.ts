import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiGetCert,
  ApiGetCertsByName,
  ApiEmail,
} from './api';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly serverURL: string =
    // 'https://scdms-server.simplifiedcoding.org';
    'http://localhost:3000'

  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);

  /**
   * Gets a certificate using it's id from the server
   * @param id The certificate id
   * @returns The certificate request
   */
  getCert(id: string): Observable<ApiGetCert> {
    return this.http.get<ApiGetCert>(`${this.serverURL}/certs/${id}`);
  }

  /**
   * Gets a list of certificate that match the entered name
   * @param fullname The users fullname to search
   * @returns The ceritificates that match the fullname
   */
  getCertsByName(fullname: string): Observable<ApiGetCertsByName[]> {
    return this.http.get<ApiGetCertsByName[]>(
      `${this.serverURL}/certs/user/${fullname}`,
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()!.jwt}`,
        },
      }
    );
  }

  /**
   * Revokes a certificate
   * @param id The certificate id
   * @param email The certificate owners email
   * @param deactivationReason The deactivation reason
   * @returns An email response
   */
  revokeCert(
    id: string,
    email: string,
    deactivationReason: string
  ): Observable<ApiEmail> {
    return this.http.delete<ApiEmail>(`${this.serverURL}/certs/${id}`, {
      body: { email, deactivationReason },
      headers: {
        Authorization: `Bearer ${this.authService.getToken()!.jwt}`,
      },
    });
  }

  /**
   * Reinstates a certificate
   * @param id The certificate id to reinstate
   * @param email The certificate owners email
   * @returns An email response
   */
  reinstateCert(id: string, email: string): Observable<ApiEmail> {
    return this.http.post<ApiEmail>(
      `${this.serverURL}/certs/${id}`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()!.jwt}`,
        },
      }
    );
  }
}
