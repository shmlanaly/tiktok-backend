const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 8080;

// التأكد من مطابقة أسماء المتغيرات لصورتك (1000023984)
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة جداً." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; background: #000; color: white; font-family: sans-serif; text-align: center; }
          .leader-brand { font-size: 24px; color: #ff0050; padding: 20px; }
          .btn { padding: 15px; background: #ff0000; color: white; border-radius: 10px; cursor: pointer; border: none; width: 80%; }
        </style>
      </head>
      <body>
        <div class="leader-brand">👑 إمبراطورية الزعيم</div>
        <p id="status">ارفع الصوت لتجربة النشر...</p>
        <input type="file" id="audioIn" accept="audio/*">
        <br><br>
        <button class="btn" onclick="publish()">🚀 إعادة محاولة النشر</button>
        <script>
          async function publish() {
            document.getElementById('status').innerText = "جاري المحاولة...";
            const res = await fetch('/publish-sync', { method: 'POST' });
            const result = await res.text();
            alert(result);
            document.getElementById('status').innerText = result;
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/publish-sync', async (req, res) => {
  try {
    // محاولة تجديد المفتاح تلقائياً
    oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });
    const { token } = await oauth2Client.getAccessToken();
    
    if (!token) throw new Error("المفتاح (TOKENS) غير صالح أو منتهي الصلاحية.");

    res.send("✅ المفاتيح تعمل! السيرفر جاهز للغزو الآن.");
  } catch (err) {
    res.status(401).send("خطأ 401: يوتيوب يرفض المفتاح. يرجى التأكد من وضع Refresh Token في Railway.");
  }
});

app.listen(port, '0.0.0.0');
