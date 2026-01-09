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
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية طويلة (150 كلمة) بلهجة صنعانية مشوقة جداً." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو الصوت البشري المجاني</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; text-align:right; max-height:300px; overflow-y:auto; margin-bottom:20px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <audio id="audioPlayer" controls style="width:100%; margin-bottom:20px; filter: invert(1);"></audio>
        <br>
        <button id="vBtn" onclick="getVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%;">🎙️ توليد الصوت البشري (مجاني للأبد)</button>
        <script>
          async function getVoice() {
            const btn = document.getElementById('vBtn');
            btn.disabled = true;
            btn.innerText = "جاري التحويل...";
            try {
              const response = await fetch('/get-free-audio?text=' + encodeURIComponent(document.getElementById('storyText').innerText));
              const blob = await response.blob();
              document.getElementById('audioPlayer').src = URL.createObjectURL(blob);
              document.getElementById('audioPlayer').play();
              btn.innerText = "🔊 تشغيل مرة أخرى";
            } catch (e) { alert("خطأ في الاتصال"); }
            btn.disabled = false;
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/get-free-audio', async (req, res) => {
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("ar-EG-ShakirNeural", "output_format"); 
    const readable = tts.toStream(req.query.text);
    readable.pipe(res);
  } catch (e) { res.status(500).send("TTS Error"); }
});

app.listen(port, '0.0.0.0');
