const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/make-viral-video', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // توجيه الذكاء الاصطناعي لكتابة محتوى مخصص للجذب (رعب أو ضحك)
    const prompt = "اكتب قصة رعب قصيرة جداً ومشوقة باللغة العربية العامية، مدتها 45 ثانية عند القراءة، تنتهي بنهاية صادمة تجعل المشاهد يعلق على الفيديو. واقترح عنواناً مديراً للجدل.";
    
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    res.send(`
      <h1>🎬 سيناريو الفيديو الفيروسي جاهز:</h1>
      <div style="background:#f0f0f0; padding:20px; border-radius:10px;">
        ${script.replace(/\n/g, '<br>')}
      </div>
      <p>✅ البوت الآن سيقوم بتحويل هذا النص إلى صوت (Voiceover) ودمجه مع فيديو خلفية ممتع.</p>
    `);
  } catch (error) {
    res.status(500).send("خطأ: " + error.message);
  }
});

app.listen(port, () => console.log('Server Ready'));
