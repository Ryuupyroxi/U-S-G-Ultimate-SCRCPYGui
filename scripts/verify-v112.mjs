import fs from 'node:fs';
const CDP = 'http://127.0.0.1:9222';
const OUT = 'verify-now';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(CDP + '/json')).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const {resolve,reject}=pending.get(m.id); pending.delete(m.id); m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result); } };
const send = (method, params={}) => new Promise((resolve,reject)=>{const mid=++id;pending.set(mid,{resolve,reject});ws.send(JSON.stringify({id:mid,method,params}));});
const ev = async (e) => { const r = await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error('JS: '+(r.exceptionDetails.exception?.description||'').slice(0,400)); return r.result.value; };
const shot = async (n) => { const r = await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(`${OUT}/${n}`, Buffer.from(r.data,'base64')); };

await send('Runtime.enable'); await send('Page.enable');
await sleep(1000);

const clickTab = async (label) => ev(`[...document.querySelectorAll('.tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);
const clickSub = async (label) => ev(`[...document.querySelectorAll('.settings-tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);

// ---- Devices: Screen scene
await clickTab('Devices'); await sleep(800);
const scenes = await ev(`[...document.querySelectorAll('.scene-choice')].map(b => b.textContent.trim())`);
console.log('scene choices:', JSON.stringify(scenes));
await ev(`[...document.querySelectorAll('.scene-choice')].find(b => b.textContent.trim().startsWith('Screen'))?.click()`);
await sleep(900);
const screenPanel = await ev(`(() => {
  const secs = [...document.querySelectorAll('main section')];
  const s = secs.find(x => /Physical display source/.test(x.innerText));
  if (!s) return { found:false, sections: secs.map(x => x.innerText.split('\\n')[0]) };
  const toggles = [...s.querySelectorAll('.toggle')].map(l => ({
    text: l.querySelector('span')?.textContent.trim(),
    tip: l.getAttribute('data-tip') || ''
  }));
  return { found:true, headings: [...s.querySelectorAll('strong')].map(e=>e.textContent.trim()),
           inlineBlocks: s.querySelectorAll('.display-options-inline').length,
           toggleGrids: s.querySelectorAll('.toggle-grid').length,
           toggles };
})()`);
console.log('SCREEN PANEL:', JSON.stringify(screenPanel, null, 1));
await shot('verify-screen-scene.png');

// ---- Devices: Virtual display scene
await ev(`[...document.querySelectorAll('.scene-choice')].find(b => /Virtual display/i.test(b.textContent))?.click()`);
await sleep(900);
const vdPanel = await ev(`(() => {
  const secs = [...document.querySelectorAll('main section')];
  const s = secs.find(x => /Virtual display lifecycle/i.test(x.innerText));
  if (!s) return { found:false, sections: secs.map(x => x.innerText.split('\\n')[0]) };
  const toggles = [...s.querySelectorAll('.toggle')].map(l => ({
    text: l.querySelector('span')?.textContent.trim(),
    tip: l.getAttribute('data-tip') || ''
  }));
  return { found:true, headings: [...s.querySelectorAll('strong')].map(e=>e.textContent.trim()),
           inlineBlocks: s.querySelectorAll('.display-options-inline').length,
           toggleGrids: s.querySelectorAll('.toggle-grid').length,
           toggles };
})()`);
console.log('VIRTUAL DISPLAY PANEL:', JSON.stringify(vdPanel, null, 1));
await shot('verify-vd-scene.png');

// ---- Settings > Window
await clickTab('Settings'); await sleep(700);
const subs = await ev(`[...document.querySelectorAll('.settings-tabs button')].map(b=>b.textContent.trim())`);
console.log('settings subtabs:', JSON.stringify(subs));
await clickSub('Window'); await sleep(700);
const win = await ev(`(() => ({
  toggles: [...document.querySelectorAll('.toggle')].map(l => l.querySelector('span')?.textContent.trim()).filter(Boolean),
  text: document.querySelector('main')?.innerText.slice(0, 800)
}))()`);
console.log('SETTINGS>WINDOW toggles:', JSON.stringify(win.toggles));
await shot('verify-settings-window.png');

// ---- Settings > Advanced
await clickSub('Advanced'); await sleep(700);
const adv = await ev(`(() => ({
  toggles: [...document.querySelectorAll('.toggle')].map(l => ({ t: l.querySelector('span')?.textContent.trim(), tip: l.getAttribute('data-tip')||'' })).filter(x=>x.t)
}))()`);
console.log('SETTINGS>ADVANCED toggles:', JSON.stringify(adv.toggles, null, 1));
await shot('verify-settings-advanced.png');

process.exit(0);
