"""
Service modules for audio processing, transcription, and content generation
"""
import os
import json
from pathlib import Path
from typing import Optional
import google.generativeai as genai
import PyPDF2
from dotenv import load_dotenv
import numpy as np

# Load environment variables
load_dotenv()

# Try to import local Whisper
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️  Warning: openai-whisper not installed. Will use mock transcription.")
    print("   Install with: pip install openai-whisper")

# Try to import soundfile for audio loading
try:
    import soundfile as sf
    SOUNDFILE_AVAILABLE = True
except ImportError:
    SOUNDFILE_AVAILABLE = False
    print("⚠️  Warning: soundfile not installed.")
    print("   Install with: pip install soundfile scipy")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class AudioProcessor:
    """Handle audio extraction from video files"""
    
    @staticmethod
    def extract_audio_from_video(video_path: str, output_audio_path: str) -> bool:
        """
        Extract audio from video file using PyAV (includes embedded ffmpeg)
        
        Args:
            video_path: Path to video file
            output_audio_path: Path where audio should be saved (.wav)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            import av
            import soundfile as sf
            
            print(f"   Opening video: {video_path}")
            container = av.open(video_path)
            
            # Find audio stream
            audio_stream = None
            for stream in container.streams:
                if stream.type == 'audio':
                    audio_stream = stream
                    break
            
            if audio_stream is None:
                print(f"❌ No audio stream found in video")
                return False
            
            print(f"   Extracting audio (sample rate: {audio_stream.sample_rate} Hz)...")
            
            # Decode and collect audio frames
            audio_frames = []
            for frame in container.decode(audio_stream):
                audio_frames.append(frame.to_ndarray())
            
            # Concatenate all frames
            if not audio_frames:
                print(f"❌ No audio frames decoded")
                return False
            
            import numpy as np
            audio_data = np.concatenate(audio_frames, axis=1)
            
            # Transpose if needed (PyAV might return channels first)
            if audio_data.shape[0] < audio_data.shape[1]:
                audio_data = audio_data.T
            
            # Convert to mono if stereo
            if audio_data.ndim > 1 and audio_data.shape[1] > 1:
                print(f"   Converting stereo to mono...")
                audio_data = np.mean(audio_data, axis=1)
            elif audio_data.ndim > 1:
                audio_data = audio_data.squeeze()
            
            # Normalize dtype
            audio_data = audio_data.astype(np.float32)
            
            print(f"   Saving to WAV: {output_audio_path}")
            sf.write(output_audio_path, audio_data, audio_stream.sample_rate)
            
            print(f"✅ Audio extracted successfully")
            return True
        
        except Exception as e:
            print(f"❌ Error extracting audio: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


class TranscriptionService:
    """Handle audio transcription using local Whisper"""
    
    @staticmethod
    def transcribe_audio(audio_path: str, model_size: str = "base") -> Optional[str]:
        """
        Transcribe audio file using local Whisper model
        
        Args:
            audio_path: Path to audio file
            model_size: Whisper model size (tiny, base, small, medium, large)
        
        Returns:
            Transcribed text or None if failed
        """
        try:
            if not WHISPER_AVAILABLE:
                print("❌ Whisper not installed. Install with: pip install openai-whisper")
                return None
            
            if not SOUNDFILE_AVAILABLE:
                print("❌ soundfile not installed. Install with: pip install soundfile scipy")
                return None
            
            # Check if file exists
            if not os.path.exists(audio_path):
                print(f"❌ Audio file not found: {audio_path}")
                return None
            
            print(f"🎙️ Transcribing audio with local Whisper ({model_size} model)")
            
            # Load audio using soundfile
            print(f"   Loading audio...")
            try:
                audio_data, sample_rate = sf.read(audio_path)
            except Exception as e:
                print(f"❌ Failed to read audio with soundfile: {str(e)}")
                return None
            
            # Convert to float32 and mono
            audio_data = audio_data.astype(np.float32)
            if len(audio_data.shape) > 1:
                audio_data = np.mean(audio_data, axis=1)
            
            print(f"   Audio loaded: {len(audio_data)} samples at {sample_rate} Hz")
            
            # Resample to 16kHz if needed
            if sample_rate != 16000:
                from scipy import signal
                print(f"   Resampling to 16 kHz...")
                num_samples = int(len(audio_data) * 16000 / sample_rate)
                audio_data = signal.resample(audio_data, num_samples).astype(np.float32)
            
            # Load model
            print(f"   Loading Whisper model: {model_size}...")
            model = whisper.load_model(model_size)
            
            # Transcribe by passing audio data directly (no ffmpeg needed!)
            print(f"   Transcribing (this may take a few minutes)...")
            
            # Use Whisper's pad_or_trim to normalize audio
            audio_data = whisper.audio.pad_or_trim(audio_data)
            
            # Convert to mel spectrogram directly
            mel = whisper.audio.log_mel_spectrogram(audio_data).to(model.device)
            
            # Run inference
            options = whisper.DecodingOptions(language="en", fp16=False)
            result = whisper.decode(model, mel, options)
            
            text = result.text.strip()
            
            if not text:
                print("❌ Transcription returned empty text")
                return None
            
            print(f"✅ Transcription complete! Length: {len(text)} characters")
            return text
        
        except Exception as e:
            print(f"❌ Error transcribing audio: {str(e)}")
            import traceback
            traceback.print_exc()
            return None


class PDFProcessor:
    """Handle PDF and slides extraction"""
    
    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> Optional[str]:
        """
        Extract text from PDF file
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            Extracted text or None if failed
        """
        try:
            text = ""
            with open(pdf_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
                
                print(f"Extracting text from PDF with {num_pages} pages")
                
                for page in pdf_reader.pages:
                    text += page.extract_text()
            
            print(f"PDF text extraction complete. Length: {len(text)} characters")
            return text
        
        except Exception as e:
            print(f"Error extracting PDF text: {str(e)}")
            return None


class GeminiService:
    """Handle Gemini API integration for content generation"""
    
    @staticmethod
    def generate_notes(transcript: str, slides_content: Optional[str] = None) -> Optional[str]:
        """
        Generate study notes from transcript and optional slides
        
        Args:
            transcript: Transcribed lecture text
            slides_content: Optional extracted PDF/slides text
        
        Returns:
            Generated notes or None if failed
        """
        if not GEMINI_API_KEY:
            print("GEMINI_API_KEY not set. Cannot generate notes.")
            return None
        
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            
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
            
            print("Generating notes with Gemini...")
            response = model.generate_content(prompt)
            
            notes = (response.text or "").strip()
            if not notes:
                return None
            print(f"Notes generated successfully. Length: {len(notes)} characters")
            return notes
        
        except Exception as e:
            print(f"Error generating notes: {str(e)}")
            return None
    
    @staticmethod
    def generate_flashcards(transcript: str, slides_content: Optional[str] = None, num_cards: int = 10) -> Optional[list]:
        """
        Generate flashcards from transcript and optional slides
        
        Args:
            transcript: Transcribed lecture text
            slides_content: Optional extracted PDF/slides text
            num_cards: Number of flashcards to generate
        
        Returns:
            List of flashcard dictionaries or None if failed
        """
        if not GEMINI_API_KEY:
            print("GEMINI_API_KEY not set. Cannot generate flashcards.")
            return None
        
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            
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
            
            print(f"Generating {num_cards} flashcards with Gemini...")
            response = model.generate_content(prompt)
            
            # Parse JSON response
            response_text = (response.text or "").strip()
            if not response_text:
                return None
            
            # Try to extract JSON if it's wrapped in markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            flashcards = json.loads(response_text)
            print(f"Generated {len(flashcards)} flashcards successfully")
            return flashcards
        
        except json.JSONDecodeError as e:
            print(f"Error parsing flashcard JSON: {str(e)}")
            return None
        except Exception as e:
            print(f"Error generating flashcards: {str(e)}")
            return None
    
    @staticmethod
    def generate_quiz(transcript: str, slides_content: Optional[str] = None, num_questions: int = 10) -> Optional[list]:
        """
        Generate quiz questions from transcript and optional slides
        
        Args:
            transcript: Transcribed lecture text
            slides_content: Optional extracted PDF/slides text
            num_questions: Number of quiz questions to generate
        
        Returns:
            List of quiz question dictionaries or None if failed
        """
        if not GEMINI_API_KEY:
            print("GEMINI_API_KEY not set. Cannot generate quiz.")
            return None
        
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            
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
{transcript[:3000]}

{"Slides:" + slides_content[:1000] if slides_content else ""}"""
            
            print(f"Generating {num_questions} quiz questions with Gemini...")
            response = model.generate_content(prompt)
            
            # Parse JSON response
            response_text = (response.text or "").strip()
            if not response_text:
                print("Empty response from Gemini")
                return None
            
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.split("```")[0]
                response_text = response_text.strip()
            
            # Find JSON array boundaries
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']')
            
            if start_idx == -1 or end_idx == -1 or start_idx >= end_idx:
                print(f"No valid JSON array found in response: {response_text[:200]}")
                return None
            
            response_text = response_text[start_idx:end_idx + 1]
            
            # Parse JSON
            quiz_questions = json.loads(response_text)
            
            # Validate structure
            if not isinstance(quiz_questions, list):
                print("Response is not a list")
                return None
            
            print(f"✅ Generated {len(quiz_questions)} quiz questions")
            return quiz_questions
        
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing quiz JSON: {str(e)}")
            print(f"   Response preview: {response_text[:300] if 'response_text' in locals() else 'N/A'}")
            return None
        except Exception as e:
            print(f"❌ Error generating quiz: {str(e)}")
            import traceback
            traceback.print_exc()
            return None


