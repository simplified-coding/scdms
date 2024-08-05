import connect from "../airtable.js";
import { hash } from "../crypto/crypto.js";

export type CertificateMetadata = {
  id: string;
  fullname: string;
  course: string;
  email: string;
};

export const certExists = async (fullname: string, course: string) => {
  const query = await connect().get("[SCDMS]_Certs", {
    params: {
      maxRecords: 1,
      fields: ["ID"],
      filterByFormula: `AND(Status = 'Active', Fullname = '${fullname}', Course = '${course}')`,
    },
  });

  return query.data.records.length > 0;
};

export const certFetch = async (id: string) => {
  const query = await connect().get("[SCDMS]_Certs", {
    params: {
      filterByFormula: `ID = '${id}'`,
      maxRecords: 1,
      fields: [
        "ID",
        "Status",
        "Created",
        "DeactivationReason",
        "DaysDeactivated",
        "Course",
        "Fullname",
      ],
    },
  });

  return query.data.records.length ? query.data.records[0] : null;
};

export const certStatus = async (
  id: string,
  status: string,
  reason?: string,
) => {
  await connect().patch("[SCDMS]_Certs", {
    records: [
      {
        id: id,
        fields: {
          Status: status,
          DaysDeactivated: 0,
          DeactivationReason: reason,
        },
      },
    ],
  });
};

export const certLookup = async (fullname: string) => {
  const query = await connect().get("[SCDMS]_Certs", {
    params: {
      filterByFormula: `FIND('${fullname}', Fullname)`,
      fields: [
        "ID",
        "Status",
        "Created",
        "DeactivationReason",
        "DaysDeactivated",
        "Course",
        "Fullname",
        "Email"
      ],
    },
  });

  return query.data.records.map((rec: any) => {
    return rec;
  });
};

export const certInsert = async (cert: CertificateMetadata, email: string) => {
  await connect()
    .post("[SCDMS]_Certs", {
      records: [
        {
          fields: {
            ID: cert.id,
            Fullname: cert.fullname,
            Course: cert.course,
            Status: "Active",
            Email: email,
          },
        },
      ],
    })
    .catch((e) => console.log(JSON.stringify(e)));
};
