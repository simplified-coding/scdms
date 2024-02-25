import connect from "../airtable";
import { hash } from "../crypto/crypto";

export type CertificateMetadata = {
  id: string;
  fullname: string;
  course: string;
  email: string;
};

export const certExists = async (fullaname: string, course: string) => {
  const query = await connect().get("[SCDMS]_Certs", {
    params: {
      maxRecords: 1,
      fields: ["ID"],
      filterByFormula: `AND(Status = 'Active', Fullname = '${hash(
        fullaname,
      )}', Course = '${course}')`,
    },
  });

  return query.data.records.length > 0;
};

export const certInsert = async (cert: CertificateMetadata) => {
  await connect()
    .post("[SCDMS]_Certs", {
      records: [
        {
          fields: {
            ID: cert.id,
            Fullname: hash(cert.fullname),
            Course: cert.course,
            Status: "Active",
          },
        },
      ],
    })
    .catch((e) => console.log(JSON.stringify(e)));
};
