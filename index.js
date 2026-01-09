const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const app = express();
const port = process.env.PORT || 8080;

// إعداد المحرك السحابي (Vertex AI)
// ملاحظة: تأكد من وضع PROJECT_ID الصحيح من حسابك المدفوع في متغيرات Railway
const project = process.env.GOOGLE_PROJECT_ID || 'your-project-id';
const location = 'us-central1';
const vertex_ai = new VertexAI({project: project, location: location});

// اختيار أقوى نموذج متاح للمشتركين
const model = 'gemini-1.5-pro';

const generativeModel = vertex_ai.getGenerativeModel({
  model: model,
});

app.get('/make-viral-video', async (req, res) => {
  try {
    const prompt = "اكتب قصة رعب يمنية قصيرة جداً ومشوقة بلهجة صنعانية أو عدنية تجذب الملايين، مع نهاية صادمة جداً.";
    
    const request = {
      contents: [{role: 'user', parts: [{text: prompt}]}],
    };

    const result = await generativeModel.generateContent(request);
    const response = await result.response;
    const script = response.candidates[0].content.parts[0].text;

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:20px; background:#000; color:#fff; min-height:100vh;">
        <h1 style="color:#00f2ea;">✨ محتوى Google Gemini المدفوع جاهز</h1>
        <div style="background:#1a1a1a; padding:20px; border-radius:15px; border-right: 5px solid #00f2ea; text-align:right; direction:rtl; font-size:22px; line-height:1.8;">
          ${script.replace(/\n/g, '<br>')}
        </div>
        <button onclick="location.reload()" style="margin-top:20px; padding:15px; background:#ff0050; border:none; border-radius:10px; color:white; font-weight:bold; cursor:pointer;">توليد قصة احترافية أخرى ✨</button>
      </div>
    `);
  } catch (err) {
    res.status(500).send("خطأ في الربط السحابي: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Google Cloud Server Running!'));
