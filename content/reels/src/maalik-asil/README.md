# مصدر ريل «الأصيل» (معاليك)

الفيديو مصنوع بالكود: صفحة `reel.html` ترسم كل فريم حسب الوقت `render(t)`، و`render.js` يصوّر ٣٠ فريم بالثانية بالمتصفح ويجمعها بـ ffmpeg.

```bash
cd content/reels/src/maalik-asil
node render.js ../../2026-11-07-maalik-asil.mp4
```

- تحتاج Node + Playwright + ffmpeg.
- عشان تعدّل نص البطاقات: غيّر عناصر `.card` في `reel.html`.
- عشان تعدّل التوقيت: غيّر الكائنات `S` و `C` في السكربت.
- الخطوط: Tajawal و Amiri من Google Fonts (رخصة OFL).

## اللقطات الحقيقية (أول ١٠ ثواني)
أول أربع مشاهد لقطات خيل مولّدة بـ Gemini (في مجلد `footage/`)، والبطاقات فوقها. الكود يركّب `base.mp4` (اللقطات + أسود) ويحط فوقه فريمات الصفحة الشفافة:

```bash
G1=footage/gemini-horse-standing.mp4; G2=footage/gemini-herd-gallop.mp4
SC="scale=1080:1920:flags=lanczos,fps=30,setsar=1"
ffmpeg -y -ss 0 -t 2.6 -i $G2 -ss 6.2 -t 2.4 -i $G2 -ss 0.2 -t 2.6 -i $G1 -ss 4.4 -t 2.9 -i $G1 \
  -f lavfi -t 12.1 -i "color=c=black:s=1080x1920:r=30" \
  -filter_complex "[0:v]$SC[a];[1:v]$SC,colorbalance=rs=.08:bs=-.08[b];[2:v]$SC[c];[3:v]$SC[d];[4:v]setsar=1[e];[a][b][c][d][e]concat=n=5:v=1:a=0[o]" \
  -map "[o]" -c:v libx264 -crf 16 -pix_fmt yuv420p base.mp4
node render.js ../../2026-11-07-maalik-asil.mp4 base.mp4
```
