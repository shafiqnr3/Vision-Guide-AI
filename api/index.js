const { GoogleGenerativeAI } = require("@google/generative-ai"); // 'const' small letters mein

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { prompt, image, isImage } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Model setup
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        let contents = [{
            role: "user",
            parts: []
        }];

        // Photo check
        if (isImage && image) {
            contents[0].parts.push({ 
                inlineData: { mimeType: "image/jpeg", data: image } 
            });
        }
        
        // Prompt setup
        contents[0].parts.push({ 
            text: "Aap ek Expert AI hain. Is item ki poori technical detail English mein dein aur aakhir mein Roman Urdu mein Summary dein. Query: " + (prompt || "Identify this.") 
        });

        const result = await model.generateContent({ contents });
        const response = await result.response;
        res.status(200).json({ text: response.text() });
        
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: error.message });
    }
};
