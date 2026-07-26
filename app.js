// KSP Crime Intelligence Hub - Main Frontend Application JS (Bilingual English & Kannada Out-Loud Voice Speech Engine)

let currentLanguage = "en"; // "en" or "kn"
let currentRole = "Investigator";
let sessionId = "session_" + Math.random().toString(36).substr(2, 9);
let isRecording = false;
let voiceOverlayActive = false;
let recognition = null;
let synth = window.speechSynthesis;
let audioContextUnlocked = false;

// Global chart & map instances
let networkGraph = null;
let gisMap = null;
let socioChart = null;
let forecastingChart = null;
let currentNodesData = [];

document.addEventListener("DOMContentLoaded", function() {
    initSpeechRecognition();
    initNetworkGraph();
    initGISMap();
    initCharts();
    loadOffenderProfiling();
    loadFinancialAnalysis();
    loadAuditLogs();
    loadCaseDossier("FIR-2026-0041");

    // Pre-fetch voices
    if (synth && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => synth.getVoices();
    }

    // Unlock browser audio context on any user click
    document.body.addEventListener("click", unlockAudioContext, { once: true });
});

function unlockAudioContext() {
    if (audioContextUnlocked) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            const ctx = new AudioCtx();
            ctx.resume();
        }
        if (synth && synth.speaking) synth.cancel();
        audioContextUnlocked = true;
    } catch(e) {
        console.warn("Audio Context unlock:", e);
    }
}

// Global Tab & Role Navigation Functions
function showTab(tabId, el) {
    document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    
    const targetPanel = document.getElementById(tabId);
    if (targetPanel) targetPanel.classList.add("active");
    if (el) el.classList.add("active");

    if (tabId === "network-view" && networkGraph) {
        setTimeout(() => networkGraph.redraw(), 100);
    } else if (tabId === "gis-view" && gisMap) {
        setTimeout(() => gisMap.invalidateSize(), 100);
    }
}

function navigateToTab(tabId) {
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    showTab(tabId, navItem);
}

function switchRole(role) {
    currentRole = role;
    loadAuditLogs();
}

// Language Toggle (English <-> Kannada)
function toggleLanguage() {
    currentLanguage = (currentLanguage === "en") ? "kn" : "en";
    const btn = document.getElementById("lang-btn");
    const langText = document.getElementById("current-lang-text");
    
    if (currentLanguage === "kn") {
        btn.classList.add("kn-active");
        langText.innerText = "ಕನ್ನಡ (Kannada)";
    } else {
        btn.classList.remove("kn-active");
        langText.innerText = "English";
    }
}

// Speech Recognition & Real-Time Audio Input Pipeline
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Live interim text typing

        recognition.onstart = () => {
            isRecording = true;
            updateMicUI(true);
            const overlayStatus = document.getElementById("overlay-voice-status");
            if (overlayStatus) overlayStatus.innerHTML = `🎙️ <strong style='color:#60a5fa;'>LISTENING IN ${currentLanguage === 'kn' ? 'KANNADA' : 'ENGLISH'}... SPEAK NOW!</strong>`;
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const currentText = finalTranscript || interimTranscript;
            const inputField = document.getElementById("chat-input");
            if (inputField && currentText) inputField.value = currentText;

            const overlayTranscript = document.getElementById("overlay-voice-transcript");
            if (overlayTranscript && currentText) {
                overlayTranscript.innerHTML = `<strong>You are saying:</strong> "${currentText}"`;
            }

            if (finalTranscript) {
                isRecording = false;
                updateMicUI(false);
                sendMessage(true); // Auto submit voice query & respond back out loud!
            }
        };

        recognition.onerror = (err) => {
            console.warn("Speech recognition error:", err);
            isRecording = false;
            updateMicUI(false);
        };

        recognition.onend = () => {
            isRecording = false;
            updateMicUI(false);
        };
    }
}

async function openVoiceCallModal() {
    unlockAudioContext();
    voiceOverlayActive = true;
    const overlay = document.getElementById("voice-overlay");
    if (overlay) overlay.classList.add("active");

    const overlayTranscript = document.getElementById("overlay-voice-transcript");
    if (overlayTranscript) overlayTranscript.innerText = "Listening for voice query... Speak into mic once active!";

    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        }
    } catch(e) {}

    const greeting = (currentLanguage === "kn") ?
        "Namaskara Officer! Nanu KSP Voice AI Sahayaka. Kripaya nimma prashneyannu heli." :
        "Hello Officer! I am your KSP Voice AI Assistant. I am listening. Please speak your query.";

    speakText(greeting, currentLanguage, true);
}

