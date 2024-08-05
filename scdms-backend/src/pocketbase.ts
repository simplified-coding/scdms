import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_ENDPOINT);

export default pb;