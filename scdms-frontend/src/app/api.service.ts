import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiDiscordFinalize, Api, ApiDiscordClientId } from './api';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly serverURL: string = 'http://localhost:3000';

  private http: HttpClient = inject(HttpClient);
  constructor() {}

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
   * Pushes a state to the server
   * @param state The state to push
   * @returns The API Response
   */
  pushState(state: string): Observable<Api> {
    return this.http.post<Api>(`${this.serverURL}/oauth/discord/state`, {
      state: state,
    });
  }
}
