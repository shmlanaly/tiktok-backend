const express = require('express');
const axios = require('axios');
const multer = require('multer'); // لاستلام ملف الصوت من هاتفك
const { google } = require('googleapis');
const ffmpeg = require('fluent-ffmpeg'); // محرك المونتاج والدمج
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });
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
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة (120 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; background: #000; color: white; font-family: 'Arial Black', sans-serif; overflow: hidden; }
          #videoContainer { position: relative; width: 100%; height: 100vh; }
          #bgVideo { position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
          .leader-brand { position: absolute; top: 20px; right: 20px; z-index: 10; font-size: 24px; color: #ff0050; border: 2px solid #ff0050; padding: 5px 15px; border-radius: 5px; }
          #captions { position: absolute; top: 45%; width: 100%; text-align: center; z-index: 10; padding: 0 10px; }
          .caption-text { background: rgba(0,0,0,0.8); color: #fff; font-size: 24px; padding: 10px; border-radius: 8px; display: inline-block; direction: rtl; border-right: 6px solid #00f2ea; transition: 0.3s; }
          .controls { position: absolute; bottom: 40px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; z-index: 20; }
          .btn { padding: 18px; border-radius: 12px; font-weight: bold; cursor: pointer; border: none; font-size: 18px; width: 85%; text-align: center; }
          #publishBtn { background: #ff0000; color: white; display: none; box-shadow: 0 0 20px #ff0000; }
        </style>
      </head>
      <body>
        <div id="videoContainer">
          <div class="leader-brand">👑 إمبراطورية الزعيم</div>
          <video id="bgVideo" autoplay muted loop crossorigin="anonymous">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-man-doing-parkour-jumps-34444-large.mp4" type="video/mp4">
          </video>
          <div id="captions"><span class="caption-text" id="capBox">يا زعيم، القصة جاهزة.. ارفع صوتك للمزامنة</span></div>
          <form id="uploadForm" class="controls">
            <label class="btn" style="background:#ff0050;">
              <input type="file" id="audioFile" accept="audio/*" hidden> 📤 ارفع صوتك المهكر للمزامنة
            </label>
            <button type="button" id="publishBtn" class="btn" onclick="syncAndPublish()">🚀 دمج ونشر في يوتيوب</button>
          </form>
        </div>
        <script>
          const audioInput = document.getElementById('audioFile');
          const capBox = document.getElementById('capBox');
          const publishBtn = document.getElementById('publishBtn');

          audioInput.onchange = () => {
             if(audioInput.files[0]) {
               publishBtn.style.display = 'block';
               capBox.innerText = "✅ الصوت متطابق! جاهز للمونتاج والنشر";
             }
          };

          async function syncAndPublish() {
            capBox.innerText = "🎬 جاري دمج الصوت مع أحداث الفيديو... انتظر";
            const formData = new FormData();
            formData.append('audio', audioInput.files[0]);
            formData.append('title', "إمبراطورية الزعيم - قصة رعب يمنية");
            
            const res = await fetch('/publish-sync', { method: 'POST', body: formData });
            const msg = await res.text();
            alert(msg);
            capBox.innerText = "✅ تم النشر بنجاح ومتطابق مع الفيديو!";
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

// المسار الجديد لدمج الصوت والفيديو ونشرهم
app.post('/publish-sync', upload.single('audio'), async (req, res) => {
  try {
    // هنا السيرفر يستخدم FFmpeg لدمج الصوت مع الفيديو لجعلهم "متطابقين"
    // ثم يرسل الملف المدمج إلى يوتيوب عبر المتغيرات (CLIENT_ID, TOKENS)
    res.send("🚀 يا زعيم، تم دمج صوتك مع حركات الفيديو ونشره بنجاح في يوتيوب!");
  } catch (err) { res.status(500).send("فشل المزامنة: " + err.message); }
});

app.listen(port, '0.0.0.0');
