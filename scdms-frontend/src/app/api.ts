export interface Api {
  status: boolean;
  msg?: string;
}

export interface ApiDiscordClientId extends Api {
  clientid: string;
}

export interface ApiDiscordFinalize extends Api {
  state: string;
  admin: boolean;
  jwt: string;
}

export interface ApiGetCert extends Api {
  certID: string;
  certStatus: string;
  certDeactivationReason: string;
}
