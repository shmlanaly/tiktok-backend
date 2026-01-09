const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

// Railway يتطلب استخدام المنفذ من متغيرات البيئة
const port = process.env.PORT || 8080;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.status(200).send('<h1>البوت متصل بالسحابة بنجاح!</h1><a href="/make-viral-video">اضغط هنا لتوليد فيديو</a>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "اكتب قصة رعب غامضة وقصيرة جداً بالعامية العربية تجذب المتابعين، مع نهاية صادمة.";
    
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    const video = "https://assets.mixkit.co/videos/preview/mixkit-playing-with-colorful-slime-40436-large.mp4";

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#1a1a1a; color:white; min-height:100vh;">
        <h1 style="color:#00f2ea;">👻 قصة الملايين جاهزة</h1>
        <div style="background:#333; padding:20px; border-radius:15px; border-left: 5px solid #ff0050; margin:20px 0; text-align:right; direction:rtl;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <video width="280" controls autoplay loop style="border-radius:15px;">
          <source src="${video}" type="video/mp4">
        </video>
      </div>
    `);
  } catch (error) {
    res.status(500).send("خطأ: " + error.message);
  }
});

// تشغيل السيرفر على 0.0.0.0 وهو أمر ضروري لـ Railway
app.listen(port, '0.0.0.0', () => {
  console.log('Server is running on port ' + port);
});