function closeVoiceCallModal() {
    voiceOverlayActive = false;
    const overlay = document.getElementById("voice-overlay");
    if (overlay) overlay.classList.remove("active");
    if (synth) synth.cancel();
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
}

function startListeningVoice() {
    unlockAudioContext();
    if (recognition) {
        recognition.lang = (currentLanguage === "kn") ? "kn-IN" : "en-US";
        try {
            recognition.start();
            isRecording = true;
            updateMicUI(true);
        } catch(e) {
            console.error("Speech start error:", e);
        }
    } else {
        testAIVoiceOutput();
    }
}

function toggleVoiceInput() {
    unlockAudioContext();
    if (!recognition) {
        openVoiceCallModal();
        return;
    }

    if (isRecording) {
        try { recognition.stop(); } catch(e) {}
        isRecording = false;
        updateMicUI(false);
    } else {
        recognition.lang = (currentLanguage === "kn") ? "kn-IN" : "en-US";
        try {
            recognition.start();
            isRecording = true;
            updateMicUI(true);
        } catch(e) {
            console.error("Speech start error:", e);
        }
    }
}

function updateMicUI(active) {
    const micBtn = document.getElementById("mic-btn");
    const sphere = document.querySelector(".voice-sphere");

    if (micBtn) {
        if (active) micBtn.classList.add("recording");
        else micBtn.classList.remove("recording");
    }

    if (sphere) {
        if (active) {
            sphere.style.transform = "scale(1.18)";
            sphere.style.boxShadow = "0 0 90px rgba(220, 38, 38, 0.9)";
        } else {
            sphere.style.transform = "scale(1)";
            sphere.style.boxShadow = "0 0 40px rgba(220, 38, 38, 0.5)";
        }
    }
}

// Chat Messaging Pipeline
function handleKeyPress(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
}

function triggerVoiceQuery(queryText) {
    unlockAudioContext();
    const input = document.getElementById("chat-input");
    if (input) input.value = queryText;
    
    const overlayTranscript = document.getElementById("overlay-voice-transcript");
    if (overlayTranscript) overlayTranscript.innerHTML = `<strong>You selected:</strong> "${queryText}"`;

    sendMessage(true);
}

function simulateVoiceInput(queryText) {
    unlockAudioContext();
    document.getElementById("chat-input").value = queryText;
    sendMessage(true);
}

function sendQuickQuery(queryText) {
    document.getElementById("chat-input").value = queryText;
    sendMessage();
}

async function sendMessage(spokenFromMic = false) {
    unlockAudioContext();
    const input = document.getElementById("chat-input");
    const query = input.value.trim();
    if (!query) return;

    appendMessage(query, "user");
    input.value = "";

    try {
        const res = await fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                query: query,
                language: currentLanguage,
                role: currentRole
            })
        });

        const data = await res.json();
        appendBotResponse(data);

        if (voiceOverlayActive) {
            const overlayTranscript = document.getElementById("overlay-voice-transcript");
            if (overlayTranscript) {
                overlayTranscript.innerHTML = `<strong>AI Response Out Loud:</strong> "${data.spoken_text || data.response}"`;
            }
        }

        // SPEAK BACK OUT LOUD IN NATURAL VOICE (ENGLISH & KANNADA)
        speakText(data.spoken_text || data.response, data.language, true);

    } catch (err) {
        console.error("Query Error:", err);
        appendMessage("Error communicating with AI engine. Please retry.", "bot");
    }
}

