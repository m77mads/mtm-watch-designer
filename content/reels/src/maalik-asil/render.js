const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const fps=30, dur=22.6, N=Math.round(fps*dur);
  const out=process.argv[2];
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-r',String(fps),out],{stdio:['pipe','inherit','inherit']});
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+process.cwd()+'/reel.html'); await p.evaluate(()=>document.fonts.ready);
  for (let i=0;i<N;i++){ await p.evaluate(t=>render(t), i/fps); const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('frames',N);
})();
