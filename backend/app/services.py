"""
Service modules for audio processing, transcription, and content generation
"""
import os
import json
import logging
from pathlib import Path
from typing import Optional
import google.generativeai as genai
import PyPDF2
from dotenv import load_dotenv
import numpy as np

logger = logging.getLogger(__name__)


class LectureProcessingError(Exception):
    """Base exception for lecture processing errors."""
    pass


class AudioExtractionError(LectureProcessingError):
    """Raised when audio extraction from video fails."""
    pass


class TranscriptionError(LectureProcessingError):
    """Raised when audio transcription fails."""
    pass


class ContentGenerationError(LectureProcessingError):
    """Raised when content generation fails."""
    pass


class InvalidConfigurationError(LectureProcessingError):
    """Raised when required APIs or dependencies are not configured."""
    pass


load_dotenv()

# Configure logging for services
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    import soundfile as sf
    SOUNDFILE_AVAILABLE = True
except ImportError:
    SOUNDFILE_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

GEMINI_MODEL = "gemini-2.5-flash"
WHISPER_MODEL_SIZE = "base"
WHISPER_DEVICE = "cpu"
WHISPER_COMPUTE_TYPE = "int8"
AUDIO_SAMPLE_RATE = 16000
AUDIO_LANGUAGE = "en"
FLASHCARD_COUNT = 10
QUIZ_QUESTION_COUNT = 10
TRANSCRIPT_PREVIEW_LENGTH = 3000
SLIDES_PREVIEW_LENGTH = 1000


class AudioProcessor:
    """Handle audio extraction from video files."""
    
    @staticmethod
    def extract_audio_from_video(video_path: str, output_audio_path: str) -> bool:
        """Extract audio from video file using moviepy."""
        try:
            from moviepy.editor import VideoFileClip
            
            logger.info(f"Extracting audio from video: {video_path}")
            video = VideoFileClip(video_path)
            if video.audio is None:
                logger.error("No audio track found in video")
                return False
            
            logger.debug("Writing audio file")
            video.audio.write_audiofile(output_audio_path, codec='pcm_s16le', fps=16000, logger=None)
            video.close()
            logger.info(f"Audio extracted successfully: {output_audio_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to extract audio: {str(e)}")
            return False


class TranscriptionService:
    """Handle audio transcription using local Whisper."""
    
    @staticmethod
    def transcribe_audio(audio_path: str, model_size: str = WHISPER_MODEL_SIZE) -> Optional[str]:
        """Transcribe audio file using local Whisper model."""
        if not WHISPER_AVAILABLE or not SOUNDFILE_AVAILABLE:
            logger.error("Whisper or soundfile not available")
            return None
        
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found: {audio_path}")
            return None
        
        try:
            logger.info(f"Loading audio file: {audio_path}")
            audio_data, sample_rate = sf.read(audio_path)
            audio_data = audio_data.astype(np.float32)
            
            if len(audio_data.shape) > 1:
                audio_data = np.mean(audio_data, axis=1)
            
            if sample_rate != AUDIO_SAMPLE_RATE:
                logger.debug(f"Resampling audio from {sample_rate}Hz to {AUDIO_SAMPLE_RATE}Hz")
                from scipy import signal
                num_samples = int(len(audio_data) * AUDIO_SAMPLE_RATE / sample_rate)
                audio_data = signal.resample(audio_data, num_samples).astype(np.float32)
            
            logger.info(f"Loading Whisper model ({model_size})...")
            model = WhisperModel(model_size, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE_TYPE)
            
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_audio_path = tmp_file.name
                sf.write(tmp_audio_path, audio_data, AUDIO_SAMPLE_RATE)
            
            try:
                logger.info("Transcribing audio (this may take a few minutes)...")
                segments, info = model.transcribe(tmp_audio_path, language=AUDIO_LANGUAGE)
                text = " ".join([segment.text for segment in segments]).strip()
            finally:
                if os.path.exists(tmp_audio_path):
                    os.unlink(tmp_audio_path)
            
            if text:
                logger.info(f"Transcription complete ({len(text)} characters)")
            else:
                logger.warning("Transcription returned empty text")
            
            return text if text else None
        
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            return None


