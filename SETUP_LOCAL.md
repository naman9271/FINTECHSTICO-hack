# Local Development Setup Instructions

Since Docker is not available, here's how to set up the project manually:

## Prerequisites Installation

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Default port: 5432
   - Create database: `deadstock_db`
   - User: `user`, Password: `password`

2. **Install Python 3.11+** (if not already installed):
   - Download from: https://www.python.org/downloads/
   - Make sure to add Python to PATH

3. **Install Node.js 18+** (already done):
   - Node.js is already available

## Database Setup

1. Create the database:
```sql
-- Connect to PostgreSQL as admin and run:
CREATE USER "user" WITH PASSWORD 'password';
CREATE DATABASE deadstock_db OWNER "user";
GRANT ALL PRIVILEGES ON DATABASE deadstock_db TO "user";
```

2. Create tables by running the schema:
```bash
psql -U user -d deadstock_db -f backend/schema.sql
```

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables (create a .env file):
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/deadstock_db
OPENAI_API_KEY=your-openai-api-key-here
```

4. Generate mock data:
```bash
python generate_mock_data.py
```

5. Start the backend server:
```bash
uvicorn main:app --reload
```

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create environment file (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Start the frontend development server:
```bash
npm run dev
```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing API Endpoints

You can test the backend directly:

1. Health check: http://localhost:8000/api/health
2. Dead stock data: http://localhost:8000/api/deadstock?days_since_last_sale=90&min_quantity=1
3. API documentation: http://localhost:8000/docs
