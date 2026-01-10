const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 8080;

// إعداد يوتيوب بمفاتيح الزعيم (صورة 1000024162)
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY; 
  try {
    // طلب قصة مقسمة لقطع متتالية لسهولة المزامنة
    const textResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "اكتب قصة رعب يمنية قصيرة جداً وقسمها إلى 4 قطع متتالية، كل قطعة في سطر منفصل." }]
    }, { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });

    const fullScript = textResponse.data.choices[0].message.content;

    res.send(`
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; background: #000; color: white; font-family: sans-serif; text-align: center; overflow: hidden; }
          .leader-brand { color: #ff0050; font-size: 26px; padding: 15px; text-shadow: 0 0 10px #ff0050; }
          #bgVideo { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; z-index: -1; opacity: 0.4; }
          .story-part { background: rgba(0,0,0,0.8); padding: 15px; margin: 10px; border-radius: 12px; border-right: 5px solid #ff0050; direction: rtl; font-size: 16px; animation: slideIn 0.5s; }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .btn { padding: 18px; background: #ff0050; color: white; border: none; border-radius: 50px; width: 85%; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #ff0050; margin-top: 10px; }
        </style>
      </head>
      <body>
        <video autoplay muted loop id="bgVideo">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-man-running-on-top-of-a-wall-34446-large.mp4" type="video/mp4">
        </video>
        <h1 class="leader-brand">👑 إمبراطورية الزعيم</h1>
        <div id="scriptContent">
          ${fullScript.split('\n').map(part => `<div class="story-part">${part}</div>`).join('')}
        </div>
        <form id="uploadForm">
          <input type="file" id="audioInput" accept="audio/*" style="display: none;">
          <button type="button" class="btn" onclick="document.getElementById('audioInput').click()">📤 ارفع صوت الزعيم للدمج</button>
          <button type="button" id="pubBtn" class="btn" style="background: #ff0000; display: none;" onclick="startEmpireProcess()">🚀 دمج ونشر فوري</button>
        </form>
        <p id="st"></p>

        <script>
          const audioInput = document.getElementById('audioInput');
          audioInput.onchange = () => { if(audioInput.files[0]) document.getElementById('pubBtn').style.display = 'block'; };

          async function startEmpireProcess() {
            document.getElementById('st').innerText = "🎬 بدأت الإمبراطورية العمل في الخلفية.. سيصلك إشعار بالنجاح!";
            const formData = new FormData();
            formData.append('audio', audioInput.files[0]);
            formData.append('script', \`${fullScript}\`);
            
            fetch('/process-and-upload', { method: 'POST', body: formData });
            alert("✅ يا زعيم، تم استلام الطلب! المونتاج والرفع يجري الآن في الخلفية لتجنب التعطل.");
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) { res.status(500).send("خطأ: " + err.message); }
});

app.post('/process-and-upload', upload.single('audio'), async (req, res) => {
  // الرد فوراً لتجنب خطأ 502
  res.status(200).send("Started");

  try {
    const audioPath = req.file.path;
    const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-man-running-on-top-of-a-wall-34446-large.mp4";
    const videoPath = './video.mp4';
    const outputPath = './final_video.mp4';

    // 1. تحميل الفيديو إذا لم يكن موجوداً
    const videoStream = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(videoPath);
    videoStream.data.pipe(writer);

    writer.on('finish', () => {
      // 2. دمج الصوت (Mixing): صوت الزعيم + صوت الفيديو الأصلي
      ffmpeg(videoPath)
        .input(audioPath)
        .complexFilter([
          '[0:a]volume=0.2[bg]; [1:a]volume=1.5[fg]; [bg][fg]amix=inputs=2:duration=first[a]'
        ])
        .map('0:v')
        .map('[a]')
        .output(outputPath)
        .on('end', async () => {
          // 3. الرفع ليوتيوب بعد اكتمال الدمج
          const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
          await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
              snippet: { title: 'إمبراطورية الزعيم - قصة رعب يمنية', description: 'مزامنة صوتية كاملة', categoryId: '22' },
              status: { privacyStatus: 'public' }
            },
            media: { body: fs.createReadStream(outputPath) }
          });
          console.log("✅ الغزو اكتمل! الفيديو في القناة.");
        })
        .run();
    });
  } catch (err) { console.error("Process Error:", err.message); }
});

app.listen(port, '0.0.0.0');
