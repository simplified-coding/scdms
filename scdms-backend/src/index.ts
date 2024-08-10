import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import "dotenv/config";
import passport from "passport";
import passportJWT from "passport-jwt";

import { sendNotification } from "./notify.js";

import rCertificates from "./api/certificates.js";
import rOauth from "./api/oauth.js";
import rCourses from "./api/course.js";
import rLessons from "./api/lessons.js";

import swaggerDocument from "./assets/OpenAPI.json" with {type: "json"};
import pkg from "../package.json" with {type: "json"};

const app = express();
app.use(bodyParser.json());
app.use(cors());

swaggerDocument.info.version = pkg.version;
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Passport
passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: "SCDMS User",
      issuer: process.env.CERTS_AUTHOR,
      secretOrKey: process.env.CRYPTO_JWT_SECRET,
    },
    (payload, done) => {
      return done(null, payload);
    },
  ),
);

// Routes
app.use("/certs", rCertificates);
app.use("/course", rCourses);
app.use("/oauth", rOauth);
app.use("/lessons", rLessons)

app.get("/", (_, res) => {
  res.send("Hello, world!");
});

app.listen(process.env.PORT || 3000, () => {
  sendNotification("Server Runtime", `A SCDMS Service was started`);
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
