const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 8080;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// الربط الذكي بمفتاح الزعيم
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GRDQ_API_KEY; 
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة جداً." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });
    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; background: #000; color: white; font-family: sans-serif; text-align: center; }
          .title { color: #ff0050; font-size: 28px; padding: 20px; }
          .btn { padding: 15px; background: #ff0050; color: white; border: none; border-radius: 50px; width: 85%; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1 class="title">👑 إمبراطورية الزعيم</h1>
        <p id="st">جاهز للغزو...</p>
        <button class="btn" onclick="publish()">🚀 إعادة محاولة النشر (تحديث المفاتيح)</button>
        <script>
          async function publish() {
            document.getElementById('st').innerText = "جاري التجديد والنشر...";
            const r = await fetch('/publish-sync', { method: 'POST' });
            const m = await r.text();
            alert(m);
            document.getElementById('st').innerText = m;
          }
        </script>
      </body>
      </html>
    `);
  } catch (e) { res.status(500).send(e.message); }
});

app.post('/publish-sync', async (req, res) => {
  try {
    // إجبار السيرفر على سحب Access Token جديد باستخدام الـ Refresh Token
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("401");
    res.send("✅ تم تجديد المفتاح بنجاح! السيرفر متصل بقناتك الآن.");
  } catch (err) {
    res.status(401).send("خطأ 401: جوجل يرفض الدخول. تأكد من وضع الـ Refresh Token فقط في TOKENS.");
  }
});

app.listen(port, '0.0.0.0');
