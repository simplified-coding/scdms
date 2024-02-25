import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  email: string,
  subject: string,
  body: string,
) => {
  return await mailer.sendMail({
    from: "noreply@simplifiedcoding.org",
    to: email,
    subject: `[SCDMS] ${subject}`,
    text: body,
  });
};
