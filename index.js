const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

const API_KEY = process.env.GEMINI_API_KEY;
// الرابط اليدوي المباشر لتخطي خطأ 404
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

app.get('/', (req, res) => {
  res.send('<h1>المصنع يعمل بقوة!</h1><a href="/make-viral-video">توليد قصة الآن</a>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: "اكتب قصة رعب قصيرة جداً ومشوقة بالعامية العربية، تنتهي بنهاية صادمة تجذب المتابعين." }]
      }]
    });

    const script = response.data.candidates[0].content.parts[0].text;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#111; color:white; min-height:100vh;">
        <h1 style="color:#00f2ea;">👻 القصة الفيروسية جاهزة</h1>
        <div style="background:#222; padding:20px; border-radius:15px; border-left: 5px solid #ff0050; margin:20px 0; text-align:right; direction:rtl; font-size:22px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">توليد قصة أخرى ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ في الاتصال المباشر: " + (err.response ? JSON.stringify(err.response.data) : err.message));
  }
});

app.listen(port, '0.0.0.0', () => console.log('Direct Connection Server Running!'));
