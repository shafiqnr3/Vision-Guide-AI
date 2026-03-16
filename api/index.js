const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // 1. CORS Headers: Browser errors khatam karne ke liye
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Pre-flight request handle karna
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { prompt, image, isImage } = req.body;
        
        // 3. Vercel Settings se API Key uthana
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 4. System Instruction
        const systemInstruction = "Aap ek Expert AI hain. Is item ki poori technical detail English mein dein aur aakhir mein Roman Urdu mein Summary dein.";
        
        let contents = [{ parts: [{ text: systemInstruction + "\n" + prompt }] }];
        
        if (isImage && image) {
            contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
        }

        const result = await model.generateContent({ contents });
        const response = await result.response;
        
        res.status(200).json({ text: response.text() });
        
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "System Busy ya API Key miss ho gayi hai." });
    }
};
            
