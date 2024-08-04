import { Injectable, inject } from '@angular/core';
import { Token } from './token';
import { ApiService } from './api.service';
import { Api, ApiDiscordClientId, ApiDiscordFinalize } from './api';
import { v4 } from 'uuid';
import { Observable, lastValueFrom } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected readonly serverURL: string =
    'https://scdms-server.simplifiedcoding.org';
  protected token?: Token;
  protected state?: string;
  protected redirect!: string;
  protected clientid!: string;

  private cookieService: CookieService = inject(CookieService);
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.getDiscordClientId().subscribe(
      (v: ApiDiscordClientId) => (this.clientid = v.clientid)
    );

    this.redirect = encodeURIComponent(
      `${window.location.protocol}//${window.location.host}/auth/login/finalize`
    );

    if (this.cookieService.check('token')) {
      const data: Token = JSON.parse(atob(this.cookieService.get('token')));
      this.token = data;
    }
  }

  /**
   * Pushes a state to the server
   * @param state The state to push
   * @returns The API Response
   */
  pushState(state: string): Observable<Api> {
    return this.http.post<Api>(`${this.serverURL}/oauth/discord/state`, {
      state: state,
    });
  }

  /**
   * Finalizes the discord oauth request
   * @param state The state
   * @param code The code provided by discord
   * @returns The API Response
   */
  finalizeDiscordOAuth(
    state: string,
    code: string,
    redirect: string
  ): Observable<ApiDiscordFinalize> {
    return this.http.get<ApiDiscordFinalize>(
      `${this.serverURL}/oauth/discord/finalize?code=${code}&state=${state}&redirect=${redirect}`
    );
  }

  /**
   * Gets the discord client id of the server
   * @returns The API Response
   */
  getDiscordClientId(): Observable<ApiDiscordClientId> {
    return this.http.get<ApiDiscordClientId>(
      `${this.serverURL}/oauth/discord/clientid`
    );
  }

  /**
   * Gets the current authentication token
   * @returns token
   */
  getToken(): Token | undefined {
    return this.token;
  }

  /**
   * Checks if a current authentication token exists
   * @returns token exists
   */
  hasToken(): boolean {
    return this.token !== undefined;
  }

  /**
   * Checks if the current authenticated user has admin
   * @returns admin status
   */
  hasAdmin(): boolean {
    return this.token?.admin || false;
  }

  /**
   * Sets the current authentication state
   * @param state the state to use
   */
  setState(state: string) {
    this.state = state;
  }

  /**
   * Service cleanup & logout operation
   */
  clean() {
    this.state = undefined;
    this.token = undefined;
    this.cookieService.delete('token', '/', undefined, true, 'Strict');
  }

  /**
   * Assembles a discord oauth url
   * @returns the redirect uri
   */
  discordRedirectURL(): string {
    return `https://discord.com/oauth2/authorize?response_type=code&client_id=${this.clientid}&scope=identify%20guilds&state=${this.state}&redirect_uri=${this.redirect}&prompt=consent`;
  }

  /**
   * Finalizes the discord request and authenticates the user
   * @param code the code from discord
   */
  async discordFinalize(code: string): Promise<void> {
    const user = await lastValueFrom(
      this.finalizeDiscordOAuth(this.state!, code, this.redirect)
    );

    this.token = {
      admin: user.admin,
      jwt: user.jwt,
    };

    this.cookieService.set(
      'token',
      btoa(JSON.stringify(this.token)),
      60,
      '/',
      undefined,
      true,
      'Strict'
    );
  }

  /**
   * Generates an authentication state
   * @returns the state
   */
  async genState(): Promise<string> {
    this.state = v4();
    await lastValueFrom(this.pushState(this.state));
    return this.state;
  }
}
