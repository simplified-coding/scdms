import connect, { decryptRow } from "./airtable.js";
import encrypt from "./crypto/encrypt.js";
import jwt from "jsonwebtoken";

export type User = {
  ID: number;
  USERNAME: string;
  ADMIN: boolean;
};

export const insertUser = async (user: User): Promise<User> => {
  delete user.ADMIN;
  const encrypted = await encrypt(JSON.stringify(user));

  connect()
    .post("[SCDMS]_Users", {
      records: [
        {
          fields: {
            ID: user.ID,
            IV: encrypted.IV,
            AUTH: encrypted.TAG,
            HASH: encrypted.HASH,
            DATA: encrypted.DATA,
            ADMIN: false,
          },
        },
      ],
    })
    .catch((e) => console.log(JSON.stringify(e)));

  return user;
};

export const getUser = async (id: string): Promise<User | void> => {
  const user = await decryptRow("[SCDMS]_Users", id);
  if (!user) return;

  user.DATA = JSON.parse(user.DATA);
  (user.DATA as User).ADMIN = Boolean(user.RECORD.ADMIN);
  return user.DATA;
};

export const signUserJWT = (data: User): string => {
  return jwt.sign(data, process.env.CRYPTO_JWT_SECRET, {
    expiresIn: "30 days",
    issuer: process.env.CERTS_AUTHOR,
    audience: "SCDMS User",
  });
};
