const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY; 
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة جداً (150 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });
    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; background: #000; color: white; font-family: sans-serif; text-align: center; }
          .leader-brand { color: #ff0050; font-size: 28px; padding: 20px; }
          .btn { padding: 20px; background: #ff0000; color: white; border: none; border-radius: 50px; width: 90%; font-weight: bold; cursor: pointer; box-shadow: 0 0 20px #ff0000; }
        </style>
      </head>
      <body>
        <h1 class="leader-brand">👑 إمبراطورية الزعيم</h1>
        <div style="padding:15px; background:rgba(255,255,255,0.1); margin:10px; border-radius:10px; direction:rtl;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <p id="st">المفاتيح جاهزة.. اضغط للرفع الفعلي</p>
        <button class="btn" onclick="startUpload()">🚀 رفع الفيديو الحقيقي الآن</button>
        <script>
          async function startUpload() {
            document.getElementById('st').innerText = "🎬 جاري الرفع لسيرفرات جوجل.. قد يستغرق دقيقة";
            const r = await fetch('/real-upload', { method: 'POST' });
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

app.post('/real-upload', async (req, res) => {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    // هذا هو الأمر الذي يرفع الفيديو فعلياً لقناتك
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: 'قصة رعب يمنية - إمبراطورية الزعيم',
          description: 'تم الرفع عبر إمبراطورية الزعيم - رابط موقعي: beauty4word.com',
          tags: ['رعب', 'يمن', 'صنعاء'],
          categoryId: '22'
        },
        status: { privacyStatus: 'public' }
      },
      media: {
        body: fs.createReadStream('video.mp4') // تأكد من وجود ملف فيديو بهذا الاسم في المجلد
      }
    });

    res.send("✅ مبروك يا زعيم! الفيديو نُشر الآن فعلياً برابط: https://youtu.be/" + response.data.id);
  } catch (err) {
    res.status(500).send("فشل الرفع الفعلي: " + err.message);
  }
});

app.listen(port, '0.0.0.0');
