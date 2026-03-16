// 1. SECURITY CONFIG
API_KEY = "";
const PROXY_URL = ""; 

// 2. BACK BUTTON PROTECTION
function lockHistory() {
    window.history.pushState(null, null, window.location.href);
}
window.onload = () => {
    lockHistory();
    window.onpopstate = lockHistory;
};

// 3. START APP
function startApp() {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('app-main').style.display = 'flex';
}

// 4. IMAGE PREVIEW
function handleImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('img-view');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('drop-text').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 5. MINI SEND BUTTON VISIBILITY
function toggleSendBtn() {
    const query = document.getElementById('userQuery').value;
    const btn = document.getElementById('miniSendBtn');
    btn.style.display = query.trim() !== "" ? 'flex' : 'none';
}

// 6. IMPROVED AI CALL
async function sendToAI() { await callGeminiAI(true); }
async function sendOnlyText() { await callGeminiAI(false); }

async function callGeminiAI(isImageMode) {
    const output = document.getElementById('engOutput');
    const resultArea = document.getElementById('resultArea');
    const btn = document.getElementById('analyzeBtn');
    const userInput = document.getElementById('userQuery').value;
    const fileInput = document.getElementById('galleryInput');
    
    // Alert in English
    if (isImageMode && !fileInput.files[0]) {
        showCustomAlert("Please select a photo first!");
        return;
    }

    // ⭐ PROFESSIONAL BILINGUAL PROMPT
    const systemInstruction = `You are a Global Expert AI like ChatGPT-4o. Provide a detailed report.
    First, provide the full 'A to Z' technical details in English:
    1. GLOBAL IDENTITY
    2. DEEP PURPOSE
    3. INSTRUCTIONS
    4. SAFETY & TIPS

    Then, provide a very detailed and friendly summary in Roman Urdu for the user under the heading:
    **SUMMARY IN ROMAN URDU**
    
    User Input: ${userInput || "Identify this photo in detail."}`;

    resultArea.style.display = 'block';
    output.innerHTML = '<div class="loading-pulse">Connecting to Global AI Brain...</div>';
    btn.disabled = true;

    try {
        let aiFinalResponse = "";

        if (PROXY_URL) {
            const base64Img = isImageMode ? await toBase64(fileInput.files[0]) : null;
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: systemInstruction,
                    image: base64Img ? base64Img.split(',')[1] : null,
                    isImage: isImageMode
                })
            });
            const data = await response.json();
            aiFinalResponse = data.text;
        } else {
            let parts = [{ text: systemInstruction }];
            if (isImageMode) {
                const base64 = await toBase64(fileInput.files[0]);
                parts.push({ inline_data: { mime_type: "image/jpeg", data: base64.split(',')[1] } });
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] })
            });

            const data = await response.json();
            aiFinalResponse = data.candidates[0].content.parts[0].text;
        }

        // Formatting logic
        output.innerHTML = aiFinalResponse
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        resultArea.scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        output.innerHTML = "<span style='color:red;'>Error: AI Connection failed. Please check your internet or API Key.</span>";
    } finally {
        btn.disabled = false;
    }
}

// 7. PHOTO COMPRESSION
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_WIDTH) { width *= MAX_WIDTH / height; height = MAX_WIDTH; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
    };
    reader.onerror = e => reject(e);
});

// 8. NATURAL VOICE SPEAKER
function listenToResult() {
    const text = document.getElementById('engOutput').innerText;
    if (!text || text.includes("Connecting")) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    const voices = window.speechSynthesis.getVoices();
    const qualityVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("English United States"));
    if (qualityVoice) utterance.voice = qualityVoice;
    window.speechSynthesis.speak(utterance);
}

// 9. SAVE REPORT
function saveFullReport() {
    const text = document.getElementById('engOutput').innerText;
    if (!text || text.includes("Connecting")) {
        showCustomAlert("Please wait for the AI report to generate!");
        return;
    }
    const watermark = "\n\n--- Vision Guide AI Report ---\nDeveloped by Shafiq Ahmad";
    const blob = new Blob([text + watermark], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "VisionGuide_Report.txt";
    link.click();
    showCustomAlert("Report saved to your Downloads!");
}

// 10. MODAL HELPERS
function showCustomAlert(msg) {
    document.getElementById('alert-message').innerText = msg;
    document.getElementById('custom-alert').style.display = 'flex';
}
function closeAlert() {
    document.getElementById('custom-alert').style.display = 'none';
}
