from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import re
from pathlib import Path
from typing import Optional
import json

app = FastAPI(title="LectureIQ API", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lecture-iq-drab.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage path
STORAGE_DIR = Path(__file__).parent.parent / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# In-memory database (will be replaced with MongoDB later)
lectures_db = {}


# Load mock material
def load_mock_material():
    """Load mock material files and parse them"""
    mock_dir = Path(__file__).parent.parent.parent / "mock material"
    
    flashcards = []
    quiz_questions = []
    notes = ""
    
    # Load Transcript (as notes)
    try:
        transcript_path = mock_dir / "Transcript.txt"
        if transcript_path.exists():
            with open(transcript_path, 'r', encoding='utf-8') as f:
                notes = f.read()
    except Exception as e:
        print(f"Error loading transcript: {e}")
    
    # Parse Flashcards
    try:
        flashcard_path = mock_dir / "Flashcards.txt"
        if flashcard_path.exists():
            with open(flashcard_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split by "Flashcard X" pattern
            cards = re.split(r'Flashcard \d+\n\n', content)
            for card in cards[1:]:  # Skip first empty split
                lines = card.strip().split('\n')
                q = ""
                a = ""
                in_answer = False
                
                for line in lines:
                    if line.startswith('Q:'):
                        q = line.replace('Q:', '').strip()
                    elif line.startswith('A:'):
                        in_answer = True
                        a = line.replace('A:', '').strip()
                    elif in_answer and line.strip():
                        if a:
                            a += " " + line.strip()
                        else:
                            a = line.strip()
                
                if q and a:
                    flashcards.append({"question": q, "answer": a})
    except Exception as e:
        print(f"Error loading flashcards: {e}")
    
    # Parse Quiz
    try:
        quiz_path = mock_dir / "Quiz.txt"
        if quiz_path.exists():
            with open(quiz_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"[DEBUG] Quiz file loaded, content length: {len(content)}")
            
            # Split by double newlines to separate questions and options
            question_blocks = content.strip().split('\n\n')
            print(f"[DEBUG] Number of blocks: {len(question_blocks)}")
            
            current_question = None
            current_options = {}
            
            for idx, block in enumerate(question_blocks):
                block = block.strip()
                if not block:
                    continue
                
                # If it starts with a number followed by period, it's a question
                if re.match(r'^\d+\.\s+', block):
                    # Save previous question if exists
                    if current_question and current_options:
                        quiz_questions.append({
                            "question": current_question,
                            "options": current_options,
                            "correct_answer": "B"
                        })
                        print(f"[DEBUG] Added question: {current_question[:50]}")
                    
                    # Extract question text (remove the number prefix)
                    match = re.match(r'^\d+\.\s+(.*)', block)
                    current_question = match.group(1) if match else block
                    current_options = {}
                
                # If it starts with A/B/C/D, it's an option
                elif block and block[0] in 'ABCD' and len(block) > 2:
                    lines = block.split('\n')
                    for line in lines:
                        line = line.strip()
                        if line and line[0] in 'ABCD' and len(line) > 2:
                            key = line[0]
                            val = line[2:].strip()
                            current_options[key] = val
            
            # Don't forget the last question
            if current_question and current_options:
                quiz_questions.append({
                    "question": current_question,
                    "options": current_options,
                    "correct_answer": "B"
                })
                print(f"[DEBUG] Added final question: {current_question[:50]}")
            
            print(f"[DEBUG] Total quiz questions parsed: {len(quiz_questions)}")
        
        # Parse correct answers from answer key
        try:
            answers_path = mock_dir / "Quiz Answers.txt"
            if answers_path.exists():
                with open(answers_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find answers like "✔ B. Ways to..."
                answer_pattern = r'✔\s+([A-D])\..*'
                matches = re.findall(answer_pattern, content)
                
                # Update quiz questions with correct answers
                for idx, answer in enumerate(matches):
                    if idx < len(quiz_questions):
                        quiz_questions[idx]["correct_answer"] = answer
        except Exception as e:
            print(f"Error loading quiz answers: {e}")
            
    except Exception as e:
        print(f"Error loading quiz: {e}")
    
    return flashcards, quiz_questions, notes


# Initialize mock data
MOCK_FLASHCARDS, MOCK_QUIZ, MOCK_NOTES = load_mock_material()


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "LectureIQ API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mock_data_loaded": {
            "flashcards": len(MOCK_FLASHCARDS),
            "quiz_questions": len(MOCK_QUIZ),
            "notes": len(MOCK_NOTES) > 0
        }
    }


@app.post("/api/upload")
async def upload_lecture(
    title: str = Form(...),
    video: UploadFile = File(...),
    slides: Optional[UploadFile] = File(None),
):
    """
    Upload a lecture video and optional slides.
    
    Args:
        title: Title of the lecture
        video: Video file (required)
        slides: Slides PDF file (optional)
    
    Returns:
        Lecture data with generated ID
    """
    try:
        # Validate inputs
        if not title or not title.strip():
            raise HTTPException(status_code=400, detail="Title is required")
        
        if not video:
            raise HTTPException(status_code=400, detail="Video file is required")
        
        # Generate unique lecture ID
        lecture_id = str(uuid.uuid4())
        
        # Create lecture directory
        lecture_dir = UPLOAD_DIR / lecture_id
        lecture_dir.mkdir(parents=True, exist_ok=True)
        
        # Save video file
        video_path = lecture_dir / f"video_{video.filename}"
        with open(video_path, "wb") as f:
            content = await video.read()
            f.write(content)
        
        # Save slides if provided
        slides_path = None
        if slides:
            slides_path = lecture_dir / f"slides_{slides.filename}"
            with open(slides_path, "wb") as f:
                content = await slides.read()
                f.write(content)
        
        # Create lecture record with mock data
        lecture = {
            "id": lecture_id,
            "title": title,
            "video_file": video.filename,
            "slides_file": slides.filename if slides else None,
            "status": "completed",
            "notes": MOCK_NOTES,
            "flashcards": MOCK_FLASHCARDS,
            "quiz": MOCK_QUIZ,
        }
        
        # Store in database
        lectures_db[lecture_id] = lecture
        
        return {
            "success": True,
            "lecture_id": lecture_id,
            "title": title,
            "status": "uploaded",
            "message": "Lecture uploaded successfully. Processing will begin shortly."
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/lectures/{lecture_id}")
async def get_lecture(lecture_id: str):
    """Get lecture details by ID"""
    if lecture_id not in lectures_db:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    return lectures_db[lecture_id]


@app.get("/api/lectures")
async def list_lectures():
    """List all lectures"""
    return {
        "lectures": list(lectures_db.values()),
        "total": len(lectures_db)
    }


@app.get("/api/lectures/{lecture_id}/flashcards")
async def get_flashcards(lecture_id: str):
    """Get flashcards for a lecture"""
    if lecture_id not in lectures_db:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    lecture = lectures_db[lecture_id]
    return {
        "lecture_id": lecture_id,
        "flashcards": lecture.get("flashcards", []),
        "total": len(lecture.get("flashcards", []))
    }


@app.get("/api/lectures/{lecture_id}/notes")
async def get_notes(lecture_id: str):
    """Get notes for a lecture"""
    if lecture_id not in lectures_db:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    lecture = lectures_db[lecture_id]
    return {
        "lecture_id": lecture_id,
        "notes": lecture.get("notes", ""),
        "title": lecture.get("title", "")
    }


@app.get("/api/lectures/{lecture_id}/quiz")
async def get_quiz(lecture_id: str):
    """Get quiz for a lecture"""
    if lecture_id not in lectures_db:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    lecture = lectures_db[lecture_id]
    return {
        "lecture_id": lecture_id,
        "quiz": lecture.get("quiz", []),
        "total": len(lecture.get("quiz", []))
    }


@app.delete("/api/lectures/{lecture_id}")
async def delete_lecture(lecture_id: str):
    """Delete a lecture"""
    if lecture_id not in lectures_db:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # Delete from database
    deleted_lecture = lectures_db.pop(lecture_id)
    
    # TODO: Delete associated files from storage
    # storage_path = UPLOAD_DIR / lecture_id
    # if storage_path.exists():
    #     shutil.rmtree(storage_path)
    
    return {
        "message": "Lecture deleted successfully",
        "deleted_lecture_id": lecture_id,
        "deleted_title": deleted_lecture.get("title", "Unknown")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
