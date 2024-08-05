import encrypt from "./crypto/encrypt.js";
import jwt from "jsonwebtoken";
import pb, { decryptDocument } from "./pocketbase.js";
import { UserDocument } from "./documents.js";

export type User = {
  ID: number;
  USERNAME: string;
  ADMIN: boolean;
};

export const insertUser = async (user: User): Promise<User> => {
  delete user.ADMIN;
  const encrypted = await encrypt(JSON.stringify(user));

  await pb.collection("scdms_users").create({
    discord_id: user.ID,
    iv: encrypted.iv,
    auth: encrypted.auth,
    hash: encrypted.hash,
    data: encrypted.data,
    admin: false
  }).catch((e) => console.error(JSON.stringify(e)));

  return user;
};

export const getUser = async (id: string): Promise<User | void> => {
  const user = await decryptDocument("scdms_users", id) as { data: any, document: UserDocument };
  if (!user) return;

  user.data = JSON.parse(user.data);
  (user.data as User).ADMIN = Boolean(user.document.admin);
  return user.data;
};

export const signUserJWT = (data: User): string => {
  return jwt.sign(data, process.env.CRYPTO_JWT_SECRET, {
    expiresIn: "30 days",
    issuer: process.env.CERTS_AUTHOR,
    audience: "SCDMS User",
  });
};
