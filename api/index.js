const { GoogleGenerativeAI } = require("@google/generative-ai");

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
        
        // Is line ko dhyan se check karein
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let contents = [];
        if (isImage && image) {
            contents.push({
                role: "user",
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: image } },
                    { text: "Identify this item in detail. Query: " + (prompt || "What is this?") }
                ]
            });
        } else {
            contents.push({
                role: "user",
                parts: [{ text: prompt || "Hello!" }]
            });
        }

        const result = await model.generateContent({ contents });
        const response = await result.response;
        res.status(200).json({ text: response.text() });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
