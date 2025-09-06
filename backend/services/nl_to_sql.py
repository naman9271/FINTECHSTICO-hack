import os
from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
try:
    from sql_metadata.parser import Parser
except ImportError:
    # Fallback if sql_metadata is not available
    Parser = None

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_db_schema():
    # In a real app, this would dynamically fetch the schema.
    # For a hackathon, hardcoding it is faster and reliable.
    return """
    -- Table: products
    CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        purchase_price NUMERIC(10, 2) NOT NULL,
        selling_price NUMERIC(10, 2) NOT NULL
    );

    -- Table: inventory_levels
    CREATE TABLE inventory_levels (
        inventory_id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(product_id),
        quantity INTEGER NOT NULL,
        location VARCHAR(100)
    );

    -- Table: sales_orders
    CREATE TABLE sales_orders (
        order_id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(product_id),
        quantity_sold INTEGER NOT NULL,
        order_date TIMESTAMP WITH TIME ZONE NOT NULL
    );
    """

def construct_nl_to_sql_prompt(question: str) -> str:
    schema = get_db_schema()

    prompt = f"""
    You are an expert PostgreSQL data analyst. Your task is to convert a natural language question into a syntactically correct PostgreSQL query.
    You must adhere to the following rules:
    1.  **Only use the tables and columns defined in the provided schema.** Do not hallucinate columns or tables.
    2.  **Generate only a single SQL `SELECT` statement.**
    3.  **NEVER generate any `INSERT`, `UPDATE`, `DELETE`, `DROP`, or any other data-modifying statements.**
    4.  The final output should be ONLY the SQL query, with no explanations, comments, or markdown formatting.

    **Database Schema:**
    ```sql
    {schema}
    ```

    **Examples:**

    -- Question: Show me the top 5 most expensive products.
    -- SQL: SELECT product_name, selling_price FROM products ORDER BY selling_price DESC LIMIT 5;

    -- Question: How many toys do we have in stock?
    -- SQL: SELECT SUM(i.quantity) FROM inventory_levels i JOIN products p ON i.product_id = p.product_id WHERE p.category = 'Toys';

    -- Question: Which products had no sales in the last 90 days?
    -- SQL: SELECT p.product_name, p.sku FROM products p WHERE p.product_id NOT IN (SELECT so.product_id FROM sales_orders so WHERE so.order_date >= NOW() - INTERVAL '90 days');

    **New Question:**
    -- Question: {question}
    -- SQL:
    """
    return prompt

def is_safe_sql(sql_query: str) -> bool:
    """
    Validates if the generated SQL query is safe to execute.
    - Allows only SELECT statements.
    - Disallows any DML or DDL statements.
    - Basic check for semicolons to prevent query stacking.
    """
    if ';' in sql_query.strip()[:-1]:  # Allow semicolon at the very end
        return False

    # If sql_metadata is available, use it for parsing
    if Parser:
        try:
            parser = Parser(sql_query)
            # Check if the query is a simple SELECT
            if len(parser.columns) > 0 and not parser.tables:
                 # Simple queries like 'SELECT 1' might not have tables
                 return True
            if not parser.columns or not parser.tables:
                return False  # Not a valid SELECT
            
            # Ensure no other statement types are present
            if any([parser.insert_columns, parser.update_columns, parser.drop_tables]):
                return False
                
        except Exception:
            # If parsing fails, fall through to basic validation
            pass
        
    # Check for forbidden keywords as a fallback
    forbidden_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "TRUNCATE", "EXEC"]
    for keyword in forbidden_keywords:
        if keyword in sql_query.upper():
            return False

    return sql_query.strip().upper().startswith("SELECT")

async def process_nl_query(db: AsyncSession, question: str):
    try:
        # Check if OpenAI client is available
        if not client or not os.getenv("OPENAI_API_KEY"):
            return {
                "sql_query": "",
                "results": [],
                "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
            }
        
        # Step 1: Generate SQL using OpenAI
        prompt = construct_nl_to_sql_prompt(question)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0
        )
        
        sql_query = response.choices[0].message.content.strip()
        
        # Step 2: Validate the SQL
        if not is_safe_sql(sql_query):
            return {
                "sql_query": sql_query,
                "results": [],
                "error": "Generated SQL query failed safety validation"
            }
        
        # Step 3: Execute the validated SQL
        result = await db.execute(text(sql_query))
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        results = []
        if rows:
            columns = result.keys()
            results = [dict(zip(columns, row)) for row in rows]
        
        return {
            "sql_query": sql_query,
            "results": results,
            "error": None
        }
        
    except Exception as e:
        return {
            "sql_query": "",
            "results": [],
            "error": f"Error processing query: {str(e)}"
        }
