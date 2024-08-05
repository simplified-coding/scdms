import crypto from "crypto";

type AES_Crypto = {
  iv: string;
  auth: string;
  data: string;
  hash: string;
};

export const hash = (data: string): string => {
  return crypto.createHash("sha256").update(data).digest("base64");
};

export default AES_Crypto;
