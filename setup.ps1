# Smart Dead Stock Management Platform - Setup Script for Windows
# This script helps set up the project without Docker

Write-Host "🚀 Smart Dead Stock Management Platform Setup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Python is installed
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+ from python.org" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is accessible
Write-Host "`n🗄️  Checking Database..." -ForegroundColor Yellow
try {
    $pgResult = psql --version 2>&1
    Write-Host "✅ PostgreSQL found: $pgResult" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found in PATH. Please ensure PostgreSQL is installed." -ForegroundColor Yellow
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
}

# Setup Backend
Write-Host "`n🔧 Setting up Backend..." -ForegroundColor Yellow
Set-Location "backend"

Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
DATABASE_URL=postgresql+asyncpg://user:password@localhost/deadstock_db
OPENAI_API_KEY=your-openai-api-key-here
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "⚠️  Please edit .env file and add your OpenAI API key!" -ForegroundColor Yellow
}

Set-Location ".."

# Setup Frontend
Write-Host "`n🎨 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "frontend"

# Create .env.local file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating frontend environment file..." -ForegroundColor Cyan
    @"
NEXT_PUBLIC_API_URL=http://localhost:8000
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
}

Set-Location ".."

Write-Host "`n📋 Next Steps:" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
Write-Host "1. Create PostgreSQL database:" -ForegroundColor Cyan
Write-Host "   createdb -U postgres deadstock_db" -ForegroundColor White
Write-Host "   OR use pgAdmin to create database 'deadstock_db'" -ForegroundColor White

Write-Host "`n2. Create database user:" -ForegroundColor Cyan
Write-Host "   psql -U postgres -c `"CREATE USER \`"user\`" WITH PASSWORD 'password';`"" -ForegroundColor White
Write-Host "   psql -U postgres -c `"GRANT ALL PRIVILEGES ON DATABASE deadstock_db TO \`"user\`";`"" -ForegroundColor White

Write-Host "`n3. Create database schema:" -ForegroundColor Cyan
Write-Host "   psql -U user -d deadstock_db -f backend/schema.sql" -ForegroundColor White

Write-Host "`n4. Generate mock data:" -ForegroundColor Cyan
Write-Host "   cd backend && python generate_mock_data.py" -ForegroundColor White

Write-Host "`n5. Start the backend server:" -ForegroundColor Cyan
Write-Host "   cd backend && uvicorn main:app --reload" -ForegroundColor White

Write-Host "`n6. Start the frontend server (in another terminal):" -ForegroundColor Cyan
Write-Host "   cd frontend && npm run dev" -ForegroundColor White

Write-Host "`n7. Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000/docs" -ForegroundColor White

Write-Host "`n🎉 Setup complete! Follow the steps above to start the application." -ForegroundColor Green
