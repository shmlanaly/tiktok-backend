const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.get('/make-viral-video', async (req, res) => {
  const API_KEY = process.env.GROQ_API_KEY;
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await axios.post(url, {
      model: "llama-3.3-70b-versatile", // النموذج الشغال الذي اخترته
      messages: [
        {
          role: "user",
          content: "اكتب قصة رعب يمنية قصيرة جداً ومشوقة بلهجة صنعانية غامضة لتيك توك."
        }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const script = response.data.choices[0].message.content;
    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🚀 السيرفر يعمل بـ Llama 3.3 الشغال!</h1>
        <div style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:22px; line-height:1.6;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="margin-top:20px; padding:15px; background:#ff0050; border:none; border-radius:10px; color:white; cursor:pointer;">قصة أخرى ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ: " + (err.response ? JSON.stringify(err.response.data.error) : err.message));
  }
});

app.get('/', (req, res) => res.send('السيرفر جاهز! اذهب إلى /make-viral-video'));

app.listen(port, '0.0.0.0', () => console.log('Stable Groq Server is Live!'));
