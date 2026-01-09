const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  // المفتاح الجديد سيقرأه السيرفر من إعدادات Railway
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة جداً، تنتهي بنهاية تجعل المشاهد يصاب بالذهول." }] }]
    });

    const script = response.data.candidates[0].content.parts[0].text;
    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🚀 تم الربط بحساب Gemini Pro بنجاح</h1>
        <div style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:22px; line-height:1.6;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="margin-top:20px; padding:15px; background:#ff0050; color:white; border:none; border-radius:10px; cursor:pointer;">توليد قصة أخرى من Pro ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ في المفتاح الجديد: " + (err.response ? JSON.stringify(err.response.data.error) : err.message));
  }
});

app.listen(port, '0.0.0.0', () => console.log('Pro Server is Online!'));
