// Vision Guide AI - Frontend Logic (Vercel Optimized)

// 1. SECURITY CONFIG (Ab API Key yahan nahi, Vercel Dashboard mein hogi)
const API_KEY = ""; 
const PROXY_URL = "/api/index"; // Vercel Backend ka rasta

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

// 6. IMPROVED AI CALL (Direct to Vercel API)
async function sendToAI() { await callGeminiAI(true); }
async function sendOnlyText() { await callGeminiAI(false); }

async function callGeminiAI(isImageMode) {
    const output = document.getElementById('engOutput');
    const resultArea = document.getElementById('resultArea');
    const btn = document.getElementById('analyzeBtn');
    const userInput = document.getElementById('userQuery').value;
    const fileInput = document.getElementById('galleryInput');
    
    if (isImageMode && !fileInput.files[0]) {
        showCustomAlert("Please select a photo first!");
        return;
    }

    resultArea.style.display = 'block';
    output.innerHTML = '<div class="loading-pulse">Connecting to Global AI Brain...</div>';
    btn.disabled = true;

    try {
        let imageData = null;
        if (isImageMode) {
            const base64 = await toBase64(fileInput.files[0]);
            imageData = base64.split(',')[1];
        }

        // Vercel Backend ko call karna
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: userInput || "Identify this item in detail.",
                image: imageData,
                isImage: isImageMode
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        // Formatting logic
        output.innerHTML = data.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        resultArea.scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        output.innerHTML = "<span style='color:red;'>Error: AI Connection failed. Please check Vercel Logs or API Key.</span>";
        console.error(e);
    } finally {
        btn.disabled = false;
    }
}

// 7. PHOTO COMPRESSION (Base64 conversion)
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
    window.speechSynthesis.speak(utterance);
}

// 9. SAVE REPORT
function saveFullReport() {
    const text = document.getElementById('engOutput').innerText;
    if (!text || text.includes("Connecting")) return;
    const blob = new Blob([text + "\n\nVision Guide AI - eveloped by Shafiq Ahmad"], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "VisionGuide_Report.txt";
    link.click();
}

// 10. MODAL HELPERS
function showCustomAlert(msg) {
    document.getElementById('alert-message').innerText = msg;
    document.getElementById('custom-alert').style.display = 'flex';
}
function closeAlert() {
    document.getElementById('custom-alert').style.display = 'none';
}
