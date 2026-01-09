const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;

  try {
    // 1. توليد القصة عبر الموديل الشغال Llama 3.3
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية قصيرة جداً ومشوقة بلهجة صنعانية حادة وغامضة." }]
    }, {
      headers: { "Authorization": `Bearer ${GROQ_KEY}` }
    });

    const script = textResponse.data.choices[0].message.content;

    // 2. واجهة احترافية مع صوت بشري صافٍ (ElevenLabs)
    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو الصوت البشري الاحترافي</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:22px; line-height:1.8; border:1px solid #333; margin-bottom:20px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top:20px;">
          <audio id="audioPlayer" controls style="width:100%; border-radius:10px;"></audio>
          <br><br>
          <button id="voiceBtn" onclick="generateVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">🎙️ تحويل لنبرة بشرية حادة</button>
        </div>

        <script>
          async function generateVoice() {
            const btn = document.getElementById('voiceBtn');
            btn.innerText = "جاري معالجة الصوت...";
            btn.disabled = true;

            const text = document.getElementById('storyText').innerText;
            
            // نستخدم هنا موديل Antoni من ElevenLabs (صوت بشري حاد وصافٍ)
            const voiceId = "ErXwRqc4n4S7vI6V2A5T"; // نبرة حادة واحترافية
            const url = "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId;
            
            try {
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'xi-api-key': '${ELEVEN_KEY}'
                },
                body: JSON.stringify({
                  text: text,
                  model_id: "eleven_multilingual_v2",
                  voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.5 }
                })
              });

              const blob = await response.blob();
              const audioUrl = URL.createObjectURL(blob);
              const player = document.getElementById('audioPlayer');
              player.src = audioUrl;
              player.play();
              btn.innerText = "🔊 تشغيل مرة أخرى";
              btn.disabled = false;
            } catch (err) {
              alert("تأكد من وضع API Key الخاص بـ ElevenLabs في Railway");
              btn.innerText = "فشل التحويل";
              btn.disabled = false;
            }
          }
        </script>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ: " + err.message);
  }
});

app.listen(port, '0.0.0.0');
