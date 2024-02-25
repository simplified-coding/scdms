import express, { Request, Response } from "express";
import passport from "passport";
import { User } from "../users";
import { v4 } from "uuid";
import { generateCertificate } from "../certificates/generate";
import {
  CertificateMetadata,
  certExists,
  certInsert,
} from "../certificates/db";
import { sendNotification } from "../notify";
import { sendEmail } from "../email";

const router = express.Router();

declare module "express" {
  export interface Request {
    user: User;
  }
}

router.get("/", (req: Request, res: Response) => {
  res.json({ status: true, message: "SCDMS - Certificates API" });
});

router.post(
  "/generate",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { fullname, email, course } = req.body;
    if (req.user.ADMIN && !fullname && !email && !course) {
      return res.status(422).json({
        status: false,
        msg: "Some fields were not found!",
      });
    }

    if (await certExists(fullname, course)) {
      return res.status(409).json({
        status: false,
        conflict: "certificate",
        msg: "A certificate already exists",
      });
    }

    const meta: CertificateMetadata = {
      ...req.body,
      id: v4(),
    };
    const cert = await generateCertificate(meta);
    await certInsert(meta);

    await sendNotification(
      `Certificate Generation`,
      `A certificate was generated with ID: ${meta.id}`,
      req.user.USERNAME,
    );
    res.status(200).json({
      status: true,
      id: meta.id,
      cert: cert.cert.toString("base64"),
    });
  },
);

router.post(
  "/generate/notify",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const { id, fullname, course, email } = req.body;
    if (req.user.ADMIN && !fullname && !email && !course && !email) {
      return res.status(422).json({
        status: false,
        msg: "Some fields were not found!",
      });
    }

    const mail = await sendEmail(
      email,
      `Simplified Coding Certificate Generation`,
      `
Hello!
A Simplified Coding Certificate was generated for you!
Below are your certificate details, and the certificate PDF.
We urge you to not lose the ID as it will be used for most actions.

~ DETAILS
ID: ${id}
FULLNAME: ${fullname}
COURSE: ${course}

~ Validation
Your certificate shall be considered valid from the moment it was created.
If the Simplified Coding Team suspects you cheated, or did any other unauthorized action, they have every right to invalidate/reinstate it.
You can manually check the certificate validity by following this link: https://scdms.simplifiedcoding.org/certs/valid/${id}

Have any questions? Lost your certificate ID? Was your certificate invalidated? Email us at main@simplifiedcoding.org`,
      [
        {
          filename: "certificate.pdf",
          content: (await generateCertificate({ ...req.body })).cert,
        },
      ],
    );

    await sendNotification(
      "Certificate Generation Notifier",
      `A certificate notification was send with ID: ${id}, to ${email}`,
      req.user.USERNAME,
    );
    res.status(200).json({ status: true, id: mail.messageId });
  },
);

export default router;
