const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')({origin: true});
const { defineSecret } = require('firebase-functions/params');

[span_1](start_span)// Firebase Secrets mein save ki gayi key ka reference[span_1](end_span)
const googleKey = defineSecret('GEMINI_API_KEY'); 

[span_2](start_span)// Main Proxy Function[span_2](end_span)
exports.visionAIProxy = functions.runWith({ secrets: [googleKey] }).https.onRequest((req, res) => {
    
    return cors(req, res, async () => {
        try {
            const { prompt, image, isImage } = req.body;
            
            [span_3](start_span)// Gemini AI setup using the secret key[span_3](end_span)
            const genAI = new GoogleGenerativeAI(googleKey.value());
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const sysPrompt = "Aap ek expert AI hain. Is cheez ki poori A to Z detail dein.";

            let contents = [{ parts: [{ text: sysPrompt + "\n" + prompt }] }];
            
            if (isImage && image) {
                contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
            }

            const result = await model.generateContent({ contents });
            const response = await result.response;
            
            res.status(200).json({ text: response.text() });
        } catch (error) {
            console.error("AI Error:", error);
            res.status(500).json({ error: "Server Busy ya Key galat hai" });
        }
    });
});
