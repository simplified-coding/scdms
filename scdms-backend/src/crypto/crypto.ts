import crypto from "crypto";

type AES_Crypto = {
  IV: string;
  TAG: string;
  DATA: string;
  HASH: string;
};

export const hash = (data: string): string => {
  return crypto.createHash("sha256").update(data).digest("base64");
};

export default AES_Crypto;
