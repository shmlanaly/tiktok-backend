const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة وطويلة (150 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; font-family: sans-serif; }
          /* فيديو الخلفية (GTA/Parkour) */
          #bgVideo { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; z-index: -1; opacity: 0.6; }
          .overlay { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 20px; }
          .story-box { background: rgba(0,0,0,0.7); padding: 20px; border-radius: 15px; direction: rtl; line-height: 1.6; font-size: 18px; border: 1px solid #00f2ea; max-width: 90%; max-height: 50%; overflow-y: auto; }
          #vBtn { margin-top: 20px; padding: 15px 30px; background: #ff0050; color: white; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 20px; box-shadow: 0 0 15px #ff0050; }
        </style>
      </head>
      <body>
        <video autoplay muted loop id="bgVideo">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-man-doing-parkour-jumps-34444-large.mp4" type="video/mp4">
        </video>

        <div class="overlay">
          <h2 style="color: #00f2ea;">🎙️ فيديو تيك توك جاهز</h2>
          <div id="storyText" class="story-box">${script.replace(/\n/g, '<br>')}</div>
          <button id="vBtn" onclick="startProduction()">🎬 تشغيل الصوت والفيديو</button>
          <p id="status" style="margin-top: 10px; font-size: 14px; color: #aaa;"></p>
        </div>

        <script>
          function startProduction() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            const text = document.getElementById('storyText').innerText;

            // 1. تفعيل محرك الصوت الداخلي (Web Speech)
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(text);
            
            // ضبط النبرة لتكون بشرية وحادة
            utterance.lang = 'ar-SA'; 
            utterance.pitch = 0.8; // نبرة عميقة للرعب
            utterance.rate = 0.9;  // سرعة هادئة ومشوقة

            utterance.onstart = () => {
              btn.innerText = "🔊 جاري السرد الآن...";
              btn.style.background = "#00f2ea";
              status.innerText = "هاتفك يقوم بنطق القصة الآن بصوت صافٍ";
            };

            utterance.onend = () => {
              btn.innerText = "🎬 إعادة التشغيل";
              btn.style.background = "#ff0050";
              status.innerText = "✅ اكتمل الفيديو";
            };

            // تشغيل الصوت (تجاوز حظر كروم)
            synth.cancel(); // إلغاء أي عمليات سابقة
            synth.speak(utterance);
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, '0.0.0.0');
