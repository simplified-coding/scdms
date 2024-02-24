import axios from "axios";
import decrypt from "./crypto/decrypt";

export type AirtableData = {
  DATA: any;
  RECORD: any;
};

export const connect = () => {
  return axios.create({
    baseURL: `${process.env.AIRTABLE_ENDPOINT}/v0/${process.env.AIRTABLE_BASE}`,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_APIKEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
};

export const decryptRow = async (
  table: string,
  id: string,
): Promise<AirtableData> => {
  const query = await connect().get(table, {
    params: {
      filterByFormula: `ID = ${id}`,
      maxRecords: 1,
    },
  });

  if (query.data.records.length != 1) return;
  const rec = query.data.records[0].fields;
  const decrypted = await decrypt({
    DATA: String(rec.DATA),
    HASH: String(rec.HASH),
    IV: String(rec.IV),
    TAG: String(rec.AUTH),
  });

  return { DATA: decrypted, RECORD: rec };
};

export default connect;