class LectureProcessor:
    """Main orchestrator for processing lectures"""
    
    @staticmethod
    def process_lecture(
        video_path: str,
        slides_path: Optional[str] = None,
        lecture_dir: Path = None
    ) -> dict:
        """
        Complete pipeline: extract audio → transcribe → generate content
        
        Args:
            video_path: Path to video file
            slides_path: Optional path to PDF/slides
            lecture_dir: Directory to store processing files
        
        Returns:
            Dictionary with transcript, notes, flashcards, and quiz
        """
        result = {
            "transcript": "",
            "slides_content": "",
            "notes": "",
            "flashcards": [],
            "quiz": [],
            "status": "processing",
            "error": None
        }
        
        try:
            # Step 1: Extract audio from video
            print("\n=== Step 1: Extracting audio from video ===")
            audio_path = str(lecture_dir / "audio.wav") if lecture_dir else "temp_audio.wav"
            
            if not AudioProcessor.extract_audio_from_video(video_path, audio_path):
                result["status"] = "audio_extraction_failed"
                return result
            
            # Step 2: Transcribe audio
            print("\n=== Step 2: Transcribing audio ===")
            transcript = TranscriptionService.transcribe_audio(audio_path, model_size="base")
            
            if not transcript:
                result["status"] = "transcription_failed"
                return result
            
            result["transcript"] = transcript
            
            # Step 3: Extract text from slides/PDF if provided
            slides_content = None
            if slides_path and os.path.exists(slides_path):
                print("\n=== Step 3: Extracting slides content ===")
                slides_content = PDFProcessor.extract_text_from_pdf(slides_path)
                result["slides_content"] = slides_content
            
            # Step 4: Generate content using Gemini
            if not GEMINI_API_KEY:
                result["status"] = "gemini_api_key_missing"
                print("Warning: GEMINI_API_KEY not set. Skipping content generation.")
                return result
            
            print("\n=== Step 4: Generating content with Gemini ===")
            
            # Generate notes
            print("\nGenerating study notes...")
            notes = GeminiService.generate_notes(transcript, slides_content)
            result["notes"] = notes
            
            # Generate flashcards
            print("\nGenerating flashcards...")
            flashcards = GeminiService.generate_flashcards(transcript, slides_content, num_cards=10)
            result["flashcards"] = flashcards
            
            # Generate quiz
            print("\nGenerating quiz questions...")
            quiz = GeminiService.generate_quiz(transcript, slides_content, num_questions=10)
            result["quiz"] = quiz
            
            missing_outputs = []
            if not notes:
                missing_outputs.append("notes")
            if not flashcards:
                missing_outputs.append("flashcards")
            if not quiz:
                missing_outputs.append("quiz")

            if missing_outputs:
                result["status"] = "generation_failed"
                result["error"] = f"Missing outputs: {', '.join(missing_outputs)}"
            else:
                result["status"] = "completed"
            
        except Exception as e:
            print(f"Error in lecture processing: {str(e)}")
            result["status"] = f"error: {str(e)}"
        
        return result
