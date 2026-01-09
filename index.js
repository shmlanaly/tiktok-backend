const express = require('express');
const axios = require('axios');
const ElevenLabs = require('elevenlabs-node');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;

  try {
    // توليد القصة الطويلة عبر Llama 3.3
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية طويلة (150 كلمة) بلهجة صنعانية مشوقة جداً." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; font-family: sans-serif; }
          #bgVideo { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; z-index: -1; opacity: 0.5; }
          .overlay { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 20px; }
          .story-box { background: rgba(0,0,0,0.8); padding: 20px; border-radius: 15px; direction: rtl; line-height: 1.8; font-size: 18px; border: 1px solid #00f2ea; max-width: 90%; max-height: 50%; overflow-y: auto; }
          #vBtn { margin-top: 20px; padding: 15px 30px; background: #00f2ea; color: #000; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 18px; box-shadow: 0 0 20px #00f2ea; }
        </style>
      </head>
      <body>
        <video autoplay muted loop id="bgVideo">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-man-running-on-top-of-a-wall-34446-large.mp4" type="video/mp4">
        </video>
        <div class="overlay">
          <h2 style="color: #00f2ea;">🎙️ استديو الصوت البشري (صوت آدم)</h2>
          <div id="storyText" class="story-box">${script.replace(/\n/g, '<br>')}</div>
          <button id="vBtn" onclick="generateProVoice()">🎙️ تشغيل الصوت البشري الحاد</button>
          <p id="status" style="margin-top: 10px; font-size: 14px; color: #00f2ea;"></p>
        </div>
        <script>
          async function generateProVoice() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            btn.disabled = true;
            status.innerText = "جاري طلب الصوت البشري من السيرفر...";
            
            try {
              const text = document.getElementById('storyText').innerText;
              const response = await fetch('/get-pro-audio?text=' + encodeURIComponent(text));
              if (!response.ok) throw new Error("رصيد ElevenLabs انتهى");
              
              const blob = await response.blob();
              const audio = new Audio(URL.createObjectURL(blob));
              audio.play();
              btn.innerText = "🔊 جاري السرد...";
              status.innerText = "✅ الصوت يعمل الآن بنبرة آدم الحادة";
            } catch (e) {
              status.innerText = "❌ خطأ: " + e.message;
              btn.disabled = false;
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/get-pro-audio', async (req, res) => {
  const voice = new ElevenLabs({ apiKey: process.env.ELEVENLABS_API_KEY, voiceId: "pNInz6obpg8nEByWQX2t" }); // صوت آدم الحاد
  try {
    const audioStream = await voice.textToStream({ textInput: req.query.text, model_id: "eleven_multilingual_v2", stability: 0.5, similarity_boost: 0.8 });
    audioStream.pipe(res);
  } catch (e) { res.status(500).send("ElevenLabs Error"); }
});

app.listen(port, '0.0.0.0');
