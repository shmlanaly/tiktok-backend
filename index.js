const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

// إعداد الذكاء الاصطناعي
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('<h1>المصنع يعمل!</h1><a href="/make-viral-video">اضغط لتوليد قصة</a>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    // استخدمنا الإصدار الأحدث والأكثر استقراراً
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "اكتب قصة رعب غامضة وقصيرة جداً بالعامية العربية تجذب الملايين، مع نهاية صادمة جداً.";
    
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#1a1a1a; color:white; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎬 قصة الملايين جاهزة</h1>
        <div style="background:#333; padding:20px; border-radius:15px; border-left: 5px solid #ff0050; margin:20px 0; text-align:right; direction:rtl; font-size:18px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="padding:10px 20px; background:#00f2ea; border:none; border-radius:5px; font-weight:bold;">توليد قصة أخرى ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ في التوليد: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Server running on port ' + port));
