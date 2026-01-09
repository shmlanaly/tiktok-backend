const express = require('express');
const axios = require('axios');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('ms-edge-tts');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    // توليد القصة الطويلة بنجاح (Llama 3.3) كما ظهر في صورك السابقة
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية طويلة (200 كلمة) بلهجة صنعانية مشوقة جداً." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو الصوت البشري المجاني (مستقر)</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; text-align:right; max-height:400px; overflow-y:auto; margin-bottom:20px; border:1px solid #333;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <audio id="audioPlayer" controls style="width:100%; margin-bottom:20px; filter: invert(1);"></audio>
        <br>
        <button id="vBtn" onclick="generateVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%;">🎙️ توليد الصوت البشري (مجاني للأبد)</button>
        <p id="status" style="margin-top:10px; color:#888;"></p>

        <script>
          async function generateVoice() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            btn.disabled = true;
            status.innerText = "جاري التحويل لأجمل صوت بشري... انتظر ثوانٍ";
            try {
              const text = document.getElementById('storyText').innerText;
              const response = await fetch('/get-audio?text=' + encodeURIComponent(text));
              const blob = await response.blob();
              document.getElementById('audioPlayer').src = URL.createObjectURL(blob);
              document.getElementById('audioPlayer').play();
              status.innerText = "✅ اكتمل التحويل بنجاح!";
            } catch (e) {
              status.innerText = "❌ فشل الاتصال بالسيرفر";
            }
            btn.disabled = false;
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

// مسار الصوت المجاني (Microsoft Edge Engine)
app.get('/get-audio', async (req, res) => {
  try {
    const tts = new MsEdgeTTS();
    // استخدام صوت ShakrNeural لنبرة بشرية حادة واحترافية
    await tts.setMetadata("ar-EG-ShakirNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const audioStream = await tts.toStream(req.query.text);
    audioStream.pipe(res);
  } catch (e) { res.status(500).send("TTS Error"); }
});

app.listen(port, '0.0.0.0');
