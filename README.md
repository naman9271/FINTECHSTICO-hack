# Smart Dead Stock Management Platform

A comprehensive AI-powered inventory management and insights platform built for rapid development and deployment.

## 🏗️ Architecture

- **Backend**: FastAPI (Python) with PostgreSQL database
- **Frontend**: Next.js (React) with Material-UI components
- **AI Features**: Natural Language to SQL, Smart Recommendations
- **Deployment**: Docker + Vercel ready

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- OpenAI API key (for NL-to-SQL feature)

### One-Command Setup

1. Clone and navigate to the project:
```bash
git clone <your-repo-url>
cd Fintech
```

2. Set your OpenAI API key in `docker-compose.yml`:
```yaml
OPENAI_API_KEY: "your-actual-api-key-here"
```

3. Start the entire stack:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- Next.js frontend on port 3000

### Initialize Database

4. Once the containers are running, create the database schema:
```bash
docker exec -i deadstock-db psql -U user -d deadstock_db < backend/schema.sql
```

5. Generate synthetic data:
```bash
docker exec -it fastapi-backend python generate_mock_data.py
```

### Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (user/password/deadstock_db)

## 🎯 Features

### 1. Financial Dashboard
- Real-time dead stock analysis
- Financial impact calculations
- Interactive charts and visualizations
- Risk level indicators

### 2. Natural Language to SQL
- Ask questions in plain English
- Automatic SQL generation and validation
- Secure query execution
- Live results display

### 3. Smart Recommendations
- Rule-based expert system
- Product-specific strategies
- Financial impact projections
- Actionable insights

## 🔧 Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Management

View data in the browser:
```bash
docker exec -it fastapi-backend python -c "
import asyncio
from sqlalchemy import text
from core.db import engine

async def show_stats():
    async with engine.connect() as conn:
        result = await conn.execute(text('SELECT COUNT(*) FROM products'))
        print(f'Products: {result.scalar()}')
        result = await conn.execute(text('SELECT COUNT(*) FROM sales_orders'))
        print(f'Orders: {result.scalar()}')

asyncio.run(show_stats())
"
```

## 📊 Sample Queries

Try these natural language queries:

- "Show me the top 10 most expensive products"
- "Which products had no sales in the last 6 months?"
- "How many electronics items do we have in stock?"
- "What is the total value of products in the toys category?"

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your production PostgreSQL URL
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_API_URL`: Your Vercel app URL

4. Deploy automatically on push

### Environment Variables

**Backend (.env)**:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/deadstock_db
OPENAI_API_KEY=your-openai-api-key
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🛡️ Security Features

- SQL injection prevention with parameterized queries
- Query validation and sanitization
- Read-only SQL execution for NL queries
- CORS protection
- Input validation with Pydantic

## 📈 Data Model

### Core Tables
- **users**: User management
- **products**: Product catalog with pricing
- **inventory_levels**: Stock quantities and storage costs
- **sales_orders**: Transaction history

### Key Metrics
- Dead stock identification (configurable thresholds)
- Financial impact calculations
- Storage cost analysis
- Profit loss projections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**:
- Ensure PostgreSQL container is healthy
- Check DATABASE_URL format
- Verify network connectivity

**Frontend Can't Connect to Backend**:
- Confirm NEXT_PUBLIC_API_URL is correct
- Check CORS settings in main.py
- Verify backend is running on port 8000

**NL-to-SQL Not Working**:
- Verify OPENAI_API_KEY is set
- Check API key validity
- Review OpenAI API quotas

### Reset Database
```bash
docker-compose down
docker volume rm fintech_postgres_data
docker-compose up --build
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Open an issue on GitHub
