const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

// الحل هنا: تعريف المحرك لاستخدام v1beta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('<h1>المصنع نشط!</h1><a href="/make-viral-video">ابدأ توليد الملايين</a>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    // استخدمنا نموذج gemini-pro لأنه الأكثر استقراراً في v1 حالياً لتجنب الـ 404
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
    
    const prompt = "اكتب قصة رعب غامضة وقصيرة جداً بالعامية العربية تجذب الملايين، مع نهاية صادمة.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text();

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#111; color:white; min-height:100vh;">
        <h1 style="color:#00f2ea;">👻 القصة الفيروسية</h1>
        <div style="background:#222; padding:20px; border-radius:15px; border-left: 5px solid #ff0050; margin:20px 0; text-align:right; direction:rtl; font-size:22px;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="padding:15px 30px; background:#00f2ea; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">توليد قصة أخرى ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ في التوليد: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Server is alive!'));
