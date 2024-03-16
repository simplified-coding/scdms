import { Injectable } from '@angular/core';
import { Token } from './token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected token?: Token;

  constructor() {}

  getToken(): Token | undefined {
    return this.token;
  }

  hasToken(): boolean {
    return this.token !== undefined;
  }
}
