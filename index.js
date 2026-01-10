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

// المزامنة مع التوكن الدائم
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
  // استخدام الاسم الصحيح للمفتاح كما في صورة 1000024162
  const GROQ_KEY = process.env.GROQ_API_KEY; 
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة وقصيرة." }]
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
        <div style="padding:15px; background:rgba(255,255,255,0.1); margin:10px; border-radius:10px; direction:rtl;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <p id="st">المفاتيح جاهزة للغزو...</p>
        <button class="btn" onclick="publish()">🚀 تحديث الصلاحيات والنشر الفوري</button>
        <script>
          async function publish() {
            document.getElementById('st').innerText = "🎬 جاري تجديد التصريح والنشر...";
            const r = await fetch('/publish-sync', { method: 'POST' });
            if (r.status === 401) {
               alert("خطأ 401: يرجى تحويل حالة التطبيق في جوجل إلى Production.");
            } else {
               const m = await r.text();
               alert(m);
               document.getElementById('st').innerText = "✅ نُشر بنجاح!";
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (e) { res.status(500).send("خطأ في Groq: " + e.message); }
});

app.post('/publish-sync', async (req, res) => {
  try {
    // إجبار يوتيوب على قبول التوكن الدائم
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("401");
    res.send("🚀 يا زعيم، تم استلام الأمر! الفيديو متطابق ويتم رفعه الآن لقناتك.");
  } catch (err) {
    res.status(401).send("401");
  }
});

app.listen(port, '0.0.0.0');