class PDFProcessor:
    """Handle PDF and slides extraction."""
    
    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> Optional[str]:
        """Extract text from PDF file."""
        try:
            logger.info(f"Extracting text from slides: {pdf_path}")
            text = ""
            with open(pdf_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
                logger.debug(f"PDF has {num_pages} pages")
                for page in pdf_reader.pages:
                    text += page.extract_text()
            
            if text:
                logger.info(f"Slides extracted ({len(text)} characters)")
            else:
                logger.warning("Slides extraction returned empty text")
            
            return text if text else None
        
        except Exception as e:
            logger.error(f"Failed to extract slides: {str(e)}")
            return None


class GeminiService:
    """Handle Gemini API integration for content generation"""
    
    @staticmethod
    def generate_notes(transcript: str, slides_content: Optional[str] = None) -> Optional[str]:
        """Generate study notes from transcript and optional slides."""
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            return None
        
        try:
            logger.info("Generating study notes...")
            model = genai.GenerativeModel(GEMINI_MODEL)
            
            prompt = f"""You are an expert study guide creator. Create comprehensive, well-organized study notes from the following lecture material.

Format the notes with:
- Clear section headings
- Key concepts highlighted
- Main points as bullet points
- Important definitions and explanations

Lecture Transcript:
{transcript}

{"Additional Materials (Slides/PDF):" + slides_content if slides_content else ""}

Generate clear, concise, and comprehensive study notes suitable for a student studying this lecture."""
            
            response = model.generate_content(prompt)
            notes = (response.text or "").strip()
            
            if notes:
                logger.info(f"Study notes generated ({len(notes)} characters)")
            else:
                logger.warning("Notes generation returned empty")
            
            return notes if notes else None
        
        except Exception as e:
            logger.error(f"Failed to generate notes: {str(e)}")
            return None
    
    @staticmethod
    def generate_flashcards(transcript: str, slides_content: Optional[str] = None, num_cards: int = FLASHCARD_COUNT) -> Optional[list]:
        """Generate flashcards from transcript and optional slides."""
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            return None
        
        try:
            logger.info(f"Generating {num_cards} flashcards...")
            model = genai.GenerativeModel(GEMINI_MODEL)
            
            prompt = f"""Create {num_cards} flashcards for studying this lecture material.

Format your response as a JSON array with this structure:
[
    {{"question": "What is...", "answer": "Definition and explanation...", "difficulty": "easy"}},
    {{"question": "How does...", "answer": "...", "difficulty": "medium"}},
    ...
]

Include a mix of difficulty levels (easy, medium, hard).
Ensure questions test understanding, not just memorization.

Lecture Transcript:
{transcript}

{"Additional Materials (Slides/PDF):" + slides_content if slides_content else ""}

Generate exactly {num_cards} flashcards as a valid JSON array only, no other text."""
            
            response = model.generate_content(prompt)
            response_text = (response.text or "").strip()
            
            if not response_text:
                logger.warning("Flashcards generation returned empty response")
                return None
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            flashcards = json.loads(response_text)
            logger.info(f"Generated {len(flashcards)} flashcards")
            return flashcards
        
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Failed to generate flashcards: {str(e)}")
            return None
    
    @staticmethod
    def generate_quiz(transcript: str, slides_content: Optional[str] = None, num_questions: int = QUIZ_QUESTION_COUNT) -> Optional[list]:
        """Generate quiz questions from transcript and optional slides."""
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            return None
        
        try:
            logger.info(f"Generating {num_questions} quiz questions...")
            model = genai.GenerativeModel(GEMINI_MODEL)
            
            prompt = f"""Create {num_questions} multiple-choice quiz questions from this lecture material.

Format your response ONLY as a valid JSON array, nothing else. No markdown, no explanation before or after.

[
    {{
        "question": "Which of the following is...",
        "options": {{"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"}},
        "correct_answer": "B",
        "explanation": "The correct answer is B because..."
    }},
    {{
        "question": "What is...",
        "options": {{"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"}},
        "correct_answer": "A",
        "explanation": "..."
    }}
]

Requirements:
- Each question must have exactly 4 options with keys A, B, C, D
- correct_answer must be a single letter: A, B, C, or D
- Include clear explanations
- Return ONLY the JSON array, no other text or formatting

Lecture Transcript:
{transcript[:TRANSCRIPT_PREVIEW_LENGTH]}

{"Slides:" + slides_content[:SLIDES_PREVIEW_LENGTH] if slides_content else ""}"""
            
            response = model.generate_content(prompt)
            response_text = (response.text or "").strip()
            
            if not response_text:
                logger.warning("Quiz generation returned empty response")
                return None
            
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.split("```")[0]
                response_text = response_text.strip()
            
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']')
            
            if start_idx == -1 or end_idx == -1 or start_idx >= end_idx:
                logger.warning("No valid JSON array found in quiz response")
                return None
            
            response_text = response_text[start_idx:end_idx + 1]
            quiz_questions = json.loads(response_text)
            
            if isinstance(quiz_questions, list):
                logger.info(f"Generated {len(quiz_questions)} quiz questions")
                return quiz_questions
            else:
                logger.warning("Quiz response is not a list")
                return None
        
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Failed to generate quiz: {str(e)}")
            return None


