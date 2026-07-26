# 🛡️ KSP Crime Intelligence Hub
### Intelligent Conversational AI & Advanced Crime Analytics Platform

> **Empowering Investigators, Analysts, and Policymakers with Grounded Conversational AI, Geospatial Hotspots, Criminal Network Graphs, and Machine Learning Intelligence.**

---

## 📌 Executive Summary

The **KSP Crime Intelligence Hub** is a full-stack, enterprise-grade AI platform developed to transform how state police departments interact with crime databases. Moving beyond static search queries, the platform provides a **Conversational RAG Voice/Text AI** interface supporting both English and Kannada, alongside specialized modules for **Criminal Network Graph Discovery**, **GIS Crime Hotspots**, **Hawala Financial Trail Auditing**, **Criminological Offender Profiling**, and a **Live Machine Learning Retraining Suite**.

---

## 🎯 Problem Statement Addressed

Traditional law enforcement databases rely on fragmented, tabular query interfaces that hide vital links between serial offenders, crime syndicates, and financial channels. Investigators spend critical hours cross-referencing FIR records, financial ledgers, and CCTV logs manually.

**The Solution:**
KSP Crime Intelligence Hub bridges this gap by unifying:
1. **Natural Language RAG Conversational AI**: Instant natural voice and text queries in English and Kannada.
2. **Criminal Relationship Graph Discovery**: Visualizing hidden linkages between suspects, gangs, shell bank accounts, and FIRs.
3. **Spatial & Socio-Demographic Intelligence**: Correlating crime frequency with local economic indicators (unemployment, liquor density, literacy).
4. **Actionable Case Intelligence Dossiers**: Automated milestone timelines, priority leads, and forensic telemetry links.
5. **On-Demand ML Model Retraining**: Gradient Boosting Recidivism Predictor & DBSCAN Hotspot Clustering.

---

## ✨ Key Features & Functionalities

### 1. 🎙️ Mutual Voice & Text Conversational AI Interface
- **Bilingual RAG Engine**: Native support for **English** and **Kannada** queries with automated NLU intent classification.
- **Out-Loud Voice Speech Output**: Real-time browser speech synthesis for hands-free voice interaction.
- **Context-Aware Dialogue Memory**: Retains session history to handle multi-turn follow-up inquiries.

### 2. 🕸️ Interactive Criminal Network & Link Analysis
- **Graph Visualization**: Built with Vis.js for real-time node dragging, physics simulation, and group filtering.
- **Explicit Legend System**:
  - 🔴 **Red Circle**: Accused / Repeat Offenders
  - 🟣 **Purple Triangle**: Organized Crime Syndicates
  - 🟠 **Amber Diamond**: Flagged Shell Bank Accounts
  - 🔵 **Blue Square**: FIR Incident Records
- **Entity Inspector Modal**: Click any node to pop up detailed risk scores, network centrality, and linked Hawala accounts.

### 3. 🗺️ GIS Crime Hotspots & Spatial Analytics
- Interactive **Leaflet GIS Map** displaying real-time spatial crime clusters across **12 Bengaluru Wards** (Indiranagar, Whitefield, Koramangala, Jayanagar, Rajajinagar, HSR Layout, Electronic City, Hebbal, Marathahalli, Malleshwaram, Yelahanka, Bellandur).

### 4. 📂 Automated Case Intelligence Dossiers
- **Dynamic Case Selection**: Switch between active FIR dossiers (`FIR-2026-0041`, `FIR-2026-0089`, `FIR-2026-0130`, `FIR-2026-0180`).
- **Milestone Timeline**: Step-by-step investigation history with forensic icons (CCTV match, AI gait recognition, Hawala transfer).
- **AI Recommended Leads Matrix**: Priority badges (`CRITICAL`, `HIGH`, `MEDIUM`) with direct action dispatch buttons (`Execute Raid Order`, `Issue Arrest Warrant`, `Issue Freeze Order`).
- **Forensic & Technical Telemetry**: AFIS fingerprint matches, ANPR License Plate camera IDs, Tor VPN proxy IP addresses, and BSSID Wi-Fi triangulation pins.

### 5. 🤖 Machine Learning Model Training Suite
- **Recidivism Predictor**: Gradient Boosting Classifier utilizing prior convictions, gang ties, and weapon usage ($ROC\text{-}AUC = 0.945$).
- **One-Click Retraining**: Trigger `🚀 Retrain ML Models Pipeline` directly from the UI with live metric telemetry updates.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | HTML5, Modern CSS Design Tokens, JavaScript (ES6+), Vis.js, Leaflet.js, Chart.js, FontAwesome 6 |
| **Voice & Speech** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), AudioContext Unlocker |
| **Backend API** | Python 3, Flask REST API |
| **AI & Analytics** | Scikit-Learn (Gradient Boosting), DBSCAN Clustering, Pearson Correlation, Custom RAG Engine |
| **Database** | In-Memory Object-Oriented State Crime Registry (`CrimeDatabase`) |
| **PDF Export** | `html2pdf.js` Client-Side Report Generator |

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- Python 3.8+ installed on your system.

### 2. Installation Steps
```bash
# Clone the repository
git clone https://github.com/your-org/ksp-crime-intelligence-hub.git
cd ksp-crime-intelligence-hub

# Create a virtual environment (Optional but Recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Flask dependencies
pip install flask
```

### 3. Running the Server
```bash
python app.py
```
Open your browser and navigate to: **`http://127.0.0.1:5050`**

---

## 🔌 API Endpoint Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `POST /api/query` | `POST` | Process natural language voice/text query in English or Kannada |
| `POST /api/clear_chat` | `POST` | Clear conversation memory history for current session |
| `POST /api/train_model` | `POST` | Trigger ML retraining pipeline across all 12 wards |
| `GET /api/network` | `GET` | Fetch Vis.js network graph nodes and edges |
| `GET /api/gis` | `GET` | Fetch Leaflet GIS crime hotspot cluster coordinates |
| `GET /api/socio` | `GET` | Fetch socio-demographic correlation data |
| `GET /api/profiling` | `GET` | Fetch offender risk profiles |
| `GET /api/financial` | `GET` | Fetch Hawala financial transactions |
| `GET /api/audit_logs` | `GET` | Fetch real-time system governance audit logs |

---

## 🌐 Catalyst Platform Deployment Guide

To deploy this application on the **Catalyst Platform**:

1. Ensure `app.py` is configured to listen on environment port (`PORT = int(os.environ.get("PORT", 5050))`).
2. Include `requirements.txt`:
   ```text
   Flask==3.0.0
   gunicorn==21.2.0
   scikit-learn==1.3.2
   numpy==1.26.2
   ```
3. Set Start Command for Catalyst App Service:
   ```bash
   gunicorn --bind 0.0.0.0:$PORT app:app
   ```

---

## 📄 License
Licensed under the Apache 2.0 License. Developed for the Karnataka State Police Crime Intelligence Hackathon.
