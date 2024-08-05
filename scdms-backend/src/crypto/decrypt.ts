import fs from "fs/promises";
import crypto from "crypto";
import AES_Crypto, { hash } from "./crypto.js";

export default async (data: AES_Crypto): Promise<string | void> => {
  const key = await fs.readFile(
    `./src/assets/${process.env.CRYPTO_AES_KEYFILE}`,
  );
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key.toString(), "hex"),
    Buffer.from(data.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(data.auth, "base64"));

  let decrypted = decipher.update(data.data, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  if (hash(decrypted) !== data.hash) return;

  return decrypted;
};
