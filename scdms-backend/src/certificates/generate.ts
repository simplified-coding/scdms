import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";
import { P12Signer } from "@signpdf/signer-p12";
import { plainAddPlaceholder } from "@signpdf/placeholder-plain";

export const generateCertificate = async (fullname, course, id = undefined) => {
  const pdf = await PDFDocument.load(fs.readFileSync(`./src/assets/cert.pdf`));

  // Add fonts
  pdf.registerFontkit(fontkit);
  const fontDetails = await pdf.embedFont(
    fs.readFileSync(`./src/assets/${process.env.CERTS_FONT_DETAILS}`),
  );
  const fontFullname = await pdf.embedFont(
    fs.readFileSync(`./src/assets/${process.env.CERTS_FONT_FULLNAME}`),
  );

  // Add text
  const page = pdf.getPages()[0];
  const pdfID = id ? id : uuidv4();
  page.drawText(fullname, {
    color: rgb(31 / 255, 43 / 255, 91 / 255),
    font: fontFullname,
    size: 52,
    x: page.getWidth() / 2 - fontFullname.widthOfTextAtSize(fullname, 52) / 2,
    y: 265,
  });
  page.drawText(course, {
    color: rgb(124 / 255, 124 / 255, 124 / 255),
    font: fontDetails,
    size: 14,
    x: 550 + (10 - course.length) * 4,
    y: 210,
  });
  page.drawText(pdfID, {
    color: rgb(1, 1, 1),
    font: fontDetails,
    size: 12,
    x: 240,
    y: 4,
  });

  // Set Metadata
  pdf.setTitle(`Certificate - ${course} - ${fullname}`);
  pdf.setCreator(process.env.CERTS_MANAGER);
  pdf.setAuthor(process.env.CERTS_AUTHOR);
  pdf.setCreationDate(new Date(Date.now()));

  pdf.setModificationDate(pdf.getCreationDate());
  pdf.setProducer(pdf.getCreator());
  pdf.setSubject(pdf.getTitle());

  // Sign PDF
  let pdfBuffer = Buffer.from(await pdf.save({ useObjectStreams: false })); // Save PDF as buffer
  pdfBuffer = plainAddPlaceholder({
    pdfBuffer,
    contactInfo: process.env.CERTS_CONTACT,
    reason: process.env.CERTS_REASON,
    name: process.env.CERTS_REASON,
    location: "",
  });

  // Sign PDF
  pdfBuffer = await new P12Signer(
    fs.readFileSync("./assets/" + process.env.CRYPTO_P12_KEYFILE),
    { passphrase: process.env.CRYPTO_P12_SECRET },
  ).sign(pdfBuffer);

  return {
    cert: pdfBuffer,
    id: pdfID,
  };
};
