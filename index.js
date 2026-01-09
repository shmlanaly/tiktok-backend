const express = require('express');
const axios = require('axios');
const { MsEdgeTTS } = require('edge-tts');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية طويلة (150 كلمة) بلهجة صنعانية مشوقة." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; background: #000; color: white; font-family: sans-serif; overflow: hidden; }
          #bgVideo { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; z-index: -1; opacity: 0.5; }
          .container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; }
          .story-box { background: rgba(0,0,0,0.8); padding: 20px; border-radius: 15px; direction: rtl; font-size: 18px; border: 1px solid #00f2ea; max-height: 40%; overflow-y: auto; margin-bottom: 20px; }
          button { padding: 15px 30px; background: #00f2ea; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 18px; box-shadow: 0 0 15px #00f2ea; }
        </style>
      </head>
      <body>
        <video autoplay muted loop id="bgVideo">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-man-running-on-top-of-a-wall-34446-large.mp4" type="video/mp4">
        </video>
        <div class="container">
          <div id="storyText" class="story-box">${script.replace(/\n/g, '<br>')}</div>
          <button id="vBtn" onclick="playVoice()">🎙️ توليد صوت جيميناي (مجاني)</button>
          <p id="status" style="margin-top: 10px; color: #00f2ea;"></p>
        </div>
        <script>
          async function playVoice() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            btn.disabled = true;
            status.innerText = "جاري تحويل النص لصوت بشري...";
            try {
              const text = document.getElementById('storyText').innerText;
              const response = await fetch('/get-audio?text=' + encodeURIComponent(text));
              const blob = await response.blob();
              const audio = new Audio(URL.createObjectURL(blob));
              audio.play();
              status.innerText = "✅ مستمر في السرد اللانهائي...";
            } catch (e) { status.innerText = "❌ خطأ في السيرفر"; }
            btn.disabled = false;
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/get-audio', async (req, res) => {
  const tts = new MsEdgeTTS();
  // صوت "حامد" السعودي (Ar-SA-Hamid) هو الأقرب لنبرة جيميناي الرجالية الحادة
  await tts.setMetadata("ar-SA-HamidNeural", "audio-24khz-48kbitrate-mono-mp3");
  try {
    const readable = tts.toStream(req.query.text);
    readable.pipe(res);
  } catch (e) { res.status(500).send("TTS Error"); }
});

app.listen(port, '0.0.0.0');
