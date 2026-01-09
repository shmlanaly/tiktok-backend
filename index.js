const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 8080;

// إعدادات يوتيوب (الجسر الإمبراطوري)
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

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
          #uploadBtn { background: #ff0050; color: white; }
          #publishBtn { background: #ff0000; color: white; display: none; box-shadow: 0 0 20px #ff0000; }
          input[type="file"] { display: none; }
        </style>
      </head>
      <body>
        <div id="videoContainer">
          <div class="leader-brand">👑 إمبراطورية الزعيم</div>
          <video id="bgVideo" autoplay muted loop crossorigin="anonymous">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-man-doing-parkour-jumps-34444-large.mp4" type="video/mp4">
          </video>
          <div id="captions"><span class="caption-text" id="capBox">يا زعيم، ارفع صوتك المهكر لبدء النشر...</span></div>
          <div class="controls">
            <label class="btn" id="uploadLabel" style="background:#ff0050;">
              <input type="file" id="audioUpload" accept="audio/*"> 📤 ارفع صوت الزعيم
            </label>
            <button id="publishBtn" class="btn" onclick="publishNow()">🚀 انشر فوراً في يوتيوب</button>
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
              capBox.innerText = "صوت الزعيم جاهز للغزو!";
            }
          };
          async function publishNow() {
            capBox.innerText = "🚀 جاري النشر التلقائي في يوتيوب...";
            const response = await fetch('/publish-to-youtube', { method: 'POST' });
            const result = await response.text();
            alert(result);
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/publish-to-youtube', async (req, res) => {
  try {
    // هنا سيتم وضع كود النشر الفعلي بعد تفعيل المفاتيح
    res.send("✅ تم استلام طلب النشر يا زعيم! جاري المعالجة...");
  } catch (err) { res.status(500).send("فشل: " + err.message); }
});

app.listen(port, '0.0.0.0');
