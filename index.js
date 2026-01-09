const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة جداً (150 كلمة) لتيك توك." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; font-family: sans-serif; color: white; }
          #bgVideo { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; z-index: -1; opacity: 0.5; }
          .overlay { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; }
          .story-box { background: rgba(0,0,0,0.85); padding: 20px; border-radius: 15px; direction: rtl; line-height: 1.8; border: 1px solid #00f2ea; max-height: 40%; overflow-y: auto; margin-bottom: 20px; font-size: 18px; }
          .upload-btn { padding: 15px 30px; background: #ff0050; border-radius: 50px; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #ff0050; display: inline-block; margin-bottom: 10px; }
          #playBtn { padding: 15px 30px; background: #00f2ea; color: black; border-radius: 50px; font-weight: bold; border: none; cursor: pointer; display: none; font-size: 18px; }
          input[type="file"] { display: none; }
        </style>
      </head>
      <body>
        <video autoplay muted loop id="bgVideo">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-man-running-on-top-of-a-wall-34446-large.mp4" type="video/mp4">
        </video>
        <div class="overlay">
          <h2 style="color: #00f2ea;">🚀 استديو ابو عدي تك الاحترافي</h2>
          <div id="storyText" class="story-box">${script.replace(/\n/g, '<br>')}</div>
          
          <label class="upload-btn">
            <input type="file" id="audioUpload" accept="audio/*">
            📤 ارفع صوتك المهكر (MP3/WAV)
          </label>
          <button id="playBtn" onclick="startShow()">🎬 عرض الفيديو بالصوت المخصص</button>
          <p id="status" style="margin-top: 10px; color: #00f2ea; font-size: 14px;"></p>
        </div>

        <script>
          const audioInput = document.getElementById('audioUpload');
          const playBtn = document.getElementById('playBtn');
          const status = document.getElementById('status');
          let customAudio = null;

          audioInput.onchange = function(e) {
            const file = e.target.files[0];
            if(file) {
              customAudio = new Audio(URL.createObjectURL(file));
              playBtn.style.display = 'inline-block';
              status.innerText = "✅ تم استلام صوتك الاحترافي!";
            }
          };

          function startShow() {
            if(customAudio) {
              customAudio.play();
              status.innerText = "🔊 السرد جارٍ الآن بصوتك المهكر...";
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, '0.0.0.0');
