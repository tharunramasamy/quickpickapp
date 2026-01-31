import os
import pyodbc
from dotenv import load_dotenv

# Load env variables same as main.py
load_dotenv()

server = os.getenv("DB_SERVER")
database = os.getenv("DB_NAME")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")

print(f"Connecting to Server: {server}, Database: {database}, User: {username}")

try:
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password}"
    )
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # 1. Check if table exists
    cursor.execute("SELECT count(*) FROM information_schema.tables WHERE table_name = 'products'")
    if cursor.fetchone()[0] == 0:
        print("ERROR: Table 'products' does not exist!")
    else:
        print("Table 'products' exists.")
        
        # 2. List columns
        print("Columns in 'products' table:")
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'")
        columns = [row[0] for row in cursor.fetchall()]
        print(columns)
        
        if 'is_active' in columns:
            print("SUCCESS: 'is_active' column found!")
        else:
            print("FAILURE: 'is_active' column MISSING!")

    conn.close()

except Exception as e:
    print(f"Connection Error: {e}")
