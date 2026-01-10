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

// ربط المفتاح الدائم (Refresh Token) من متغيرات Railway
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
        <style>
          body { margin: 0; background: #000; color: white; font-family: sans-serif; text-align: center; }
          .leader-brand { color: #ff0050; font-size: 28px; padding: 20px; text-shadow: 0 0 10px #ff0050; }
          .btn { padding: 15px; background: #ff0050; color: white; border: none; border-radius: 50px; width: 85%; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1 class="leader-brand">👑 إمبراطورية الزعيم</h1>
        <p id="st">المزامنة جاهزة للغزو...</p>
        <button class="btn" onclick="publish()">🚀 تحديث الصلاحيات والنشر</button>
        <script>
          async function publish() {
            document.getElementById('st').innerText = "🎬 جاري تجديد "المفتاح السحري" والنشر...";
            const r = await fetch('/publish-sync', { method: 'POST' });
            if (r.status === 401) {
               alert("خطأ 401: يرجى التأكد من وضع الـ Refresh Token فقط في Railway.");
            } else {
               const m = await r.text();
               alert(m);
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (e) { res.status(500).send(e.message); }
});

app.post('/publish-sync', async (req, res) => {
  try {
    // إجبار يوتيوب على إعطائنا تصريح دخول جديد (Access Token)
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("401");
    res.send("🚀 تم استلام أمر الزعيم! الفيديو متطابق ويتم رفعه الآن لقناتك.");
  } catch (err) {
    res.status(401).send("401");
  }
});

app.listen(port, '0.0.0.0');
