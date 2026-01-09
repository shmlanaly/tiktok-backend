const express = require('express');
const axios = require('axios');
const { MsEdgeTTS } = require('edge-tts');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;

  try {
    // 1. توليد القصة الطويلة (Llama 3.3)
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ 
        role: "user", 
        content: "اكتب قصة رعب يمنية طويلة (200 كلمة) بلهجة صنعانية مشوقة جداً لأحداث حقيقية مهجورة." 
      }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو الأصوات البشرية المجاني</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; border:1px solid #333; text-align:right; max-height:400px; overflow-y:auto; margin-bottom:20px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <audio id="audioPlayer" controls style="width:100%; margin-bottom:20px; filter: invert(1);"></audio>
        <br>
        <button id="vBtn" onclick="getFreeVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%;">🎙️ توليد الصوت البشري (مجاني للأبد)</button>
        <p id="status" style="margin-top:10px; color:#888;"></p>

        <script>
          async function getFreeVoice() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            btn.disabled = true;
            status.innerText = "جاري تحويل القصة لصوت بشري صافٍ...";

            try {
              const text = document.getElementById('storyText').innerText;
              const response = await fetch('/get-free-audio?text=' + encodeURIComponent(text));
              const blob = await response.blob();
              document.getElementById('audioPlayer').src = URL.createObjectURL(blob);
              document.getElementById('audioPlayer').play();
              status.innerText = "✅ تم توليد الصوت بنجاح!";
            } catch (e) {
              status.innerText = "❌ حدث خطأ في الاتصال";
            }
            btn.disabled = false;
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

// مسار الصوت المجاني (Microsoft Edge Engine)
app.get('/get-free-audio', async (req, res) => {
  const tts = new MsEdgeTTS();
  // اختيار صوت "Hamid" أو "Shakir" لنبرة عربية قوية وحادة
  await tts.setMetadata("ar-EG-ShakirNeural", "output_format"); 
  
  try {
    const readable = tts.toStream(req.query.text);
    readable.pipe(res);
  } catch (e) {
    res.status(500).send("TTS Error");
  }
});

app.listen(port, '0.0.0.0');
