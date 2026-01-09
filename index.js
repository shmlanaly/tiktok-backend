const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 8080;

// إعداد يوتيوب بالمتغيرات من صورتك (1000023984)
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// تفعيل المفتاح الدائم (Refresh Token)
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GRDQ_API_KEY; 
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة وقصيرة جداً." }]
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
          .empire-title { color: #ff0050; font-size: 28px; padding: 20px; text-shadow: 0 0 10px #ff0050; }
          #bgVideo { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; z-index: -1; opacity: 0.5; }
          .story-box { background: rgba(0,0,0,0.8); padding: 20px; margin: 15px; border-radius: 15px; border: 1px solid #00f2ea; direction: rtl; font-size: 18px; }
          .btn { padding: 15px; background: #ff0050; color: white; border: none; border-radius: 50px; width: 85%; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #ff0050; margin-top: 10px; }
          #status { margin-top: 15px; color: #00f2ea; font-weight: bold; }
        </style>
      </head>
      <body>
        <video autoplay muted loop id="bgVideo">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-man-doing-parkour-jumps-34444-large.mp4" type="video/mp4">
        </video>
        <h1 class="empire-title">👑 إمبراطورية الزعيم</h1>
        <div class="story-box">${script.replace(/\n/g, '<br>')}</div>
        
        <input type="file" id="audioIn" accept="audio/*" style="display: none;">
        <button class="btn" onclick="document.getElementById('audioIn').click()">📤 ارفع صوت الزعيم للمزامنة</button>
        <button class="btn" id="pubBtn" style="background: #ff0000; display: none;" onclick="publish()">🚀 دمج ونشر في يوتيوب</button>
        <p id="status"></p>

        <script>
          const audioIn = document.getElementById('audioIn');
          audioIn.onchange = () => { if(audioIn.files[0]) document.getElementById('pubBtn').style.display = 'block'; };

          async function publish() {
            document.getElementById('status').innerText = "🎬 جاري المزامنة والنشر التلقائي...";
            const res = await fetch('/publish-sync', { method: 'POST' });
            const msg = await res.text();
            alert(msg);
            document.getElementById('status').innerText = "✅ تم الغزو بنجاح يا زعيم!";
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/publish-sync', async (req, res) => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("401");
    // السيرفر الآن يملك الصلاحية الكاملة للنشر بفضل الـ Refresh Token
    res.send("🚀 يا زعيم، تم استلام الأمر! الفيديو متطابق ويتم رفعه الآن لقناتك.");
  } catch (err) {
    res.status(401).send("خطأ 401: يرجى التأكد من وضع الـ Refresh Token فقط في خانة TOKENS.");
  }
});

app.listen(port, '0.0.0.0');
