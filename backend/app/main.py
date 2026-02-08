from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path
from typing import Optional
from .services import LectureProcessor

app = FastAPI(title="LectureIQ API", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage path for temporary file processing
STORAGE_DIR = Path(__file__).parent.parent / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "LectureIQ API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "LectureIQ API",
        "version": "1.0.0",
        "processing_pipeline": "active",
        "storage": "frontend (IndexedDB)"
    }


@app.post("/api/upload")
async def upload_lecture(
    title: str = Form(...),
    video: UploadFile = File(...),
    slides: Optional[UploadFile] = File(None),
):
    """
    Upload and process a lecture video with AI.
    
    This endpoint processes the video immediately and returns all results.
    No data is stored on the backend - the frontend handles storage in IndexedDB.
    
    Processing pipeline:
    1. Extract audio from video using PyAV
    2. Transcribe audio with Whisper
    3. Extract text from slides (optional)
    4. Generate notes, flashcards, and quiz with Gemini
    
    Args:
        title: Title of the lecture
        video: Video file (required)
        slides: Slides PDF file (optional)
    
    Returns:
        Complete lecture data with all generated content
    """
    try:
        # Validate inputs
        if not title or not title.strip():
            raise HTTPException(status_code=400, detail="Title is required")
        
        if not video:
            raise HTTPException(status_code=400, detail="Video file is required")
        
        # Generate unique lecture ID
        lecture_id = str(uuid.uuid4())
        
        # Create temporary directory for processing
        lecture_dir = UPLOAD_DIR / lecture_id
        lecture_dir.mkdir(parents=True, exist_ok=True)
        
        # Save video file temporarily
        video_path = lecture_dir / f"video_{video.filename}"
        with open(video_path, "wb") as f:
            content = await video.read()
            f.write(content)
        
        print(f"\n📹 Video saved: {video_path}")
        
        # Save slides if provided
        slides_path = None
        if slides:
            slides_path = lecture_dir / f"slides_{slides.filename}"
            with open(slides_path, "wb") as f:
                content = await slides.read()
                f.write(content)
            print(f"📄 Slides saved: {slides_path}")
        
        print(f"\n🚀 Processing lecture: {title}")
        
        # Process lecture and get results
        processor = LectureProcessor()
        result = processor.process_lecture(
            video_path=str(video_path),
            slides_path=str(slides_path) if slides_path else None,
            lecture_dir=lecture_dir
        )
        
        print(f"✅ Processing complete!")
        print(f"   - Transcript: {len(result.get('transcript', '') or '')} chars")
        print(f"   - Notes: {len(result.get('notes', '') or '')} chars")
        print(f"   - Flashcards: {len(result.get('flashcards') or [])} cards")
        print(f"   - Quiz: {len(result.get('quiz') or [])} questions")
        
        # Normalize status to frontend-compatible values
        backend_status = result.get("status", "completed")
        if backend_status not in ["processing", "completed", "failed"]:
            frontend_status = "failed"
            error_message = f"{backend_status}: {result.get('error', '')}"
        else:
            frontend_status = backend_status
            error_message = result.get("error")
        
        # Transform quiz format: {A, B, C, D} dict → array with numeric index
        quiz_data = result.get("quiz") or []
        transformed_quiz = []
        for q in quiz_data:
            if isinstance(q.get('options'), dict):
                # Convert {"A": "...", "B": "..."} → ["...", "...", "...", "..."]
                options_dict = q['options']
                options_array = [options_dict.get(k, '') for k in ['A', 'B', 'C', 'D']]
                # Convert correct_answer "B" → 1 (numeric index)
                correct_letter = q.get('correct_answer', 'A')
                correct_index = {'A': 0, 'B': 1, 'C': 2, 'D': 3}.get(correct_letter, 0)
                transformed_quiz.append({
                    'question': q.get('question', ''),
                    'options': options_array,
                    'correct_answer': correct_index,
                    'explanation': q.get('explanation', '')
                })
            else:
                # Already in correct format
                transformed_quiz.append(q)
        
        # Return complete results to frontend for storage
        response = {
            "lecture_id": lecture_id,
            "status": frontend_status,
            "message": "Lecture processed successfully" if frontend_status == "completed" else "Processing completed with errors",
            "transcript": result.get("transcript"),
            "notes": result.get("notes"),
            "flashcards": result.get("flashcards"),
            "quiz": transformed_quiz,
            "error": error_message,
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        print(f"❌ Error processing lecture: {e}")
        import traceback
        traceback.print_exc()
        
        # Return error response
        return JSONResponse(
            status_code=200,
            content={
                "lecture_id": lecture_id if 'lecture_id' in locals() else str(uuid.uuid4()),
                "status": "failed",
                "message": "Processing failed",
                "error": str(e),
                "transcript": None,
                "notes": None,
                "flashcards": None,
                "quiz": None,
            }
        )
    finally:
        # Cleanup temporary files
        try:
            if 'lecture_dir' in locals() and lecture_dir.exists():
                import shutil
                shutil.rmtree(lecture_dir)
                print(f"🗑️  Cleaned up temporary files: {lecture_dir}")
        except Exception as cleanup_error:
            print(f"⚠️  Cleanup failed: {cleanup_error}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

