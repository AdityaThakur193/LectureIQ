interface ValidationError {
  message: string;
}

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

export function validateUploadForm(
  title: string,
  video: File | null,
  slides?: File
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate title
  if (!title || title.trim().length === 0) {
    errors.push({ message: "Please enter a lecture title" });
  }

  if (title && title.length > 200) {
    errors.push({ message: "Lecture title must be 200 characters or less" });
  }

  // Validate video
  if (!video) {
    errors.push({ message: "Please upload a video file" });
    return errors; // Return early if no video
  }

  // Check video file type
  if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
    errors.push({
      message: "Video must be in MP4, MOV, AVI, or WebM format",
    });
  }

  // Check video file size
  if (video.size > MAX_VIDEO_SIZE) {
    errors.push({
      message: "Video file is too large. Maximum size is 500MB",
    });
  }

  // Validate slides if provided
  if (slides) {
    if (slides.type !== "application/pdf") {
      errors.push({ message: "Slides must be a PDF file" });
    }

    if (slides.size > MAX_PDF_SIZE) {
      errors.push({
        message: "PDF file is too large. Maximum size is 100MB",
      });
    }
  }

  return errors;
}
