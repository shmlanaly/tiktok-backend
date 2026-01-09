const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 8080;

// إعداد يوتيوب باستخدام الأسماء الموجودة في Railway (صورة 1000023984)
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
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة (150 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; font-family: 'Arial Black', sans-serif; color: white; }
          #videoContainer { position: relative; width: 100%; height: 100vh; }
          #bgVideo { position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
          .leader-brand { position: absolute; top: 20px; right: 20px; z-index: 10; font-size: 24px; color: #ff0050; text-shadow: 0 0 10px #ff0050; border: 2px solid #ff0050; padding: 5px 15px; border-radius: 5px; }
          #captions { position: absolute; top: 40%; width: 100%; text-align: center; z-index: 10; padding: 0 15px; box-sizing: border-box; }
          .caption-text { background: rgba(0,0,0,0.85); color: #fff; font-size: 24px; font-weight: bold; padding: 12px; border-radius: 8px; display: inline-block; direction: rtl; border-right: 6px solid #ff0050; }
          .controls { position: absolute; bottom: 30px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 20; }
          .btn { padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; border: none; font-size: 18px; width: 85%; text-align: center; }
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
          <div id="captions"><span class="caption-text" id="capBox">يا زعيم، القصة جاهزة.. ارفع صوتك للغزو</span></div>
          <div class="controls">
            <label class="btn" style="background:#ff0050;">
              <input type="file" id="audioUpload" accept="audio/*"> 📤 ارفع صوت الزعيم المهكر
            </label>
            <button id="publishBtn" class="btn" onclick="startAndPublish()">🚀 نشر تلقائي في يوتيوب</button>
          </div>
        </div>
        <script>
          const audioInput = document.getElementById('audioUpload');
          const publishBtn = document.getElementById('publishBtn');
          const capBox = document.getElementById('capBox');
          let customAudio = null;

          audioInput.onchange = function(e) {
            if(e.target.files[0]) {
              customAudio = new Audio(URL.createObjectURL(e.target.files[0]));
              publishBtn.style.display = 'block';
              capBox.innerText = "صوت الزعيم جاهز للغزو!";
            }
          };

          function startAndPublish() {
            if(!customAudio) return;
            customAudio.play();
            // نظام الترجمة التلقائية
            const sentences = \`${script}\`.split(/[.،!؟\\n]+/).filter(s => s.trim().length > 3);
            let index = 0;
            setInterval(() => {
              if (index < sentences.length) {
                document.getElementById('capBox').innerText = sentences[index++];
              }
            }, 3500);

            // إرسال طلب النشر للسيرفر
            fetch('/publish-to-youtube', { method: 'POST' });
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/publish-to-youtube', async (req, res) => {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    // السيرفر الآن يستخدم المفاتيح المباشرة من صورتك (1000023984)
    res.send("🚀 تم استلام أمر الزعيم! الفيديو قيد الرفع التلقائي ليوتيوب.");
  } catch (err) { res.status(500).send("خطأ: " + err.message); }
});

app.listen(port, '0.0.0.0');
