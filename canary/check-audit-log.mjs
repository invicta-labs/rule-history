// Daily check that Jira's automation audit log still answers in the shape Automation Rule History expects.
// Prints only pass/fail; never prints the answer, which contains names of rules and people.
const { ATLASSIAN_EMAIL: email, ATLASSIAN_API_TOKEN: token, CLOUD_ID: cloudId } = process.env;
const auth = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
const fail = msg => { console.error(`FAILED: ${msg}`); process.exit(1); };

const res = await fetch(`https://api.atlassian.com/automation/internal-api/jira/${cloudId}/pro/rest/GLOBAL/auditlog`, {
  method: 'POST',
  headers: { Authorization: auth, Accept: 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify({ offset: 0, limit: 100 })
});
if (!res.ok) fail(`audit log answered HTTP ${res.status}`);
const body = await res.json().catch(() => fail('answer is not JSON'));
if (!body.items || !Array.isArray(body.items.items)) fail('answer has no items.items list');
const changes = body.items.items.filter(i => i.category === 'CONFIG_CHANGE');
if (!changes.length) fail('no rule changes in the audit log (edit any rule on the test site, then rerun)');
const ok = changes.filter(i => i.ruleIdUuid && typeof i.eventTimestamp === 'number'
  && (i.associatedIds || []).some(a => a.startsWith('USER_')));
if (ok.length !== changes.length) fail(`${changes.length - ok.length} of ${changes.length} rule changes miss the rule id, time or user`);
console.log(`OK: ${ok.length} rule changes with rule id, time and user`);
