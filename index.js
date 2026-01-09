const express = require('express');
const axios = require('axios');
const gTTS = require('gtts');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة (120 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو التتابع الذكي المستقر</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; text-align:right; max-height:350px; overflow-y:auto; margin-bottom:20px; border:1px solid #333;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <button id="vBtn" onclick="playInSequence()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%; color:#000; font-size:18px;">🎙️ تشغيل القصة (تتابع بشري)</button>
        <p id="status" style="color:#888; margin-top:15px;"></p>

        <script>
          async function playInSequence() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            const fullText = document.getElementById('storyText').innerText;
            
            // تقسيم النص إلى جمل قصيرة لضمان جودة الصوت
            const chunks = fullText.split(/[.،!؟\n]+/).filter(t => t.trim().length > 3);
            
            btn.disabled = true;
            status.innerText = "جاري البدء...";

            for (let i = 0; i < chunks.length; i++) {
              status.innerText = "جاري قراءة الجزء " + (i+1) + " من " + chunks.length;
              await new Promise((resolve) => {
                const audio = new Audio('/proxy-audio?text=' + encodeURIComponent(chunks[i]));
                audio.onended = resolve;
                audio.onerror = resolve;
                audio.play().catch(e => {
                  console.log("Browser blocked auto-play, retrying...");
                  resolve(); 
                });
              });
            }
            
            btn.disabled = false;
            status.innerText = "✅ اكتملت القصة";
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

// مسار الوكيل (Proxy) لجلب الصوت من السيرفر لتجنب حظر المتصفح
app.get('/proxy-audio', (req, res) => {
  const text = req.query.text;
  const gtts = new gTTS(text, 'ar');
  gtts.stream().pipe(res);
});

app.listen(port, '0.0.0.0');
