import express, { Request, Response } from "express";
import passport from "passport";
import { User } from "../users";
import { v4 } from "uuid";
import { generateCertificate } from "../certificates/generate";
import {
  CertificateMetadata,
  certExists,
  certFetch,
  certInsert,
  certLookup,
  certStatus,
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
      `Πιστοποιητικά Simplified Coding - Δημιουργία`,
      `
Αγαπητέ/ή ${fullname}

Με μεγάλη χαρά σας ενημερώνουμε ότι η περάσατε την εξέταση πιστοποιητικού [COURSE]. Επισυνάπτουμε σε αυτό το mail το ψηφιακά υπογεγραμμένο πιστοποιητικό σας σε μορφή PDF. Επιπλέον, ακολουθούν βασικές πληροφορίες για το πιστοποιητικό. Παρακαλούμε να τις κρατήσετε, διότι είναι  πολύ σημαντικές, ειδικά ο κωδικός πιστοποιητικού.

Κωδικός πιστοποιητικού: ${id}
Ονοματεπώνυμο: ${fullname}
Μάθημα: ${course}

Μπορείτε να επιβεβαιώσετε την εγκυρότητα του στην ακόλουθη ιστοσελίδα: https://scdms.simplifiedcoding.org/certs/valid/${id}

Φυσικά, αν η ομάδα του Simplified Coding έχει λόγο να υποπτευθεί ότι δεν ακολουθήθηκαν οι κανονισμοί της εξέτασης έχει το δικαίωμα να το ανακαλέσει προσωρινά ή και μόνιμα.

Με εκτίμηση,
Η ομάδα του Simplified Coding <main@simplifiedcoding.org>`,
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

router.get("/:id", async (req: Request, res: Response) => {
  const cert = await certFetch(req.params.id);

  res.status(200).json({
    status: true,
    certID: cert.fields.ID,
    certStatus: cert.fields.Status,
    certDeactivationReason: cert.fields.DeactivationReason || "N/A",
  });
});

router.post(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.body.email) {
      return res
        .status(404)
        .json({ status: false, msg: "No email was provided" });
    }

    const cert = await certFetch(req.params.id);
    await certStatus(cert.id, "Active", "N/A");

    await sendNotification(
      "Certificate Reinstancion Notified",
      `A certificate reinstancion notification with ID: ${req.params.id} was sent!`,
      req.user.USERNAME,
    );
    const mail = await sendEmail(
      req.body.email,
      `Πιστοποιητικά Simplified Coding - Αποκατάσταση`,
      `
Προς κάθε ενδιαφερόμενο,
Θα θέλαμε να σας ενημερώσουμε με μεγάλη χαρά ότι το πιστοποιητικό σας με κωδικό: ${req.params.id} αποκαταστάθηκε!

Με εκτίμηση,
Η ομάδα του Simplified Coding <main@simplifiedcoding.org>
`,
    );

    res.status(200).json({ status: true, emailID: mail.messageId });
  },
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.deactivationReason) {
      return res.status(404).json({
        status: false,
        msg: "No email / deactivationReason was provided",
      });
    }

    const cert = await certFetch(req.params.id);
    await certStatus(cert.id, "Disabled", req.body.deactivationReason);

    await sendNotification(
      "Certificate Revoke Notified",
      `A certificate revokation notification with ID: ${req.params.id} was sent!`,
      req.user.USERNAME,
    );
    const mail = await sendEmail(
      req.body.email,
      `Πιστοποιητικά Simplified Coding - Ανάκληση`,
      `
Προς κάθε ενδιαφερόμενο,
Θα θέλαμε να σας ενημερώσουμε με μεγάλη λύπη ότι το πιστοποιητικό σας με κωδικό: ${req.params.id} ανακλήθηκε!

Η αιτία: ${req.body.deactivationReason}

Με εκτίμηση,
Η ομάδα του Simplified Coding <main@simplifiedcoding.org>
`,
    );

    res.status(200).json({ status: true, emailID: mail.messageId });
  },
);

router.get("/user/:fullname", async (req: Request, res: Response) => {
  const certs = await certLookup(req.params.fullname);
  res.status(200).json(certs.map((cert: any) => cert.fields));
});

export default router;
