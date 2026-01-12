const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const gTTS = require('gtts');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// إعداد المصادقة
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: process.env.TOKENS });

app.get('/make-viral-video', async (req, res) => {
    const uniqueID = Date.now();
    console.log(`🚀 بدء عملية إنتاج فيديو فريد برقم: ${uniqueID}`);
    const workDir = path.join(__dirname, `temp_${uniqueID}`);
    await fs.ensureDir(workDir);

    try {
        // أ. تنويع البحث لضمان عدم التكرار (صفحة عشوائية من 1-80)
        const searchTerms = ['funny cat', 'cute kitten', 'cat playing', 'cat jumping', 'funny animal', 'cats'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        const randomPage = Math.floor(Math.random() * 80) + 1;

        console.log(`🔍 البحث عن: ${randomTerm} في الصفحة ${randomPage}`);

        const pexelsRes = await axios.get(`https://api.pexels.com/videos/search?query=${randomTerm}&per_page=1&page=${randomPage}&orientation=portrait`, {
            headers: { "Authorization": process.env.PEXELS_API }
        });

        if (!pexelsRes.data.videos || pexelsRes.data.videos.length === 0) throw new Error("لم نجد فيديو، جاري إعادة المحاولة...");
        const videoUrl = pexelsRes.data.videos[0].video_files[0].link;

        // ب. تأليف قصة وعنوان جديد
        console.log("🤖 Groq يؤلف قصة جديدة...");
        const groqRes = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "llama-3.3-70b-versatile",
            messages: [{
                role: "user",
                content: `أنت صانع محتوى يوتيوب. الوقت الآن ${uniqueID}.
                اكتب رد JSON يحتوي على:
                "title": عنوان جذاب ومثير للضحك لفيديو Shorts (مختلف عن السابق).
                "story": قصة قصيرة مضحكة جداً باللهجة العامية تناسب فيديو قطط.`
            }]
        }, { headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` } });

        let content;
        try { content = JSON.parse(groqRes.data.choices[0].message.content); }
        catch (e) { content = { title: `موقف مضحك ${uniqueID} 😂`, story: "شوفوا القطة المجنونة دي!" }; }

        // ج. المعالجة والمونتاج
        const audioPath = path.join(workDir, 'voice.mp3');
        await new Promise((resolve) => new gTTS(content.story, 'ar').save(audioPath, resolve));

        const videoPath = path.join(workDir, 'raw.mp4');
        const vWriter = fs.createWriteStream(videoPath);
        const vResponse = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
        vResponse.data.pipe(vWriter);
        await new Promise((resolve) => vWriter.on('finish', resolve));

        const finalPath = path.join(workDir, 'final.mp4');
        console.log("🎬 دمج ومونتاج...");
        // فلتر لتغيير الإضاءة قليلاً لتضليل خوارزميات التكرار
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${videoPath} -i ${audioPath} -t 8 -vf "eq=brightness=0.0${Math.floor(Math.random()*5)}" -c:v libx264 -c:a aac -map 0:v:0 -map 1:a:0 ${finalPath}`, (err) => {
                if (err) reject(err); else resolve();
            });
        });

        // د. الرفع ليوتيوب
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: { title: content.title, description: content.story, categoryId: '15' },
                status: { privacyStatus: 'public' }
            },
            media: { body: fs.createReadStream(finalPath) }
        });

        res.send(`✅ تم النشر: ${content.title}`);

    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ: " + err.message);
    } finally {
        fs.remove(workDir);
    }
});

app.listen(port, '0.0.0.0', () => console.log(`Bot Active on ${port}`));
