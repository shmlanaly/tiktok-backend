const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

// هذا التعديل ضروري جداً لفتح الرابط
const port = process.env.PORT || 8080;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.status(200).send('<h1>البوت متصل بالسحابة!</h1><a href="/make-viral-video">اضغط لتوليد الفيديو</a>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "اكتب قصة رعب غامضة وقصيرة جداً بالعامية العربية، تنتهي بنهاية صادمة تجذب المتابعين.";
    
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-playing-with-colorful-slime-40436-large.mp4";

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#111; color:white; min-height:100vh;">
        <h2 style="color:#00f2ea;">👻 قصة الملايين جاهزة</h2>
        <div style="background:#222; padding:20px; border-radius:15px; margin:20px 0; direction:rtl;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <video width="300" controls autoplay loop style="border-radius:10px;">
          <source src="${videoUrl}" type="video/mp4">
        </video>
      </div>
    `);
  } catch (error) {
    res.status(500).send("خطأ: " + error.message);
  }
});

// السر هنا: الاستماع لجميع عناوين IP (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port ' + port);
});
