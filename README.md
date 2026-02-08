# 🎓 LectureIQ

**AI-Powered Lecture Processing Platform** — Transform video lectures into interactive study materials with AI-generated notes, flashcards, and quizzes.

Built for the **Gemini 3 Hackathon**

---

## 🌟 Features

### Core Functionality
- **📹 Video Processing** — Upload lecture videos in any format (MP4, MOV, AVI, WebM)
- **📄 Slide Extraction** — Upload PDF slides for synchronized content
- **🎙️ Audio Transcription** — Extract and transcribe audio using Whisper/Google STT
- **🧠 AI Content Generation** — Generate notes, flashcards, and quizzes with Google Gemini
- **⏱️ Smart Alignment** — Align transcript sections with relevant slides

### Study Tools
- **📝 Interactive Notes** — Structured notes with key concepts and timestamps
- **🗂️ Flashcards** — AI-generated flashcards with difficulty levels
- **✅ Quiz Interface** — Multiple-choice questions with explanations
- **🔄 Section Navigation** — Navigate between lecture sections

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Generative AI API Key (optional for testing with mock data)

### Installation

1. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment (optional)**
   ```bash
   cd backend
   # Create .env file if needed
   # Add GEMINI_API_KEY for AI features
   ```

3. **Start backend** (Terminal 1)
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Start frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open** http://localhost:5173 (or the URL shown in terminal)

---

## 🏗️ Tech Stack

**Frontend**
- Vite
- React 19
- TypeScript
- Tailwind CSS 3.4
- React Query (@tanstack/react-query)
- React Router
- Zustand

**Backend**
- FastAPI
- SQLAlchemy
- Redis
- Celery
- Google Generative AI
- Alembic

---

## 📖 Usage

1. Navigate to http://localhost:3000
2. Upload a video file and optional PDF slides
3. Enter a lecture title
4. Click "Process Lecture"
5. View generated notes, flashcards, and quiz

---

## 🔧 Configuration

### Backend `.env`
```env
DATABASE_URL=sqlite:///./lectureiq.db
GEMINI_API_KEY=your_api_key_here
```

### Frontend `.env.local`
```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 📚 Project Structure

```
LectureIq/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   └── __init__.py
│   ├── storage/
│   │   └── uploads/       # Uploaded files
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   ├── components/    # UI components
│   │   ├── store/         # State management (Zustand)
│   │   ├── api/           # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/            # Static assets
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.ts # Tailwind configuration
│   └── package.json
│
├── mock material/         # Sample data for testing
└── README.md
```

---

## 🧪 Development

### Testing with Mock Data
The backend includes mock material in the `/mock material` folder for testing without API keys:
- Mock transcripts
- Mock flashcards and quiz questions
- Backend uses this data when processing lectures

---

## 📄 License

MIT License

---

**Built with ❤️ for the Gemini 3 Hackathon**
