import { hash } from "../crypto/crypto.js";
import { CertDocument } from "../documents.js";
import pb from "../pocketbase.js";

export const certExists = async (fullname: string, course: string): Promise<boolean> => {
  return pb.collection<CertDocument>("scdms_certs").getFirstListItem(
    `(status='active' && fullname='${fullname}' && course='${course}')`,
    { fields: "id" }).then(() => true).catch(() => false)
};

export const certFetch = async (id: string): Promise<CertDocument> => {
  return pb.collection<CertDocument>("scdms_certs").getFirstListItem(`id='${id}'`,
    { fields: "id,status,created,deactivated,course,fullname" })
    .then((document) => { return document })
    .catch(() => null)
};

export const certStatus = async (
  id: string,
  status: string,
  reason?: string,
) => {
  await pb.collection("scdms_certs").update(id, { status: status, deactivated: reason })
};

export const certLookup = async (fullname: string): Promise<CertDocument[]> => {
  return pb.collection<CertDocument>("scdms_certs").getList(1, 16,
    {
      filter: `fullname~'${fullname}'`,
      fields: "id,status,created,deactivated,course,fullname,email"
    }).then((documents) => {
      return documents.items
    })
};

export const certInsert = async (cert: CertDocument, email: string): Promise<void | CertDocument> => {
  return pb.collection<CertDocument>("scdms_certs").create({
    fullname: cert.fullname,
    course: cert.course,
    status: "active",
    email: email
  })
    .catch((e) => console.error(JSON.stringify(e)))
};
