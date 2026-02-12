# LectureIQ

**AI-Powered Lecture Processing Platform** — Transform video lectures into interactive study materials with AI-generated notes, flashcards, and quizzes.

Built for the **Gemini Hackathon** | **Production Ready**

---

## Features

### Core Functionality
- **Video Processing** — Upload lecture videos (MP4, MOV, AVI, WebM) up to 500MB
- **Audio Extraction** — PyAV extracts audio from videos with automatic format conversion
- **Audio Transcription** — OpenAI Whisper transcribes speech to text with high accuracy
- **AI Content Generation** — Google Gemini generates notes, flashcards, and quizzes
- **Slide Support** — Optional PDF slides for enhanced context

### Study Tools
- **Interactive Notes** — AI-organized with sections, bullet points, and key concepts
- **Flashcards** — Unlimited AI-generated flashcards with flip animation
- **Quiz Interface** — 10 multiple-choice questions with automatic answer validation
- **Browser Storage** — IndexedDB local storage - no server database needed
- **Navigation** — Seamless tab switching between Notes, Flashcards, and Quiz

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Generative AI API Key ([Get one free here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and Setup**
```bash
git clone <repository>
cd LectureIQ
```

2. **Install Dependencies**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd ../frontend
npm install
```

3. **Configure Environment**
```bash
# Backend
cd ../backend
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. **Launch System** (Recommended - Automatic)
```bash
# From project root
.\launch.ps1
```

This will automatically:
- Start backend on http://127.0.0.1:8000
- Start frontend on http://localhost:5173
- Open browser to the UI

OR **Manual Start** (2 terminals needed):

Terminal 1 - Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

5. **Upload Your First Lecture**
- Navigate to http://localhost:5173
- Fill in lecture title
- Upload video file (MP4, MOV, AVI, WebM)
- Optionally add PDF slides
- Click "Process Lecture"
- Wait 2-10 minutes for processing
- View your generated study materials!

---

## Tech Stack

**Frontend**
- **Vite** - Next-gen build tool
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **IndexedDB** - Browser local storage
- **Zustand** - State management
- **Lucide Icons** - Icon library

**Backend**
- **FastAPI** - Modern Python web framework
- **PyAV 16.1.0** - Audio/video processing with embedded ffmpeg
- **OpenAI Whisper** - Speech-to-text transcription (base model)
- **Google Generative AI (Gemini)** - Content generation
- **Python-dotenv** - Environment management

**Infrastructure**
- **Async/Await** - Non-blocking operations
- **CORS** - Secure frontend-backend communication
- **File cleanup** - Automatic temp file management
- **Error handling** - Comprehensive error responses
- **Docker** - Containerized deployment

---

## Usage

### Background Processing (New!)

LectureIQ now uses **asynchronous background processing** to handle long-running tasks:

- **Upload returns immediately** — No waiting for processing to complete
- **Background processing** — Lectures process without blocking the API
- **Status polling** — Frontend automatically checks progress every 5 seconds
- **Multiple uploads** — Upload multiple lectures simultaneously
- **Container stability** — Health checks remain responsive during processing

**API Endpoints:**
- `POST /api/upload` — Upload lecture (returns immediately with lecture_id)
- `GET /api/status/{lecture_id}` — Check processing status
- `GET /health` — Health check (always responsive)

### Processing Timeline
1. Upload video → Saved to temp directory (< 1 second)
2. Audio extraction → PyAV converts to WAV (1-2 seconds)
3. Transcription → Whisper processes audio (2-10 minutes depending on length)
4. Content generation → Gemini creates notes, flashcards, quiz (1-2 minutes)
5. Data formatting → Backend transforms and returns (< 1 second)
6. Storage → IndexedDB stores in browser (< 1 second)
7. Display → Frontend renders study materials (< 1 second)

### Expected Output
- **Notes** — Organized markdown with sections and bullet points
- **Flashcards** — 10 AI-generated question-answer pairs
- **Quiz** — 10 multiple-choice questions with instant feedback

### Advanced Features
- Quiz score tracking
- Quiz timer display
- Flashcard flip animation
- Automatic IndexedDB storage
- Automatic temp file cleanup

---

## Configuration

### Backend `.env`
Create `backend/.env` from the template:
```bash
cp backend/.env.example backend/.env
```

Edit and add your API key:
```env
GEMINI_API_KEY=your_google_generative_ai_key
STORAGE_PATH=storage
USE_CELERY=false
REDIS_URL=redis://localhost:6379
```

**Get your API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to `.env` file


### Frontend `.env.local`
Create `frontend/.env.local` from the template:
```bash
cp frontend/.env.example frontend/.env.local
```

```env
VITE_API_URL=http://localhost:8000
```


---

## Project Structure

```
LectureIQ/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + /api/upload endpoint
│   │   ├── services.py       # Audio, transcription, AI services
│   │   └── __init__.py
│   ├── storage/
│   │   └── uploads/          # Temp files (auto-cleaned)
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Container configuration
│   ├── entrypoint.sh         # Container startup script
│   ├── .env.example          # Template (safe to commit)
│   └── .env                  # Your secrets (git-ignored)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing
│   │   │   ├── Lecture.tsx        # Study view
│   │   │   ├── MyLectures.tsx     # Lecture library
│   │   │   ├── Features.tsx
│   │   │   ├── Docs.tsx
│   │   │   ├── Terms.tsx
│   │   │   ├── Privacy.tsx
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── UploadForm.tsx     # Video upload form
│   │   │   ├── Navbar.tsx         # Navigation
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── db.ts             # IndexedDB layer
│   │   │   └── validation.ts
│   │   ├── api/
│   │   │   └── client.ts         # API calls
│   │   ├── store/
│   │   │   └── lectureStore.ts   # Zustand state
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example              # Template (safe to commit)
│   └── .env.local               # Your config (git-ignored)
│
├── launch.ps1                  # Quick launcher script
├── README.md
└── .gitignore                  # Protects .env files
```


## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions and platform-specific configurations.

### Quick Deployment Notes

**Important**: Configure health checks properly to prevent container restarts:
- HeDocker Compose (Recommended for testing deployment)
```bash
# Set your API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Start services
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health

### alth check path: `/health`
- Interval: 30 seconds minimum
- Timeout: 10 seconds minimum
- Failure threshold: 3 attempts minimum

### Local Development
```bash
.\launch.ps1
```

### Railway Deployment
1. Push to GitHub
2. Connect repository to Railway
3. Set environment variables (GEMINI_API_KEY, etc.)
4. Railway automatically builds and deploys using the Dockerfile

---

## Contributing

1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create pull request

---

## About LectureIQ

Transform your lecture workflow with AI-powered study materials. Upload once, study smarter.

**Key Features:**
- Full-stack AI pipeline for lecture processing
- Production-ready with auto-deployment support
- Secure configuration management
- Tested with real videos and transcription
- Gemini-powered intelligent content generation
- Browser-based local storage (no server database)


---

**Built with FastAPI, React, PyAV, Whisper, and Google Gemini API**