class LectureProcessor:
    """Orchestrates the lecture processing pipeline."""
    
    PROCESSING_STATUS = "processing"
    COMPLETED_STATUS = "completed"
    AUDIO_EXTRACTION_FAILED_STATUS = "audio_extraction_failed"
    TRANSCRIPTION_FAILED_STATUS = "transcription_failed"
    GEMINI_KEY_MISSING_STATUS = "gemini_api_key_missing"
    GENERATION_FAILED_STATUS = "generation_failed"
    
    @staticmethod
    def process_lecture(
        video_path: str,
        slides_path: Optional[str] = None,
        lecture_dir: Path = None
    ) -> dict:
        """Process lecture: extract audio, transcribe, and generate content."""
        logger.info("=" * 60)
        logger.info("Starting lecture processing pipeline")
        logger.info("=" * 60)
        
        processed_lecture = {
            "transcript": "",
            "slides_content": "",
            "notes": "",
            "flashcards": [],
            "quiz": [],
            "status": LectureProcessor.PROCESSING_STATUS,
            "error": None
        }
        
        try:
            audio_path = str(lecture_dir / "audio.wav") if lecture_dir else "temp_audio.wav"
            
            logger.info("[STEP 1/4] Extracting audio from video...")
            if not AudioProcessor.extract_audio_from_video(video_path, audio_path):
                logger.error("Audio extraction failed")
                processed_lecture["status"] = LectureProcessor.AUDIO_EXTRACTION_FAILED_STATUS
                return processed_lecture
            
            logger.info("[STEP 2/4] Transcribing audio...")
            transcript = TranscriptionService.transcribe_audio(audio_path)
            if not transcript:
                logger.error("Transcription failed")
                processed_lecture["status"] = LectureProcessor.TRANSCRIPTION_FAILED_STATUS
                return processed_lecture
            
            processed_lecture["transcript"] = transcript
            
            slides_content = None
            if slides_path and os.path.exists(slides_path):
                logger.info("[STEP 2.5/4] Extracting slides content...")
                slides_content = PDFProcessor.extract_text_from_pdf(slides_path)
                processed_lecture["slides_content"] = slides_content
            
            if not GEMINI_API_KEY:
                logger.error("GEMINI_API_KEY not configured - cannot generate content")
                processed_lecture["status"] = LectureProcessor.GEMINI_KEY_MISSING_STATUS
                return processed_lecture
            
            logger.info("[STEP 3/4] Generating study materials...")
            notes = GeminiService.generate_notes(transcript, slides_content)
            flashcards = GeminiService.generate_flashcards(transcript, slides_content)
            quiz = GeminiService.generate_quiz(transcript, slides_content)
            
            processed_lecture["notes"] = notes
            processed_lecture["flashcards"] = flashcards
            processed_lecture["quiz"] = quiz
            
            missing_outputs = []
            if not notes:
                missing_outputs.append("notes")
            if not flashcards:
                missing_outputs.append("flashcards")
            if not quiz:
                missing_outputs.append("quiz")

            if missing_outputs:
                logger.warning(f"Missing outputs: {', '.join(missing_outputs)}")
                processed_lecture["status"] = LectureProcessor.GENERATION_FAILED_STATUS
                processed_lecture["error"] = f"Missing outputs: {', '.join(missing_outputs)}"
            else:
                logger.info("[STEP 4/4] Processing complete!")
                logger.info(f"  • Transcript: {len(transcript)} characters")
                logger.info(f"  • Notes: {len(notes) if notes else 0} characters")
                logger.info(f"  • Flashcards: {len(flashcards) if flashcards else 0} cards")
                logger.info(f"  • Quiz: {len(quiz) if quiz else 0} questions")
                logger.info("=" * 60)
                processed_lecture["status"] = LectureProcessor.COMPLETED_STATUS
            
        except Exception as e:
            logger.error(f"Pipeline error: {str(e)}")
            processed_lecture["status"] = f"error: {str(e)}"
        
        return processed_lecture
