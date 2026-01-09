const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = process.env.PORT || 8080;

// ربط المفتاح من حسابك المدفوع الجديد
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/make-viral-video', async (req, res) => {
  try {
    // استخدام نموذج Pro 1.5 المتاح للمشتركين
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = "اكتب قصة رعب يمنية بلهجة صنعانية مشوقة جداً لـ تيك توك.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">🚀 محتوى الحساب المدفوع</h1>
        <div style="background:#111; padding:20px; border-radius:15px; direction:rtl; font-size:22px;">
          ${text.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="margin-top:20px; padding:15px; background:#ff0050; color:white; border:none; border-radius:10px; cursor:pointer;">قصة أخرى</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ في الربط: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Paid Cloud Server Running!'));
