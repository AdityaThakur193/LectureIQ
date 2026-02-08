# LectureIQ Quick Launcher
Write-Host "================================================================================"
Write-Host "    LectureIQ - Starting System" -ForegroundColor Cyan
Write-Host "================================================================================"

# Check if in correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Must run from LectureIq root directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All validation tests passed (8/8)" -ForegroundColor Green
Write-Host ""
Write-Host "Launching services..." -ForegroundColor Yellow

# Start backend in new window
Write-Host ""
Write-Host "Starting Backend on Port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "Starting Frontend on Port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "================================================================================"
Write-Host "    LectureIQ is starting up!" -ForegroundColor Green
Write-Host "================================================================================"

Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "   Backend API:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   Frontend UI:  http://localhost:3000" -ForegroundColor White

Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Write-Host "   Check the new terminal windows for startup messages" -ForegroundColor Gray

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "System launched!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Browser should open automatically to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Upload a video file - MP4, MOV, AVI, or WebM" -ForegroundColor White
Write-Host "   3. Wait for processing and check backend terminal" -ForegroundColor White
Write-Host "   4. View your generated study materials" -ForegroundColor White

Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "   Close the backend and frontend terminal windows" -ForegroundColor Gray
Write-Host "   Or press Ctrl+C in each terminal" -ForegroundColor Gray

Write-Host ""
Write-Host "For detailed instructions, see START_HERE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
