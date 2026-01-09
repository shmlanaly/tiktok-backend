const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const API_KEY = process.env.GROQ_API_KEY;
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await axios.post(url, {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية قصيرة جداً ومشوقة بلهجة صنعانية." }]
    }, {
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" }
    });

    const script = response.data.choices[0].message.content;
    
    // إرسال الصفحة مع مشغل صوتي (Text-to-Speech)
    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎙️ قصة مرعبة من Llama 3.3</h1>
        <div id="storyText" style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:22px; line-height:1.6;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top:20px;">
          <button onclick="speak()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-right:10px;">🔊 استماع للقصة</button>
          <button onclick="location.reload()" style="padding:15px 30px; background:#ff0050; border:none; border-radius:10px; color:white; font-weight:bold; cursor:pointer;">✨ قصة جديدة</button>
        </div>

        <script>
          function speak() {
            const text = document.getElementById('storyText').innerText;
            const msg = new SpeechSynthesisUtterance();
            msg.text = text;
            msg.lang = 'ar-SA'; // لغة عربية
            msg.pitch = 0.5;    // صوت عميق ومرعب
            msg.rate = 0.9;     // سرعة هادئة للتشويق
            window.speechSynthesis.speak(msg);
          }
        </script>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Voice Server Running!'));
