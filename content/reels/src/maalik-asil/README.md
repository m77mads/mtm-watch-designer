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
