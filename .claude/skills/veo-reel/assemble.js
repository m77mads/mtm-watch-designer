#!/usr/bin/env node
// Build a silent text-card reel from Veo clips + a JSON spec.
//   node assemble.js spec.json out.mp4
// spec: { brand: "maalik"|"mtm",
//         shots: [{ clip, start, dur, grade?: "warm"|"dark"|"none" }],   // clip paths relative to the spec file
//         cards: [{ t0, t1, title, sub?, tag?, top? }],                    // "**word**" = accent colour, "\n" = line break
//         end:   { dur, cta, sub } }                                       // logo + keyword card
const fs = require('fs'), path = require('path');
const { spawnSync, spawn } = require('child_process');
const { chromium } = require('playwright');

(async () => {
  const [specPath, out] = process.argv.slice(2);
  if (!specPath || !out) { console.error('usage: node assemble.js spec.json out.mp4'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const dir = path.dirname(path.resolve(specPath));
  const fps = 30;
  spec.shotsDur = spec.shots.reduce((a, s) => a + s.dur, 0);
  const total = spec.shotsDur + spec.end.dur;

  // 1. base track: shots scaled to 1080x1920, then black for the end card
  const SC = 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1';
  const GR = { warm: ',colorbalance=rs=.08:gs=-.02:bs=-.08,eq=saturation=1.1', dark: ',eq=brightness=-0.06:contrast=1.1', none: '' };
  const args = ['-y', '-v', 'error'];
  spec.shots.forEach(s => args.push('-ss', String(s.start || 0), '-t', String(s.dur), '-i', path.resolve(dir, s.clip)));
  args.push('-f', 'lavfi', '-t', String(spec.end.dur + 0.2), '-i', 'color=c=black:s=1080x1920:r=30');
  const n = spec.shots.length;
  let fc = spec.shots.map((s, i) => `[${i}:v]${SC}${GR[s.grade || 'none'] || ''}[v${i}]`).join(';');
  fc += `;[${n}:v]setsar=1[vend];` + spec.shots.map((_, i) => `[v${i}]`).join('') + `[vend]concat=n=${n + 1}:v=1:a=0[o]`;
  const base = out.replace(/\.mp4$/, '') + '.base.mp4';
  args.push('-filter_complex', fc, '-map', '[o]', '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', base);
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);

  // 2. overlay transparent card frames
  const N = Math.round(fps * total);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-i', base, '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-filter_complex', '[0:v][1:v]overlay=0:0:shortest=1[v]', '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'cards.html'));
  await p.evaluate(s => setup(s), spec);
  await p.evaluate(() => document.fonts.ready);
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => render(t), i / fps);
    const buf = await p.screenshot({ type: 'png', omitBackground: true });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  fs.unlinkSync(base);
  console.log(`done: ${out} (${total.toFixed(1)}s, ${N} frames)`);
})();
