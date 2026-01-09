const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('<h1>البوت يعمل بنجاح!</h1><p>استخدم رابط /make-viral-video لتوليد القصص.</p>');
});

app.get('/make-viral-video', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("اكتب قصة رعب قصيرة جداً ومثيرة بالعامية العربية.");
    const script = result.response.text();

    res.send(`<h3>القصة:</h3><p style="direction:rtl;">${script}</p>`);
  } catch (err) {
    res.status(500).send("خطأ: " + err.message);
  }
});

app.listen(port, '0.0.0.0', () => console.log('Listening on port ' + port));
