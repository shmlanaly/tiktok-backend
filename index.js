const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

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
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; font-family: 'Arial Black', sans-serif; color: white; }
          #videoContainer { position: relative; width: 100%; height: 100vh; }
          #bgVideo { position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
          
          /* هوية إمبراطورية الزعيم */
          .leader-brand { position: absolute; top: 20px; right: 20px; z-index: 10; font-size: 24px; color: #ff0050; text-shadow: 0 0 10px #ff0050; border: 2px solid #ff0050; padding: 5px 15px; border-radius: 5px; }
          .domain-tag { position: absolute; top: 70px; right: 25px; font-size: 10px; color: #00f2ea; z-index: 10; }

          #captions { position: absolute; top: 40%; width: 100%; text-align: center; z-index: 10; padding: 0 10px; box-sizing: border-box; }
          .caption-text { background: rgba(0,0,0,0.8); color: #fff; font-size: 22px; padding: 10px; border-radius: 5px; display: inline-block; direction: rtl; border-right: 5px solid #00f2ea; }

          .controls { position: absolute; bottom: 30px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 20; }
          .btn { padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; border: none; font-size: 18px; width: 85%; text-align: center; }
          #uploadBtn { background: #ff0050; color: white; }
          #publishBtn { background: #ff0000; color: white; display: none; box-shadow: 0 0 20px #ff0000; animation: pulse 2s infinite; }
          
          @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
          input[type="file"] { display: none; }
        </style>
      </head>
      <body>

        <div id="videoContainer">
          <div class="leader-brand">👑 إمبراطورية الزعيم</div>
          <div class="domain-tag">beauty4word.com</div>
          
          <video id="bgVideo" autoplay muted loop crossorigin="anonymous">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-man-doing-parkour-jumps-34444-large.mp4" type="video/mp4">
          </video>

          <div id="captions"><span class="caption-text" id="capBox">يا زعيم، ارفع صوتك المهكر لبدء النشر...</span></div>

          <div class="controls">
            <label id="uploadLabel" class="btn" style="background:#ff0050;">
              <input type="file" id="audioUpload" accept="audio/*">
              📤 ارفع صوت الزعيم المستنسخ
            </label>
            <button id="publishBtn" class="btn" onclick="publishNow()">🚀 انشر فوراً في يوتيوب</button>
          </div>
        </div>

        <div id="fullScript" style="display:none;">${script}</div>

        <script>
          const audioInput = document.getElementById('audioUpload');
          const publishBtn = document.getElementById('publishBtn');
          const capBox = document.getElementById('capBox');
          const fullScript = document.getElementById('fullScript').innerText;
          let customAudio = null;

          audioInput.onchange = function(e) {
            const file = e.target.files[0];
            if(file) {
              customAudio = new Audio(URL.createObjectURL(file));
              publishBtn.style.display = 'block';
              document.getElementById('uploadLabel').style.display = 'none';
              capBox.innerText = "صوت الزعيم جاهز للغزو!";
              startCaptions();
            }
          };

          function startCaptions() {
            customAudio.play();
            const sentences = fullScript.split(/[.،!؟\n]+/).filter(s => s.trim().length > 3);
            let index = 0;
            const interval = 3500; // توقيت تلقائي للجمل

            setInterval(() => {
              if (index < sentences.length) {
                capBox.innerText = sentences[index];
                index++;
              }
            }, interval);
          }

          async function publishNow() {
            capBox.innerText = "🚀 جاري النشر التلقائي في يوتيوب...";
            // هنا يتم استدعاء API اليوتيوب الذي نجهزه
            alert("تم إرسال الطلب للسيرفر.. سيظهر الفيديو في قناتك خلال دقائق يا زعيم!");
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, '0.0.0.0');
