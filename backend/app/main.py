from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional, Dict
from .services import LectureProcessor
from datetime import datetime

logger = logging.getLogger(__name__)

# Global in-memory storage for processing status and results
processing_jobs: Dict[str, dict] = {}

class UploadValidationError(Exception):
    """Raised when file upload validation fails."""
    pass


def create_error_response(lecture_id: str, error: Exception, status_code: int = 400) -> dict:
    """Build a standardized error response."""
    return {
        "lecture_id": lecture_id,
        "status": "failed",
        "message": "Processing failed",
        "error": str(error),
        "transcript": None,
        "notes": None,
        "flashcards": None,
        "quiz": None,
    }


app = FastAPI(title="LectureIQ API", version="1.0.0")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger.info("LectureIQ API Initialized")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = Path(__file__).parent.parent / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

QUIZ_OPTION_LETTER_TO_INDEX = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
QUIZ_OPTION_LETTERS = ['A', 'B', 'C', 'D']
HTTP_SUCCESS_STATUS = 200


def _transform_quiz_format(quiz_data: list) -> list:
    """Convert quiz options from letter-keyed dict to array format with numeric indices."""
    transformed_quiz = []
    for question in quiz_data:
        if isinstance(question.get('options'), dict):
            options_dict = question['options']
            options_array = [options_dict.get(letter, '') for letter in QUIZ_OPTION_LETTERS]
            correct_letter = question.get('correct_answer', 'A')
            correct_index = QUIZ_OPTION_LETTER_TO_INDEX.get(correct_letter, 0)
            transformed_quiz.append({
                'question': question.get('question', ''),
                'options': options_array,
                'correct_answer': correct_index,
                'explanation': question.get('explanation', '')
            })
        else:
            transformed_quiz.append(question)
    return transformed_quiz


async def _save_upload_file(upload_file: UploadFile, destination_path: Path) -> None:
    """Persist an uploaded file to disk."""
    content = await upload_file.read()
    with open(destination_path, "wb") as f:
        f.write(content)


def _create_success_response(lecture_id: str, processed_lecture: dict) -> dict:
    """Build API response from processed lecture data."""
    backend_status = processed_lecture.get("status", "completed")
    if backend_status not in ["processing", "completed", "failed"]:
        frontend_status = "failed"
        error_message = f"{backend_status}: {processed_lecture.get('error', '')}"
    else:
        frontend_status = backend_status
        error_message = processed_lecture.get("error")
    
    quiz_data = processed_lecture.get("quiz") or []
    transformed_quiz = _transform_quiz_format(quiz_data)
    
    return {
        "lecture_id": lecture_id,
        "status": frontend_status,
        "message": "Lecture processed successfully" if frontend_status == "completed" else "Processing completed with errors",
        "transcript": processed_lecture.get("transcript"),
        "notes": processed_lecture.get("notes"),
        "flashcards": processed_lecture.get("flashcards"),
        "quiz": transformed_quiz,
        "error": error_message,
    }


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
        "storage": "frontend (IndexedDB)",
        "active_jobs": len([j for j in processing_jobs.values() if j.get("status") == "processing"])
    }


@app.get("/api/status/{lecture_id}")
async def get_processing_status(lecture_id: str):
    """Check the processing status of a lecture."""
    if lecture_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Lecture ID not found")
    
    job = processing_jobs[lecture_id]
    return {
        "lecture_id": lecture_id,
        "status": job.get("status", "unknown"),
        "message": job.get("message", ""),
        "started_at": job.get("started_at"),
        "completed_at": job.get("completed_at"),
        "result": job.get("result") if job.get("status") == "completed" else None
    }


def process_lecture_background(lecture_id: str, video_path: Path, slides_path: Optional[Path], lecture_dir: Path):
    """Background task to process lecture without blocking the API."""
    try:
        logger.info(f"Starting background processing for lecture: {lecture_id}")
        processing_jobs[lecture_id]["status"] = "processing"
        processing_jobs[lecture_id]["message"] = "Processing lecture..."
        
        processor = LectureProcessor()
        processed_lecture = processor.process_lecture(
            video_path=str(video_path),
            slides_path=str(slides_path) if slides_path else None,
            lecture_dir=lecture_dir
        )
        
        response = _create_success_response(lecture_id, processed_lecture)
        
        processing_jobs[lecture_id]["status"] = response["status"]
        processing_jobs[lecture_id]["message"] = response["message"]
        processing_jobs[lecture_id]["result"] = response
        processing_jobs[lecture_id]["completed_at"] = datetime.utcnow().isoformat()
        
        if response["status"] == "completed":
            logger.info(f"Lecture processing successful | ID: {lecture_id}")
        else:
            logger.warning(f"Lecture processing completed with issues | Status: {response['status']} | ID: {lecture_id}")
            
    except Exception as e:
        logger.error(f"Error in background processing | ID: {lecture_id} | Error: {str(e)}")
        processing_jobs[lecture_id]["status"] = "failed"
        processing_jobs[lecture_id]["message"] = f"Processing failed: {str(e)}"
        processing_jobs[lecture_id]["result"] = create_error_response(lecture_id, e)
        processing_jobs[lecture_id]["completed_at"] = datetime.utcnow().isoformat()
    finally:
        try:
            if lecture_dir.exists():
                shutil.rmtree(lecture_dir)
                logger.debug(f"Cleaned up temporary files for lecture: {lecture_id}")
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup files for {lecture_id}: {str(cleanup_error)}")


@app.post("/api/upload")
async def upload_lecture(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    video: UploadFile = File(...),
    slides: Optional[UploadFile] = File(None),
):
    """Initiate lecture processing and return immediately."""
    try:
        if not title or not title.strip():
            raise HTTPException(status_code=400, detail="Title is required")
        
        if not video:
            raise HTTPException(status_code=400, detail="Video file is required")
        
        lecture_id = str(uuid.uuid4())
        logger.info(f"New upload request - Lecture: '{title}' | ID: {lecture_id}")
        
        lecture_dir = UPLOAD_DIR / lecture_id
        lecture_dir.mkdir(parents=True, exist_ok=True)
        
        video_path = lecture_dir / f"video_{video.filename}"
        await _save_upload_file(video, video_path)
        logger.info(f"Video file saved: {video.filename} ({video.size or 0} bytes)")
        
        slides_path = None
        if slides:
            slides_path = lecture_dir / f"slides_{slides.filename}"
            await _save_upload_file(slides, slides_path)
            logger.info(f"Slides file saved: {slides.filename} ({slides.size or 0} bytes)")
        
        # Initialize job tracking
        processing_jobs[lecture_id] = {
            "status": "queued",
            "message": "Lecture queued for processing",
            "title": title,
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None,
            "result": None
        }
        
        # Schedule background processing
        background_tasks.add_task(
            process_lecture_background,
            lecture_id=lecture_id,
            video_path=video_path,
            slides_path=slides_path,
            lecture_dir=lecture_dir
        )
        
        logger.info(f"Lecture queued for background processing | ID: {lecture_id}")
        
        # Return immediately with lecture_id
        return JSONResponse(content={
            "lecture_id": lecture_id,
            "status": "processing",
            "message": "Lecture is being processed. Use /api/status/{lecture_id} to check progress.",
            "status_url": f"/api/status/{lecture_id}"
        })
        
    except Exception as e:
        lecture_id = lecture_id if 'lecture_id' in locals() else str(uuid.uuid4())
        logger.error(f"Error initiating lecture processing | ID: {lecture_id} | Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

