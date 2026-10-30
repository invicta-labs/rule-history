// Fails (so GitHub sends an email) when a key expires within `warnDaysBefore` days, so it can be replaced in time.
// Keys without a date are listed as a reminder to fill one in.
import { readFileSync } from 'node:fs';

const { warnDaysBefore, keys } = JSON.parse(readFileSync(new URL('./key-dates.json', import.meta.url)));
const today = Date.parse(new Date().toISOString().slice(0, 10));
let due = 0;
for (const k of keys) {
  if (!k.expires) { console.log(`NO DATE: ${k.name} (add its expiry date to canary/key-dates.json)`); continue; }
  const days = Math.round((Date.parse(k.expires) - today) / 864e5);
  if (days <= warnDaysBefore) {
    due++;
    console.error(`RENEW: ${k.name} ${days < 0 ? `expired ${-days} days ago` : `expires in ${days} days`} (${k.expires}). New key at ${k.renewAt}, then replace it in ${k.replaceIn} and update the date here.`);
  } else {
    console.log(`OK: ${k.name} expires in ${days} days (${k.expires})`);
  }
}
if (due) process.exit(1);
