import PocketBase from 'pocketbase';
import decrypt from './crypto/decrypt.js';
import { UserDocument } from './documents.js';
import AES_Crypto from './crypto/crypto.js';
import encrypt from './crypto/encrypt.js';

const pb = new PocketBase(process.env.POCKETBASE_ENDPOINT);
await pb.admins.authWithPassword(
    process.env.POCKETBASE_USERNAME,
    process.env.POCKETBASE_PASSWORD
)

export const decryptDocument = async (collection: string, id: string) => {
    return pb.collection(collection).getFirstListItem<UserDocument>(`discord_id='${id}'`).then(async (document) => {
        return { data: await decrypt(document), document: document }
    }).catch(() => undefined)
}

// export const decryptRow = async (
//     table: string,
//     id: string,
// ): Promise<AirtableData> => {
//     const query = await connect().get(table, {
//         params: {
//             filterByFormula: `ID = ${id}`,
//             maxRecords: 1,
//         },
//     });

//     if (query.data.records.length != 1) return;
//     const rec = query.data.records[0].fields;
//     const decrypted = await decrypt({
//         DATA: String(rec.DATA),
//         HASH: String(rec.HASH),
//         IV: String(rec.IV),
//         TAG: String(rec.AUTH),
//     });

//     return { DATA: decrypted, RECORD: rec };
// };

export default pb;