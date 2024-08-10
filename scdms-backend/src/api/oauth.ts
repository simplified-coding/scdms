import express, { Request, Response } from "express";
import cache from "node-cache";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { getUser, insertUser, signUserJWT } from "../users.js";
import cors from "cors";

const router = express.Router();
const redirect =
  "http://localhost:3000/oauth/discord/finalize";
// "http://scmds-server.simplifiedcoding.org/oauth/discord/finalize";

const states = new cache({ stdTTL: 60 * 12, checkperiod: 90 });
const providers = {
  "scdms": "https://scdms.simplifiedcoding.org/oauth/discord/finalize"
}

router.use(cors());
router.get("/discord/clientid", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: true, clientid: process.env.OAUTH_DISCORD_ID });
});

router.post("/token/:token", (req: Request, res: Response) => {
  if (!states.has(req.params.token))
    return res.status(404).json({ status: false, msg: "Token not found!" })
  res.status(200).json({ status: true, jwt: states.take(req.params.token) })
})

router.get("/discord/request", (req: Request, res: Response) => {
  const state = uuidv4();
  states.set(state, req.query.provider || undefined);

  res.redirect(
    `https://discord.com/oauth2/authorize?response_type=code&client_id=${process.env.OAUTH_DISCORD_ID
    }&scope=identify%20guilds&state=${state}&redirect_uri=${encodeURIComponent(
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

  if (!states.has(String(req.query.state))) {
    res.status(404).json({
      status: false,
      msg: "The state was invalid or the IP address doesn't match with the original one",
    });
    return;
  }

  const provider = states.take(String(req.query.state)) as string
  if (provider == undefined || providers[provider] == undefined)
    return res.status(404).json({ status: false, msg: "The provider was not found in the local database" })

  const accessToken = await axios
    .post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: String(process.env.OAUTH_DISCORD_ID),
        client_secret: String(process.env.OAUTH_DISCORD_SECRET),
        grant_type: "authorization_code",
        redirect_uri: req.query.redirect
          ? req.query.redirect.toString()
          : redirect,
        code: String(req.query.code),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
    .then((data) => data.data.access_token)
    .catch((e) => console.log(e));

  const discordUser = await axios
    .get("https://discord.com/api/users/@me", {
      headers: { Authorization: "Bearer " + accessToken },
    })
    .then((data) => data.data);

  let user = await getUser(discordUser.id);
  if (!user) {
    user = await insertUser({
      ADMIN: false,
      ID: discordUser.id,
      USERNAME: discordUser.username,
    });
  }

  const token = uuidv4();
  states.set(token, signUserJWT(user));
  res.status(301).redirect(`${providers[provider]}?admin=${user.ADMIN}&jwt_token=${token}`)
});

export default router;
