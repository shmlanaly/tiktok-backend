const { google } = require('googleapis');
const express = require('express');
const app = express();

// الآن نطلب من السيرفر جلب المفاتيح من خزنة المتغيرات
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ خطأ: لم يتم العثور على المفاتيح في المتغيرات!');
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.upload']
    });
    res.redirect(url);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Success! Tokens received.');
    res.send('<h1>تم الربط بنجاح!</h1><p>انسخ هذا الكود وضعه في تيرمكس:</p><textarea style="width:100%;height:100px">' + JSON.stringify(tokens) + '</textarea>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server Ready on port ' + PORT));
