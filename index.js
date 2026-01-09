const express = require('express');
const axios = require('axios');
const googleTTS = require('google-tts-api');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  try {
    // طلب قصة طويلة (150 كلمة) لتكفي الفيديو دقيقة كاملة
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية طويلة ومفصلة (150 كلمة) بلهجة صنعانية مشوقة جداً لتيك توك." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const script = textResponse.data.choices[0].message.content;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ استديو الصوت البشري المجاني (مستقر 100%)</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:18px; line-height:1.8; text-align:right; max-height:400px; overflow-y:auto; margin-bottom:20px; border:1px solid #333;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <audio id="audioPlayer" controls style="width:100%; margin-bottom:20px; filter: invert(1);"></audio>
        <br>
        <button id="vBtn" onclick="generateVoice()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; width:100%;">🎙️ توليد الصوت البشري (مجاني للأبد)</button>
        <script>
          function generateVoice() {
            const btn = document.getElementById('vBtn');
            const text = document.getElementById('storyText').innerText.substring(0, 200); // نأخذ جزءاً للسرعة
            // توليد رابط الصوت البشري من جوجل مباشرة (مجاني وصافي)
            const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(text) + "&tl=ar&client=tw-ob";
            document.getElementById('audioPlayer').src = url;
            document.getElementById('audioPlayer').play();
            btn.innerText = "🔊 تشغيل الصوت";
          }
        </script>
      </div>
    `);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, '0.0.0.0');
