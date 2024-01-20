import airtable from "airtable";

export const connect = () => {
  return new airtable({
    apiKey: process.env.AIRTABLE_APIKEY,
    endpointUrl: process.env.AIRTABLE_ENDPOINT,
  }).base(process.env.AIRTABLE_BASE);
};

export default connect;
