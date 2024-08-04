export interface Api {
  status: boolean;
  msg?: string;
}

export interface ApiEmail extends Api {
  emailID: string;
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

export interface ApiGetCertsByName {
  ID: string;
  Fullname: string;
  Status: string;
  Course: string;
  DeactivationReason: string;
  DaysDeactivated: string;
  Created: string;
  Email: string;
}
