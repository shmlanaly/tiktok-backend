const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/make-viral-video', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // 1. توليد قصة رعب أو ضحك فيروسية
    const prompt = "اكتب قصة رعب غامضة وقصيرة جداً بالعامية العربية تجذب المتابعين للملايين، مع نهاية مفاجئة جداً وصادمة.";
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    // 2. توفير روابط فيديوهات خلفية ممتعة جاهزة (Minecraft / Satisfying)
    const backgroundVideos = [
      "https://assets.mixkit.co/videos/preview/mixkit-playing-with-colorful-slime-40436-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-cutting-sand-with-a-knife-40441-large.mp4"
    ];
    const selectedVideo = backgroundVideos[Math.floor(Math.random() * backgroundVideos.length)];

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#1a1a1a; color:white; min-height:100vh;">
        <h1 style="color:#00f2ea;">🎬 محرك الفيديوهات المليونية</h1>
        <div style="background:#333; padding:20px; border-radius:15px; border-left: 5px solid #ff0050; margin:20px 0; text-align:right; direction:rtl;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <p>🔄 البوت اختار فيديو خلفية ممتع (Satisfying) لزيادة وقت المشاهدة.</p>
        <video width="300" controls style="border-radius:10px;">
          <source src="${selectedVideo}" type="video/mp4">
        </video>
        <br><br>
        <button onclick="location.reload()" style="padding:10px 20px; background:#00f2ea; border:none; border-radius:5px; font-weight:bold;">توليد قصة أخرى ✨</button>
      </div>
    `);
  } catch (error) {
    res.status(500).send("خطأ: " + error.message);
  }
});

app.listen(port, () => console.log('Viral Factory Online'));
