// Dump a full inventory of toggles grouped by UI container, for one running app.
// usage: node dump-inventory.mjs <port> <outfile>
import fs from 'node:fs';
const PORT = process.argv[2];
const OUT = process.argv[3];
const CDP = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(CDP + '/json')).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const {resolve,reject}=pending.get(m.id); pending.delete(m.id); m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result); } };
const send = (method, params={}) => new Promise((resolve,reject)=>{const mid=++id;pending.set(mid,{resolve,reject});ws.send(JSON.stringify({id:mid,method,params}));});
const ev = async (e) => { const r = await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error('JS: '+(r.exceptionDetails.exception?.description||'').slice(0,300)); return r.result.value; };
await send('Runtime.enable');

const lines = [];
const emit = (s) => { lines.push(s); };

const clickTab = async (label) => ev(`[...document.querySelectorAll('.tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);
const clickSub = async (label) => ev(`[...document.querySelectorAll('.settings-tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);

// Dump every toggle on the current screen as: containerPath > label
const dumpToggles = async (tag) => {
  const data = await ev(`(() => {
    const out = [];
    document.querySelectorAll('.toggle').forEach(el => {
      const label = el.querySelector('span')?.textContent.trim() || '';
      if (!label) return;
      // build a container path from the nearest headed card/section
      const parts = [];
      let n = el;
      for (let i = 0; i < 8 && n; i++) {
        n = n.parentElement;
        if (!n) break;
        const h = n.querySelector(':scope > div > strong, :scope > strong, :scope > h2, :scope > h3');
        if (h && h.textContent.trim()) { parts.unshift(h.textContent.trim()); break; }
      }
      const section = el.closest('section');
      const sid = section ? section.className : '';
      out.push({ label, card: parts[0] || '', section: sid });
    });
    return out;
  })()`);
  for (const d of data) emit(`${tag} | ${d.card} | ${d.label}`);
};

// ---- Devices: each scene
await clickTab('Devices'); await sleep(900);
const scenes = await ev(`[...document.querySelectorAll('.scene-choice')].map(b => b.textContent.trim())`);
for (const s of scenes) {
  const key = s.split(/^(Screen|Camera|Virtual display|Record only|Control only|OTG)/)[1] || s;
  await ev(`[...document.querySelectorAll('.scene-choice')].find(b => b.textContent.trim() === ${JSON.stringify(s)})?.click()`);
  await sleep(700);
  await dumpToggles(`Devices/${key}`);
}

// ---- Toolkit
await clickTab('Toolkit'); await sleep(900);
await dumpToggles('Toolkit');

// ---- Settings: each subtab
await clickTab('Settings'); await sleep(900);
const subs = await ev(`[...document.querySelectorAll('.settings-tabs button')].map(b => b.textContent.trim())`);
for (const s of subs) {
  await clickSub(s); await sleep(600);
  await dumpToggles(`Settings/${s}`);
}

fs.writeFileSync(OUT, lines.join('\n') + '\n');
console.log(`wrote ${lines.length} rows -> ${OUT}`);
process.exit(0);
