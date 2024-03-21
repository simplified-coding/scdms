export interface Api {
  status: boolean;
}

export interface ApiDiscordClientId extends Api {
  clientid: string;
}

export interface ApiDiscordFinalize extends Api {
  state: string;
  admin: boolean;
  jwt: string;
}
