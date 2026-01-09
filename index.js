const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('<h1>البوت نشط!</h1><a href="/make-viral-video">ابدأ توليد الملايين</a>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    // استخدام الطريقة الكلاسيكية المستقرة للنسخة 0.1.0
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "اكتب قصة رعب غامضة وقصيرة جداً بالعامية العربية تجذب الملايين، مع نهاية صادمة.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#111; color:white; min-height:100vh;">
        <h1 style="color:#00f2ea;">👻 قصة الملايين جاهزة</h1>
        <div style="background:#222; padding:20px; border-radius:15px; margin:20px 0; direction:rtl; font-size:20px;">
          ${text.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="padding:10px 20px; background:#00f2ea; border:none; border-radius:5px; cursor:pointer;">توليد قصة أخرى ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Server is running!'));
