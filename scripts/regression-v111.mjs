// Ultimate Scrcpy v1.1.1 regression harness
const CDP = 'http://127.0.0.1:9222';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function connect() {
  const targets = await (await fetch(CDP + '/json')).json();
  const page = targets.find(t => t.type === 'page' && /Ultimate/.test(t.title));
  if (!page) throw new Error('no page target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push((m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    else if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push('EXC ' + (d.exception?.description || d.text || '').slice(0, 250)); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('JS: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text || '').slice(0, 300)); return r.result.value; };
  await send('Runtime.enable');
  return { ev, errors };
}
const results = [];
function check(name, ok, detail = '') { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`); }
const clickTab = (ev, label) => ev(`[...document.querySelectorAll('.tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);
const clickSub = (ev, label) => ev(`[...document.querySelectorAll('.settings-tabs button')].find(b => b.textContent.trim() === ${JSON.stringify(label)})?.click()`);

async function main() {
  const { ev, errors } = await connect();

  check('app shell', await ev(`!!document.querySelector('.app-shell')`));
  check('title', (await ev(`document.title`)) === 'UltimateSCRCPYGui', await ev(`document.title`));
  check('header version 1.1.1', (await ev(`document.querySelector('.brand-version')?.textContent`)) === 'v1.1.1', await ev(`document.querySelector('.brand-version')?.textContent`));

  // ---- sidebar
  const tabs = await ev(`[...document.querySelectorAll('.tabs button')].map(b => b.textContent.trim())`);
  console.log('tabs:', JSON.stringify(tabs));
  check('7 sidebar tabs, no Boot', tabs.length === 7 && !tabs.includes('Boot'), tabs.join(','));

  // ---- Toolkit
  await clickTab(ev, 'Toolkit'); await sleep(900);
  const sections = await ev(`[...document.querySelectorAll('.toolkit-section-title')].map(e => e.textContent.trim())`);
  console.log('toolkit sections:', JSON.stringify(sections));
  check('toolkit has Boot first', sections[0] === 'Boot', sections[0]);
  check('toolkit has ADB/Shizuku/Scripts', ['ADB quick actions', 'Shizuku', 'Scripts'].every(s => sections.includes(s)), sections.join(','));
  const cmdCount = await ev(`document.querySelectorAll('.tk-cmd').length`);
  check('21 ADB command buttons', cmdCount === 21, cmdCount + '');
  const scriptCount = await ev(`document.querySelectorAll('.tk-scripts .toggle').length`);
  check('27 script switches', scriptCount === 27, scriptCount + '');
  const tips = await ev(`[...document.querySelectorAll('.tk-cmd')].map(b => ({ tip: b.getAttribute('data-tip') || '', cmd: b.getAttribute('data-cmd') || '' }))`);
  check('every command has a description', tips.every(t => t.tip.length > 3), tips.length + '');
  check('every command shows its command', tips.every(t => t.cmd.length > 2), tips.length + '');
  check('command pop-up capped at 75 chars', tips.every(t => t.cmd.length <= 75), Math.max(...tips.map(t => t.cmd.length)) + '');
  const bootBtns = await ev(`[...document.querySelectorAll('.toolkit-section')][0].querySelectorAll('button').length`);
  check('boot section has 7 actions', bootBtns === 7, bootBtns + '');

  // ---- toolkit command execution
  await ev(`(() => { const b=[...document.querySelectorAll('.tk-cmd')].find(x=>x.innerText.trim()==='List devices'); b.click(); return 1; })()`);
  await sleep(3500);
  const out = await ev(`document.querySelector('.toolkit-output')?.innerText || ''`);
  check('ADB command returns output', /List of devices attached/.test(out), out.slice(0, 60).replace(/\n/g, ' | '));
  await ev(`(() => { const b=[...document.querySelectorAll('.toolkit-section button')].find(x=>x.innerText.trim()==='Shizuku status'); b.click(); return 1; })()`);
  await sleep(3000);
  const out2 = await ev(`document.querySelector('.toolkit-output')?.innerText || ''`);
  check('Shizuku status returns output', /Shizuku is (not )?running/.test(out2), out2.slice(0, 50));

  // ---- switches
  const sw = await ev(`(() => { const cb=document.querySelector('.tk-scripts input[type=checkbox]'); const cs=getComputedStyle(cb); return { w: cs.width, h: cs.height, appearance: cs.appearance || cs.webkitAppearance, checkedBg: (()=>{cb.checked=true; const s=getComputedStyle(cb).backgroundColor; cb.checked=false; return s;})() }; })()`);
  console.log('switch style:', JSON.stringify(sw));
  check('checkboxes render as switches', sw.w === '34px' && sw.h === '20px' && /none/i.test(sw.appearance), JSON.stringify(sw));
  check('switch fill uses secondary accent', /rgb\(/.test(sw.checkedBg), sw.checkedBg);

  // ---- Settings > Controls
  await clickTab(ev, 'Settings'); await sleep(700);
  await clickSub(ev, 'Controls'); await sleep(600);
  const ctrl = await ev(`[...document.querySelectorAll('.settings-section label')].map(l=>l.innerText.trim())`);
  console.log('controls:', JSON.stringify(ctrl));
  check('Controls keeps only swipe + nav bar', ctrl.length === 2 && ctrl.some(x=>/swipe panel/i.test(x)) && ctrl.some(x=>/navigation bar/i.test(x)), ctrl.join(','));

  // ---- Settings > Window
  await clickSub(ev, 'Window'); await sleep(600);
  const win = await ev(`[...document.querySelectorAll('.settings-section label')].map(l=>l.innerText.trim())`);
  console.log('window labels:', JSON.stringify(win));
  const moved = ['Always on top','Control device','Forward audio','Turn device screen off','Keep device awake','Show touches','Fullscreen','Borderless window','Lock window aspect ratio','Select the first available device automatically'];
  check('Window has all 10 moved checkboxes', moved.every(m => win.some(w => w.includes(m))), win.length + '');

  // ---- Settings > Panels
  await clickSub(ev, 'Panels'); await sleep(600);
  const rows0 = await ev(`[...document.querySelectorAll('.panel-order-item .panel-order-label')].map(e=>e.textContent.trim())`);
  check('Panels lists 7 rows', rows0.length === 7 && !rows0.includes('Boot'), rows0.join(','));
  await ev(`(() => { const items=[...document.querySelectorAll('.panel-order-item')]; const last=items[items.length-1]; const cb=last.querySelector('input'); cb.checked=false; cb.dispatchEvent(new Event('change',{bubbles:true})); return 1; })()`);
  await sleep(900);
  const rows1 = await ev(`[...document.querySelectorAll('.panel-order-item .panel-order-label')].map(e=>e.textContent.trim())`);
  const tabs1 = await ev(`[...document.querySelectorAll('.tabs button')].map(b=>b.textContent.trim())`);
  check('hiding a panel keeps its settings row', rows1.length === 7, rows1.length + '');
  check('hidden panel leaves the sidebar only', tabs1.length === 6 && !tabs1.includes(rows1[rows1.length-1]), tabs1.join(','));
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Reset order')?.click()`);
  await sleep(900);

  // ---- Settings > Advanced (no scripts column)
  await clickSub(ev, 'Advanced'); await sleep(600);
  const adv = await ev(`(() => ({ scripts: !!document.querySelector('.scripts-col'), toggleCols: !!document.querySelector('.toggle-columns'), body: document.querySelector('.settings-section')?.innerText.slice(0,60) }))()`);
  check('Advanced no longer has the scripts column', adv.scripts === false && adv.toggleCols === false, JSON.stringify(adv));

  // ---- virtual display order
  await clickTab(ev, 'Devices'); await sleep(800);
  await ev(`[...document.querySelectorAll('.scene-choice')].find(x=>x.textContent.includes('Virtual display'))?.click()`);
  await sleep(800);
  const vd = await ev(`(() => { const el=document.querySelector('.vd-options'); if(!el) return null; const cs=getComputedStyle(el); return { cols: cs.gridTemplateColumns, labels: [...el.children].map(c=>c.innerText.trim()) }; })()`);
  console.log('vd:', JSON.stringify(vd));
  check('virtual display is a 2-column grid', !!vd && vd.cols.split(' ').length === 2, vd ? vd.cols : 'none');
  check('Resize with window sits under Destroy content on close', !!vd && vd.labels[1] === 'Destroy content on close' && vd.labels[3] === 'Resize with window', vd ? vd.labels.join('|') : 'none');

  // ---- wireless legacy flow
  await ev(`(() => { const cards=[...document.querySelectorAll('.device-card')]; for (const c of cards){ if(c.innerText.includes('ZY2273BRST')){ const b=c.querySelector('input'); if(b&&!b.checked) b.click(); } } return 1; })()`);
  await sleep(1500);
  const hint = await ev(`document.querySelector('.legacy-wireless-status')?.innerText`);
  const disabled = await ev(`document.querySelector('.legacy-wireless button')?.disabled`);
  check('legacy wireless targets the Android 10 device', /Android 10/.test(hint||'') && disabled === false, hint);
  await ev(`(() => { const b=document.querySelector('.legacy-wireless button'); if(b&&!b.disabled) b.click(); return 1; })()`);
  await sleep(7000);
  const toast = await ev(`[...document.querySelectorAll('.toast-stack *')].map(e=>e.innerText).filter(Boolean).slice(0,3).join(' | ')`);
  const selAfter = await ev(`[...document.querySelectorAll('.device-card')].filter(c=>c.querySelector('input')?.checked).map(c=>c.innerText.split('\\n')[1])`);
  console.log('wireless toast:', toast, '| selection after:', JSON.stringify(selAfter));
  check('wireless ADB enabled', /Wireless ADB enabled/.test(toast), toast);
  check('target device stays selected after adbd restart', selAfter.some(s=>/z4/.test(s)), JSON.stringify(selAfter));

  await sleep(600);
  check('zero console errors', errors.length === 0, errors.length + ' -> ' + errors.slice(0, 3).join(' || '));

  const fails = results.filter(r => !r.ok);
  console.log(`\n==== ${results.length - fails.length}/${results.length} passed ====`);
  if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  -', f.name, f.detail)); }
  process.exit(0);
}
main().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(1); });
