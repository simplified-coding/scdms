import fs from "fs/promises";
import crypto from "crypto";
import AES_Crypto, { hash } from "./crypto.js";

export default async (data: string): Promise<AES_Crypto> => {
  const key = await fs.readFile(
    `./src/assets/${process.env.CRYPTO_AES_KEYFILE}`,
  );
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key.toString(), "hex"),
    iv,
  );

  let encrypted = cipher.update(data, "utf-8", "base64");
  encrypted += cipher.final("base64");

  return {
    iv: iv.toString("base64"),
    auth: cipher.getAuthTag().toString("base64"),
    data: encrypted,
    hash: hash(data),
  };
};
