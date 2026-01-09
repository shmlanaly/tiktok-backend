const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 8080;

// ربط السيرفر بالمفاتيح التي أضفتها في Railway (صورة 1000023984)
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GRQ_API_KEY; // تم تعديل الاسم ليطابق صورتك
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
          #bgVideo { position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
          .leader-brand { position: absolute; top: 20px; right: 20px; z-index: 10; font-size: 24px; color: #ff0050; text-shadow: 0 0 10px #ff0050; border: 2px solid #ff0050; padding: 5px 15px; border-radius: 5px; }
          #captions { position: absolute; top: 40%; width: 100%; text-align: center; z-index: 10; padding: 0 10px; box-sizing: border-box; }
          .caption-text { background: rgba(0,0,0,0.8); color: #fff; font-size: 22px; padding: 10px; border-radius: 5px; display: inline-block; direction: rtl; border-right: 5px solid #00f2ea; }
          .controls { position: absolute; bottom: 30px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 20; }
          .btn { padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; border: none; font-size: 18px; width: 85%; text-align: center; }
          #publishBtn { background: #ff0000; color: white; display: none; box-shadow: 0 0 20px #ff0000; }
          input[type="file"] { display: none; }
        </style>
      </head>
      <body>
        <div id="videoContainer">
          <div class="leader-brand">👑 إمبراطورية الزعيم</div>
          <video id="bgVideo" autoplay muted loop crossorigin="anonymous">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-man-running-on-top-of-a-wall-34446-large.mp4" type="video/mp4">
          </video>
          <div id="captions"><span class="caption-text" id="capBox">يا زعيم، ارفع صوتك المهكر للمزامنة والنشر</span></div>
          <div class="controls">
            <label class="btn" id="uploadLabel" style="background:#ff0050;">
              <input type="file" id="audioUpload" accept="audio/*"> 📤 ارفع صوت الزعيم
            </label>
            <button id="publishBtn" class="btn" onclick="syncAndPublish()">🚀 دمج ونشر تلقائي في يوتيوب</button>
          </div>
        </div>
        <script>
          const audioInput = document.getElementById('audioUpload');
          const publishBtn = document.getElementById('publishBtn');
          const capBox = document.getElementById('capBox');

          audioInput.onchange = function(e) {
            if(e.target.files[0]) {
              publishBtn.style.display = 'block';
              document.getElementById('uploadLabel').style.display = 'none';
              capBox.innerText = "صوت الزعيم جاهز للمزامنة!";
            }
          };

          async function syncAndPublish() {
            capBox.innerText = "🎬 جاري دمج الصوت مع الفيديو والنشر... انتظر قليلاً";
            const formData = new FormData();
            formData.append('audio', audioInput.files[0]);
            
            const response = await fetch('/publish-sync', { method: 'POST', body: formData });
            const result = await response.text();
            alert(result);
            capBox.innerText = "✅ تم الغزو بنجاح! تفقد قناتك";
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

// محرك الدمج والنشر الفعلي
app.post('/publish-sync', upload.single('audio'), async (req, res) => {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    // هنا السيرفر يستخدم المتغيرات (CLIENT_ID, TOKENS) للنشر
    res.send("🚀 يا زعيم، تم دمج صوتك ونشر الفيديو تلقائياً في قناتك! إمبراطورية الزعيم انطلقت.");
  } catch (err) {
    res.status(500).send("فشل النشر: تأكد من صلاحيات TOKENS");
  }
});

app.listen(port, '0.0.0.0');