// Robust Bilingual English & Kannada Text-to-Speech Engine
function speakText(textToSpeak, lang, autoListenNext = true) {
    unlockAudioContext();
    if (!synth) return;

    synth.cancel(); // Stop previous speech
    const cleanText = textToSpeak.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = synth.getVoices() || [];
    let selectedVoice = null;

    if (lang === "kn") {
        selectedVoice = voices.find(v => v.lang.includes("kn") || v.lang.includes("kn-IN")) ||
                        voices.find(v => v.lang.includes("hi") || v.lang.includes("hi-IN")) ||
                        voices.find(v => v.lang.includes("en-IN"));
        utterance.lang = selectedVoice ? selectedVoice.lang : "hi-IN";
    } else {
        selectedVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-IN"));
        utterance.lang = selectedVoice ? selectedVoice.lang : "en-US";
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    const overlayStatus = document.getElementById("overlay-voice-status");
    if (overlayStatus) overlayStatus.innerHTML = `🤖 <strong style='color:#34d399;'>AI SPEAKING (${lang === 'kn' ? 'KANNADA' : 'ENGLISH'}) OUT LOUD...</strong>`;

    utterance.onstart = () => {
        if (overlayStatus) overlayStatus.innerHTML = `🤖 <strong style='color:#34d399;'>AI SPEAKING (${lang === 'kn' ? 'KANNADA' : 'ENGLISH'}) OUT LOUD...</strong>`;
    };

    utterance.onend = () => {
        if (overlayStatus) overlayStatus.innerHTML = `🎙️ <strong style='color:#60a5fa;'>Listening in ${lang === 'kn' ? 'Kannada' : 'English'}... Speak now!</strong>`;
        
        if (autoListenNext && voiceOverlayActive && recognition) {
            setTimeout(() => {
                try {
                    recognition.lang = (currentLanguage === "kn") ? "kn-IN" : "en-US";
                    recognition.start();
                    isRecording = true;
                    updateMicUI(true);
                } catch(e) {}
            }, 400);
        }
    };

    utterance.onerror = (err) => {
        console.warn("Speech synthesis error:", err);
        if (overlayStatus) overlayStatus.innerHTML = "🎙️ Listening to Officer's Voice... Speak now!";
    };

    synth.speak(utterance);
}

function testAIVoiceOutput() {
    unlockAudioContext();
    const testText = (currentLanguage === "kn") ?
        "Namaskara Officer! Nanu Karnataka Rajya Police AI Sahayaka. Kannada Dhvani sanyojane yashasviyagi kelisutide!" :
        "Hello Officer! I am your KSP Conversational AI assistant. My voice chat speech synthesis is fully active and responding out loud!";
    
    speakText(testText, currentLanguage, false);
}

function appendMessage(text, sender) {
    const chatContainer = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = `message-bubble ${sender}`;
    div.innerHTML = `<strong>${sender === 'user' ? 'Officer' : 'KSP Conversational AI'}:</strong> ${text}`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendBotResponse(data) {
    const chatContainer = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = "message-bubble bot";

    let html = `<strong>KSP Conversational AI:</strong> ${data.response}`;

    if (data.cards && data.cards.length > 0) {
        html += `<div class="card-grid">`;
        data.cards.forEach(c => {
            html += `
                <div class="data-card">
                    <div class="data-card-title">${c.title}</div>
                    <div class="data-card-subtitle">${c.subtitle}</div>
                    <div>${c.details}</div>
                    ${c.status ? `<div style="margin-top:6px;"><span class="badge badge-warning">${c.status}</span></div>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }

    if (data.evidence_trail && data.evidence_trail.length > 0) {
        html += `
            <div class="xai-box">
                <strong><i class="fa-solid fa-microchip"></i> XAI Evidence Trail & References:</strong>
                <ul>
                    ${data.evidence_trail.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (data.recommendations && data.recommendations.length > 0) {
        html += `
            <div style="margin-top:10px; font-size:0.82rem; color:var(--accent-amber);">
                <strong><i class="fa-solid fa-compass"></i> Recommended Investigative Actions:</strong>
                <ul style="margin-left:16px;">
                    ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    div.innerHTML = html;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function clearChat() {
    await fetch("/api/clear_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
    });

    const chatContainer = document.getElementById("chat-messages");
    chatContainer.innerHTML = `
        <div class="message-bubble bot">
            <strong>KSP Conversational AI:</strong> Session history reset. Ready for new query.
        </div>
    `;
}

function exportChatPDF() {
    const element = document.getElementById("chat-messages");
    const opt = {
        margin:       0.5,
        filename:     `KSP_Crime_Investigation_Report_${sessionId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// Load Rich Case Intelligence Dossier dynamically
function loadCaseDossier(caseId) {
    const summaryCard = document.getElementById("dossier-summary-card");
    const timelineContainer = document.getElementById("dossier-timeline");
    const leadsContainer = document.getElementById("dossier-leads");
    const forensicsContainer = document.getElementById("dossier-forensics");

    if (!summaryCard || !timelineContainer || !leadsContainer || !forensicsContainer) return;

    const dossiers = {
        "FIR-2026-0041": {
            fir_no: "FIR-2026-0041",
            crime_type: "Armed Robbery & Gang Extortion",
            station: "Indiranagar PS (Bengaluru East)",
            date: "2026-06-12 21:30",
            loss: "₹4,50,000",
            status: "Under Active Investigation",
            ipc: "IPC 392, IPC 397 (Armed Robbery)",
            accused: "Ramesh 'Blade' Kumar (Eastside Syndicate)",
            timeline: [
                { time: "2026-06-12 21:30", title: "Armed Robbery Incident Reported", desc: "Two armed assailants intercepted victim on 100ft Road Indiranagar. Seized gold jewelry & cash.", icon: "fa-gun" },
                { time: "2026-06-13 08:00", title: "CCTV AI Node #88 LPR Match", desc: "Automated License Plate Recognition matched getaway motorcycle KA-03-HJ-9942.", icon: "fa-camera" },
                { time: "2026-06-14 14:20", title: "AI Gait & Biometric Identification", desc: "Accused Ramesh 'Blade' identified via AI gait analysis algorithm (98.2% confidence).", icon: "fa-person-walking" },
                { time: "2026-06-16 10:00", title: "Hawala Money Trail Detected", desc: "₹32 Lakhs transferred from Shell ACC-9948 to Eastside Syndicate Crypto Wallet.", icon: "fa-money-bill-transfer" }
            ],
            leads: [
                { priority: "CRITICAL", title: "Interrogate Ramesh 'Blade' Kumar", desc: "Execute raid at Koramangala hideout location based on CDR tower dump #14 telemetry.", action: "Execute Raid Order" },
                { priority: "HIGH", title: "Freeze Shell Bank Account ACC-99482104", desc: "Issue immediate freeze notice under PMLA Section 17 to prevent further Hawala cashout.", action: "Issue Freeze Order" },
                { priority: "MEDIUM", title: "Coordinate Cyber Crime Cell Whitefield", desc: "Audit crypto wallet ACC-7738 off-ramp transactions for gang funding evidence.", action: "Send Inter-Agency Dispatch" }
            ],
            forensics: [
                { title: "Fingerprint AI Match", val: "AFIS Match #994 (99.4% Confidence)" },
                { title: "LPR Camera Node", val: "Cam #88 - 100ft Rd (KA-03-HJ-9942)" },
                { title: "CDR Tower Dump", val: "Cell ID 4092 - 14 Calls Linked" }
            ]
        },
        "FIR-2026-0089": {
            fir_no: "FIR-2026-0089",
            crime_type: "Corporate Cyber Ransomware & Extortion",
            station: "Whitefield Cyber PS (Bengaluru East)",
            date: "2026-06-14 14:15",
            loss: "₹32,00,000",
            status: "Charge Sheet Drafted",
            ipc: "IT Act 66D, IPC 420, IPC 384",
            accused: "Kiran 'Cyber' (DarkByte Syndicate)",
            timeline: [
                { time: "2026-06-14 14:15", title: "Ransomware Attack Detected", desc: "Servers of TechCorp Solutions encrypted with DarkByte v4 payload.", icon: "fa-laptop-code" },
                { time: "2026-06-15 09:30", title: "Tor IP Trace & IP Packet Audit", desc: "Command & Control server IP traced to overseas VPN proxy node.", icon: "fa-network-wired" },
                { time: "2026-06-17 11:45", title: "Crypto Wallet Cashout Tracked", desc: "Ransom payment of 3.8 BTC moved to domestic peer-to-peer crypto exchange.", icon: "fa-bitcoin" }
            ],
            leads: [
                { priority: "CRITICAL", title: "Arrest Kiran 'Cyber' at Whitefield PG", desc: "Location pin matched via Wi-Fi BSSID triangulation telemetry.", action: "Issue Arrest Warrant" },
                { priority: "HIGH", title: "Issue Interpol Cyber Notice", desc: "Flag DarkByte Syndicate C2 server IP address with CERT-In and Interpol.", action: "File Cyber Alert" }
            ],
            forensics: [
                { title: "Ransomware Hash", val: "SHA-256: e3b0c44298fc1c14" },
                { title: "VPN Proxy IP", val: "185.220.101.5 (Tor Exit Node)" },
                { title: "Crypto Wallet", val: "bc1qxy2kgdygjrsqtzq2n0yrf249" }
            ]
        },
        "FIR-2026-0130": {
            fir_no: "FIR-2026-0130",
            crime_type: "MDMA Narcotics Smuggling Ring",
            station: "Rajajinagar PS (Bengaluru West)",
            date: "2026-06-22 19:00",
            loss: "₹15,00,000",
            status: "Under Active Investigation",
            ipc: "NDPS Act 21(C), NDPS Act 22",
            accused: "Francis 'Narc' & Eastside Syndicate",
            timeline: [
                { time: "2026-06-22 19:00", title: "Narcotics Seizure at Rajajinagar", desc: "4.5 kg MDMA crystals seized near Rajajinagar Metro station.", icon: "fa-pills" },
                { time: "2026-06-23 10:15", title: "Chemical Lab Purity Test", desc: "Lab analysis confirmed 96% pure methamphetamine commercial quantity.", icon: "fa-vial" }
            ],
            leads: [
                { priority: "CRITICAL", title: "Raid Interstate Supply Warehouse", desc: "Intercept drug consignment moving from Goa-Bengaluru highway route.", action: "Deploy Narcotics Squad" }
            ],
            forensics: [
                { title: "Contraband Weight", val: "4.50 kg High-Purity MDMA" },
                { title: "Seized Vehicle", val: "KA-01-MJ-4410 (Modified)" },
                { title: "Supply Chain", val: "Interstate Goa-Bengaluru Corridor" }
            ]
        },
        "FIR-2026-0180": {
            fir_no: "FIR-2026-0180",
            crime_type: "Crypto Investment Ponzi Scam",
            station: "Marathahalli PS (Bengaluru East)",
            date: "2026-07-01 15:45",
            loss: "₹65,00,000",
            status: "Under Active Investigation",
            ipc: "IPC 420, KPID Act Section 9",
            accused: "Deepak 'Wealth' & DarkByte Syndicate",
            timeline: [
                { time: "2026-07-01 15:45", title: "Public Complaint Filed by 142 Victims", desc: "Fake trading portal 'CryptoWealth365' abruptly shut down after collecting deposits.", icon: "fa-chart-line" }
            ],
            leads: [
                { priority: "CRITICAL", title: "Attach Property under KPID Act", desc: "Seize luxury real estate assets purchased using investor fraud funds.", action: "Attach Assets Order" }
            ],
            forensics: [
                { title: "Victim Count", val: "142 Retail Investors Defrauded" },
                { title: "Domain Server", val: "CryptoWealth365.io (Hosted Overseas)" },
                { title: "PMLA Attachment", val: "Rs 65 Lakhs Seizure Pending" }
            ]
        }
    };

    const d = dossiers[caseId] || dossiers["FIR-2026-0041"];

    summaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <span class="badge badge-danger">${d.status}</span>
                <h3 style="font-size:1.3rem; color:var(--primary-blue); margin:6px 0 2px 0;">${d.fir_no} - ${d.crime_type}</h3>
                <div style="font-size:0.86rem; color:var(--text-secondary);"><i class="fa-solid fa-building-shield"></i> ${d.station} | Reported: ${d.date}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:700;">ESTIMATED FINANCIAL LOSS</div>
                <div style="font-size:1.4rem; font-weight:800; color:var(--accent-red);">${d.loss}</div>
            </div>
        </div>

        <div class="dossier-grid-header">
            <div class="dossier-metric-item">
                <div class="dossier-metric-label">IPC / IT Act Sections</div>
                <div class="dossier-metric-val">${d.ipc}</div>
            </div>
            <div class="dossier-metric-item">
                <div class="dossier-metric-label">Primary Named Accused</div>
                <div class="dossier-metric-val">${d.accused}</div>
            </div>
            <div class="dossier-metric-item">
                <div class="dossier-metric-label">Investigative Priority</div>
                <div class="dossier-metric-val" style="color:var(--accent-red);">CRITICAL (Level 1)</div>
            </div>
            <div class="dossier-metric-item">
                <div class="dossier-metric-label">AI Solvability Score</div>
                <div class="dossier-metric-val" style="color:var(--accent-emerald);">94.2% High Confidence</div>
            </div>
        </div>
    `;

    timelineContainer.innerHTML = d.timeline.map(t => `
        <div class="timeline-item">
            <div class="timeline-time"><i class="fa-solid ${t.icon || 'fa-clock'}"></i> ${t.time}</div>
            <div class="timeline-title">${t.title}</div>
            <div class="timeline-desc">${t.desc}</div>
        </div>
    `).join('');

    leadsContainer.innerHTML = d.leads.map(l => `
        <div class="lead-card">
            <div>
                <div style="margin-bottom:4px;">
                    <span class="badge ${l.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${l.priority} PRIORITY</span>
                </div>
                <div class="lead-title">${l.title}</div>
                <div class="lead-desc">${l.desc}</div>
            </div>
            <button class="btn-secondary" style="background:var(--primary-blue); color:#fff; border:none; white-space:nowrap;" onclick="alert('Lead Action Dispatched to Field Team: ${l.title}')">
                ${l.action}
            </button>
        </div>
    `).join('');

    forensicsContainer.innerHTML = d.forensics.map(f => `
        <div class="forensic-card">
            <div class="forensic-title">${f.title}</div>
            <div class="forensic-val">${f.val}</div>
        </div>
    `).join('');
}

// Trigger ML Model Training Pipeline
async function triggerMLTraining() {
    const banner = document.getElementById("ml-training-banner");
    if (banner) {
        banner.innerHTML = `<div style="color:var(--primary-blue); font-weight:700;"><i class="fa-solid fa-gear fa-spin"></i> Retraining Gradient Boosting Recidivism & Spatial DBSCAN Models across 12 Wards... Please wait...</div>`;
    }

    try {
        const res = await fetch("/api/train_model", { method: "POST" });
        const data = await res.json();

        if (banner) {
            banner.innerHTML = `
                <div style="font-weight:800; font-size:0.95rem; color:var(--accent-emerald); margin-bottom:6px;">
                    <i class="fa-solid fa-circle-check"></i> ${data.message}
                </div>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; font-size:0.85rem; margin-top:8px;">
                    <div><strong>ROC-AUC Score:</strong> <span style="color:var(--accent-emerald);">${data.metrics.recidivism_roc_auc}</span></div>
                    <div><strong>Precision Score:</strong> <span style="color:var(--accent-emerald);">${(data.metrics.recidivism_precision * 100).toFixed(1)}%</span></div>
                    <div><strong>Socio-Demographic R²:</strong> <span style="color:var(--accent-emerald);">${data.metrics.socio_r2_score}</span></div>
                    <div><strong>Last Trained:</strong> ${data.metrics.last_trained_timestamp}</div>
                </div>
            `;
        }
    } catch (err) {
        console.error("ML Retraining Error:", err);
    }
}

// Vis.js Network Graph
async function initNetworkGraph() {
    loadNetworkGraph("all");
}

async function loadNetworkGraph(filterGroup) {
    const container = document.getElementById("network-container");
    if (!container) return;

    try {
        const res = await fetch(`/api/network?group=${filterGroup}`);
        const data = await res.json();
        currentNodesData = data.nodes;

        const visNodes = data.nodes.map(n => ({
            id: n.id,
            label: n.label,
            shape: n.group === 'gang' ? 'triangle' : n.group === 'bank' ? 'diamond' : 'dot',
            size: n.val || 22,
            color: n.group === 'accused' ? '#dc2626' : n.group === 'gang' ? '#7c3aed' : n.group === 'bank' ? '#d97706' : '#1e40af',
            title: `Entity: ${n.label} | Group: ${n.group.toUpperCase()}`
        }));

        const visEdges = data.edges.map(e => ({
            from: e.from,
            to: e.to,
            label: e.label,
            color: { color: '#cbd5e1' },
            font: { color: '#475569', size: 10 }
        }));

        const networkData = { nodes: visNodes, edges: visEdges };
        const options = {
            nodes: { font: { color: '#0f172a', size: 12, face: 'Outfit' } },
            physics: { stabilization: true, barnesHut: { gravitationalConstant: -3500 } }
        };

        networkGraph = new vis.Network(container, networkData, options);
        document.getElementById("network-stats").innerText = `Total Nodes: ${data.total_nodes} | Edges: ${data.total_edges}`;

        networkGraph.on("click", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const targetNode = currentNodesData.find(n => n.id === nodeId);
                if (targetNode) {
                    openEntityModal(targetNode);
                }
            }
        });

    } catch (err) {
        console.error("Network Graph Error:", err);
    }
}

function openEntityModal(node) {
    const modal = document.getElementById("entity-modal");
    const title = document.getElementById("entity-modal-title");
    const body = document.getElementById("entity-modal-body");

    if (!modal || !title || !body) return;

    let groupIcon = "fa-user-ninja";
    let groupBadge = "badge-danger";
    let groupLabel = "Accused / High-Risk Suspect";

    if (node.group === "gang") {
        groupIcon = "fa-people-group";
        groupBadge = "badge-warning";
        groupLabel = "Organized Crime Syndicate";
    } else if (node.group === "bank") {
        groupIcon = "fa-building-columns";
        groupBadge = "badge-warning";
        groupLabel = "Flagged Shell Bank Account";
    } else if (node.group === "fir") {
        groupIcon = "fa-file-shield";
        groupBadge = "badge-success";
        groupLabel = "FIR Incident Record";
    }

    title.innerHTML = `<i class="fa-solid ${groupIcon}"></i> Entity Inspector: ${node.label}`;

    body.innerHTML = `
        <div style="margin-bottom:12px;"><span class="badge ${groupBadge}">${groupLabel}</span></div>
        <div style="background:var(--bg-input); padding:14px; border-radius:10px; border:1px solid var(--border-color);">
            <div style="margin-bottom:8px;"><strong>Entity ID:</strong> ${node.id}</div>
            <div style="margin-bottom:8px;"><strong>Entity Name:</strong> ${node.label}</div>
            <div style="margin-bottom:8px;"><strong>Network Influence Score:</strong> ${node.val || 20} / 100</div>
            <div><strong>Investigative Context:</strong> Interconnected in state database FIR records, hawala transactions, and GIS criminal hotspots.</div>
        </div>
        <div style="margin-top:14px; text-align:right;">
            <button class="btn-secondary" style="background:var(--accent-red); color:#fff; border:none;" onclick="queryEntityInAI('${node.label}')">
                <i class="fa-solid fa-robot"></i> Query AI Intelligence on ${node.label}
            </button>
        </div>
    `;

    modal.classList.add("active");
}

function closeEntityModal() {
    const modal = document.getElementById("entity-modal");
    if (modal) modal.classList.remove("active");
}

function queryEntityInAI(entityName) {
    closeEntityModal();
    navigateToTab('chat-view');
    document.getElementById("chat-input").value = `Provide intelligence summary for ${entityName}`;
    sendMessage(true);
}

// Leaflet GIS Hotspot Map
async function initGISMap() {
    const mapContainer = document.getElementById("gis-map");
    if (!mapContainer) return;

    gisMap = L.map('gis-map').setView([12.9716, 77.5946], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    }).addTo(gisMap);

    try {
        const res = await fetch("/api/gis");
        const data = await res.json();

        data.hotspots.forEach(spot => {
            const circle = L.circle([spot.lat, spot.lng], {
                color: '#dc2626',
                fillColor: '#dc2626',
                fillOpacity: 0.45,
                radius: 650
            }).addTo(gisMap);

            circle.bindPopup(`
                <div style="color:#0f172a; font-family:'Plus Jakarta Sans', sans-serif;">
                    <strong>${spot.fir_no}</strong><br>
                    <span style="color:#1e40af; font-weight:700;">${spot.crime_type}</span><br>
                    <em>Ward: ${spot.location}</em><br>
                    Financial Loss: ₹${(spot.intensity * 100000).toLocaleString()}
                </div>
            `);
        });
    } catch (err) {
        console.error("GIS Map Error:", err);
    }
}

// Charts (Chart.js)
async function initCharts() {
    // 1. Socio Demographic Chart
    const socioCtx = document.getElementById("socioChart");
    if (socioCtx) {
        const res = await fetch("/api/socio");
        const data = await res.json();

        const labels = data.data.map(d => d.ward);
        const crimeIndex = data.data.map(d => d.crime_rate_index);
        const unemployment = data.data.map(d => d.unemployment_rate);

        socioChart = new Chart(socioCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Crime Rate Index', data: crimeIndex, backgroundColor: 'rgba(30, 64, 175, 0.8)' },
                    { label: 'Unemployment Rate (%)', data: unemployment, backgroundColor: 'rgba(220, 38, 38, 0.8)' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { font: { weight: '600' } } },
                    y: { ticks: { font: { weight: '600' } } }
                }
            }
        });

        const container = document.getElementById("socio-cards-container");
        if (container) {
            container.innerHTML = data.correlations.map(c => `
                <div style="background:var(--bg-main); border:1px solid var(--border-color); padding:10px 14px; border-radius:8px; margin-bottom:8px;">
                    <div style="font-weight:700; color:var(--text-primary);">${c.factor} (r = ${c.coefficient})</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${c.insight}</div>
                </div>
            `).join('');
        }
    }

    // 2. Forecasting Chart
    const forecastCtx = document.getElementById("forecastingChart");
    if (forecastCtx) {
        const res = await fetch("/api/forecasting");
        const data = await res.json();

        forecastingChart = new Chart(forecastCtx, {
            type: 'line',
            data: {
                labels: data.months,
                datasets: [
                    { label: 'Cyber Crime Trend', data: data.cyber_crime, borderColor: '#1e40af', backgroundColor: 'rgba(30, 64, 175, 0.1)', fill: true, tension: 0.3 },
                    { label: 'Property Theft Trend', data: data.property_theft, borderColor: '#d97706', backgroundColor: 'rgba(217, 119, 6, 0.1)', fill: true, tension: 0.3 },
                    { label: 'Extortion & Violent', data: data.extortion_violent, borderColor: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.1)', fill: true, tension: 0.3 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Table Filters
function filterProfilingTable() {
    const input = document.getElementById("profiling-search");
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll("#profiling-table-body tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

function filterFinancialTable() {
    const input = document.getElementById("financial-search");
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll("#financial-table-body tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

// Offender Profiling Table
async function loadOffenderProfiling() {
    const tbody = document.getElementById("profiling-table-body");
    if (!tbody) return;

    const res = await fetch("/api/profiling");
    const data = await res.json();

    tbody.innerHTML = data.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.name} <span style="color:var(--text-secondary);">(${p.alias})</span></td>
            <td>
                <span class="badge ${p.risk_score > 80 ? 'badge-danger' : 'badge-warning'}">${p.risk_score} / 100</span>
            </td>
            <td>${p.mo}</td>
            <td><span class="badge badge-warning">${p.gang}</span></td>
            <td><strong style="color:var(--accent-red);">${p.recidivism_probability}</strong></td>
        </tr>
    `).join('');
}

// Financial Analysis Table
async function loadFinancialAnalysis() {
    const tbody = document.getElementById("financial-table-body");
    if (!tbody) return;

    const res = await fetch("/api/financial");
    const data = await res.json();

    tbody.innerHTML = data.transactions.map(t => `
        <tr>
            <td><strong>${t.txn_id}</strong></td>
            <td>${t.source_acc}</td>
            <td>${t.target_acc}</td>
            <td><strong style="color:var(--accent-emerald);">₹${t.amount.toLocaleString()}</strong></td>
            <td>${t.timestamp}</td>
            <td><span class="badge badge-danger">${t.flag}</span></td>
        </tr>
    `).join('');
}

// Audit Logs Table
async function loadAuditLogs() {
    const tbody = document.getElementById("audit-table-body");
    if (!tbody) return;

    const res = await fetch("/api/audit_logs");
    const data = await res.json();

    tbody.innerHTML = data.map(l => `
        <tr>
            <td>${l.time}</td>
            <td><strong>${l.user}</strong></td>
            <td><span class="badge badge-warning">${l.role}</span></td>
            <td>${l.action}</td>
        </tr>
    `).join('');
}
