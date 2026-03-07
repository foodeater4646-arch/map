# ⚔️ TTRPG Map Forge — AI Fantasy Map Generator

Generate stunning fantasy maps for your tabletop RPG campaigns using AI (Stable Diffusion via Replicate).

| Layer    | Tech                      | Port  |
|----------|---------------------------|-------|
| Frontend | React + Vite              | 5173  |
| Backend  | FastAPI (Python)          | 8000  |
| AI       | Replicate / Stable Diffusion | —  |

---

## 🔑 Prerequisites

1. **Node.js** ≥ 18 and **npm** — [nodejs.org](https://nodejs.org)
2. **Python** ≥ 3.10 — [python.org](https://www.python.org)
3. **Replicate API token** — sign up at [replicate.com](https://replicate.com), then copy your token from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Add your Replicate token
# Open .env and replace "your_token_here" with your real token
notepad .env   # or use any editor

# Start the server
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**.  
Swagger docs at **http://localhost:8000/docs**.

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎮 Usage

1. Type a map description (e.g. *"ancient forest with a river and a ruined tower"*).
2. Pick a style from the dropdown.
3. Click **Generate Map**.
4. Wait for the AI to create your map (usually 10–30 seconds).
5. Click **Download Map** to save the image.

---

## 📁 Project Structure

```
ttrpg-map-generator/
├── backend/
│   ├── .env                # Replicate API token (do NOT commit)
│   ├── main.py             # FastAPI app
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Component styles
│   │   └── index.css       # Global styles & design tokens
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md               # ← you are here
```

---

## 🛡️ Security

- The Replicate API token is stored **only** in `backend/.env` and is **never** sent to the frontend.
- `.env` is excluded from version control — make sure your `.gitignore` includes it.

---

## 📝 License

MIT — use freely for your campaigns and projects.
