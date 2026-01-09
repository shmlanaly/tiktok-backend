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
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة وطويلة (120 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🚀 استديو الرعب (نسخة Chrome الاحترافية)</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; text-align:right; max-height:350px; overflow-y:auto; margin-bottom:20px; border:1px solid #333;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <button id="vBtn" onclick="playChromeAudio()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%; color:#000; font-size:18px;">🎙️ تشغيل القصة (تتابع ذكي)</button>
        <p id="status" style="color:#888; margin-top:15px;"></p>

        <script>
          async function playChromeAudio() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            const fullText = document.getElementById('storyText').innerText;
            
            // تقسيم النص بجمل واضحة
            const chunks = fullText.split(/[.،!؟\n]+/).filter(t => t.trim().length > 2);
            
            btn.disabled = true;
            status.innerText = "جاري الاتصال بالسيرفر...";

            for (let i = 0; i < chunks.length; i++) {
              status.innerText = "🔊 جاري قراءة الجزء " + (i+1) + " من " + chunks.length;
              await new Promise((resolve) => {
                const audio = new Audio('/proxy-audio?text=' + encodeURIComponent(chunks[i]));
                // إعدادات خاصة للكروم لضمان التشغيل
                audio.preload = 'auto';
                audio.onended = resolve;
                audio.onerror = (e) => {
                   console.error("خطأ في الجزء:", chunks[i]);
                   resolve();
                };
                audio.play().catch(err => {
                   status.innerText = "⚠️ اضغط مرة أخرى لتفعيل الصوت في المتصفح";
                   resolve();
                });
              });
            }
            
            btn.disabled = false;
            status.innerText = "✅ انتهت القصة كاملة";
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

// مسار الوكيل المطور مع ترويسات Chrome
app.get('/proxy-audio', (req, res) => {
  const text = req.query.text;
  try {
    const gtts = new gTTS(text, 'ar');
    // إخبار الكروم رسمياً أن هذا ملف صوتي
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked'
    });
    gtts.stream().pipe(res);
  } catch (e) {
    res.status(500).end();
  }
});

app.listen(port, '0.0.0.0');
