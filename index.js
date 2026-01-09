const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;

  try {
    // 1. طلب قصة رعب يمنية طويلة ومفصلة (150-200 كلمة) لتكفي الفيديو
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ 
        role: "user", 
        content: "اكتب قصة رعب يمنية طويلة ومفصلة بلهجة صنعانية مشوقة جداً. اجعلها تحتوي على تفاصيل مرعبة عن أماكن مهجورة في اليمن، وتكفي لقراءتها في دقيقة كاملة (حوالي 150 كلمة)." 
      }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎬 مصنع فيديوهات تيك توك (Pro)</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; border:1px solid #333; text-align:right; max-height:300px; overflow-y:auto; margin-bottom:20px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <audio id="audioPlayer" controls style="width:100%; margin-bottom:20px; filter: invert(1);"></audio>
        <br>
        <button id="vBtn" onclick="getVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%;">🎙️ تحويل القصة كاملة لصوت بشري حاد</button>
        <p id="status" style="margin-top:10px; color:#888;"></p>

        <script>
          async function getVoice() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            btn.disabled = true;
            status.innerText = "جاري معالجة القصة الطويلة... قد يستغرق الأمر 10 ثوانٍ";

            try {
              const response = await fetch('/get-audio?text=' + encodeURIComponent(document.getElementById('storyText').innerText));
              if (!response.ok) throw new Error("فشل توليد الصوت");
              
              const blob = await response.blob();
              document.getElementById('audioPlayer').src = URL.createObjectURL(blob);
              document.getElementById('audioPlayer').play();
              status.innerText = "✅ الصوت جاهز للفيديو!";
            } catch (e) {
              status.innerText = "❌ خطأ: تأكد من رصيد ElevenLabs";
              btn.disabled = false;
            }
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/get-audio', async (req, res) => {
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpg8nEByWQX2t`,
      data: { text: req.query.text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.8 } },
      headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json' },
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (err) { res.status(500).send("Error ElevenLabs"); }
});

app.listen(port, '0.0.0.0');
