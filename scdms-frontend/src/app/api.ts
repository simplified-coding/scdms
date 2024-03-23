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
  certFullname: string;
  certStatus: string;
  certCourse: string;
  certCreated: string;
  certDeactivationReason: string;
}
