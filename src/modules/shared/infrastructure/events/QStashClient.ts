import { Client } from '@upstash/qstash';
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL!,
});

export default qstashClient;
