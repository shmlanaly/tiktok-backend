const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    // 1. توليد قصة رعب يمنية طويلة (Llama 3.3)
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة وطويلة (150 كلمة)." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو التتابع الصوتي الذكي</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; text-align:right; max-height:350px; overflow-y:auto; margin-bottom:20px; border:1px solid #333;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-bottom:20px;">
          <button id="vBtn" onclick="playInSequence()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%; color:#000; font-size:18px;">🎙️ تشغيل القصة كاملة (تتابع ذكي)</button>
        </div>
        <p id="status" style="color:#888; font-size:14px;"></p>

        <script>
          async function playInSequence() {
            const btn = document.getElementById('vBtn');
            const status = document.getElementById('status');
            const fullText = document.getElementById('storyText').innerText;
            
            // تقسيم النص بناءً على النقطة أو الفاصلة لضمان جمل مفيدة
            const chunks = fullText.split(/[.،!؟\n]+/).filter(t => t.trim().length > 0);
            
            btn.disabled = true;
            let currentPart = 1;

            for (let part of chunks) {
              status.innerText = "جاري قراءة الجزء " + currentPart + " من " + chunks.length;
              
              await new Promise((resolve) => {
                // طلب جوجل المجاني لكل جزء بحد أقصى 180 حرف
                const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + 
                            encodeURIComponent(part.substring(0, 180)) + 
                            "&tl=ar&client=tw-ob";
                
                const audio = new Audio(url);
                audio.onended = resolve; // لا ينتقل للجزء التالي إلا بعد انتهاء الحالي
                audio.onerror = resolve; // لتجنب توقف البوت في حال فشل جزء
                audio.play();
              });
              currentPart++;
            }
            
            btn.disabled = false;
            status.innerText = "✅ اكتملت القصة كاملة بصوت بشري";
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, '0.0.0.0');
