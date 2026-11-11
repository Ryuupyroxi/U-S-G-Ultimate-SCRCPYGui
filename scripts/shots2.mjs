import fs from 'node:fs';
const CDP = 'http://127.0.0.1:9222';
const OUT = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/usgui/shots2';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function connect() {
  const targets = await (await fetch(CDP + '/json')).json();
  const page = targets.find(t => t.type === 'page' && /Ultimate/.test(t.title));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('JS: ' + (r.exceptionDetails.exception?.description || '').slice(0, 300)); return r.result.value; };
  await send('Runtime.enable'); await send('Page.enable');
  return { ev, send };
}
async function shot(send, name) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, 'base64'));
  console.log('saved', name);
}
const clickTab = (ev, label) => ev(`[...document.querySelectorAll('.tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);
const clickSub = (ev, label) => ev(`[...document.querySelectorAll('.settings-tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);
async function main() {
  const { ev, send } = await connect();
  const which = process.argv[2] || 'all';
  if (which === 'all' || which === 'toolkit') { await clickTab(ev, 'Toolkit'); await sleep(900); await shot(send, 'toolkit'); }
  if (which === 'all' || which === 'settings') {
    await clickTab(ev, 'Settings'); await sleep(800);
    for (const s of ['Controls', 'Window', 'Panels', 'Advanced']) {
      await clickSub(ev, s); await sleep(700); await shot(send, `settings-${s.toLowerCase()}`);
    }
  }
  if (which === 'all' || which === 'devices') { await clickTab(ev, 'Devices'); await sleep(800); await shot(send, 'devices'); }
  process.exit(0);
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
