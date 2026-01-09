const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;

  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية في 20 كلمة." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🔍 فحص نظام الصوت</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:22px; margin-bottom:20px;">
          ${script}
        </div>
        <audio id="audioPlayer" controls style="width:100%; margin-bottom:20px;"></audio>
        <div id="errorLog" style="color:#ff0050; background:#200; padding:10px; border-radius:5px; display:none; margin-bottom:10px;"></div>
        <button id="vBtn" onclick="getVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">🎙️ تشغيل الفحص</button>

        <script>
          async function getVoice() {
            const btn = document.getElementById('vBtn');
            const log = document.getElementById('errorLog');
            btn.innerText = "جاري الفحص...";
            log.style.display = "none";

            try {
              const response = await fetch('/get-audio?text=' + encodeURIComponent(document.getElementById('storyText').innerText));
              if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
              }
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              document.getElementById('audioPlayer').src = url;
              document.getElementById('audioPlayer').play();
              btn.innerText = "🔊 نجح الصوت!";
            } catch (e) {
              log.innerText = "خطأ من ElevenLabs: " + e.message;
              log.style.display = "block";
              btn.innerText = "فشل الفحص";
            }
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/get-audio', async (req, res) => {
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
  const voiceId = "pNInz6obpg8nEByWQX2t"; // صوت Adam

  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      data: { text: req.query.text, model_id: "eleven_multilingual_v2" },
      headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json' },
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (err) {
    // إرسال تفاصيل الخطأ للمتصفح
    const errMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    res.status(500).send(errMsg);
  }
});

app.listen(port, '0.0.0.0');
