import express, { Request, Response } from "express";
import cache from "node-cache";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import qs from "qs";
import { getUser, insertUser, signUserJWT } from "../users";

const router = express.Router();
const redirect = "http://127.0.0.1:3000/oauth/discord/finalize";
const states = new cache({ stdTTL: 60 * 12, checkperiod: 90 });

router.get("/discord/request", (req: Request, res: Response) => {
  const state = uuidv4();
  states.set(state, req.ip);

  res.redirect(
    `https://discord.com/oauth2/authorize?response_type=code&client_id=${
      process.env.OAUTH_DISCORD_ID
    }&scope=identify%20guilds.join%20guilds&state=${state}&redirect_uri=${encodeURIComponent(
      redirect,
    )}&prompt=consent`,
  );
});

router.get("/discord/finalize", async (req: Request, res: Response) => {
  if (!req.query.state && !req.query.code) {
    res
      .status(404)
      .json({ status: false, msg: "The code & state was not found" });
    return;
  }

  if (
    !states.has(String(req.query.state)) ||
    states.take(String(req.query.state)) != req.ip
  ) {
    res.status(404).json({
      status: false,
      msg: "The state was invalid or the IP address doesn't match with the original one",
    });
    return;
  }

  const accessToken = await axios
    .post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: String(process.env.OAUTH_DISCORD_ID),
        client_secret: String(process.env.OAUTH_DISCORD_SECRET),
        grant_type: "authorization_code",
        redirect_uri: redirect,
        code: String(req.query.code),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
    .then((d) => d.data.access_token);

  const discordUser = await axios
    .get("https://discord.com/api/users/@me", {
      headers: { Authorization: "Bearer " + accessToken },
    })
    .then((d) => d.data);

  let user = await getUser(discordUser.id);
  if (!user) {
    user = await insertUser({
      ADMIN: false,
      ID: discordUser.id,
      USERNAME: discordUser.username,
    });
  }

  res.status(200).json({
    status: true,
    state: String(req.query.state),
    jwt: signUserJWT(user),
  });
});

export default router;
