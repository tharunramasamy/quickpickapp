import os
import pyodbc
from dotenv import load_dotenv

# Load env variables
load_dotenv()

server = os.getenv("DB_SERVER")
database = os.getenv("DB_NAME")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")

print(f"Connecting to Database: {database} on {server}...")

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
    
    table_name = 'customers'
    
    # 1. Check if table exists
    cursor.execute(f"SELECT count(*) FROM information_schema.tables WHERE table_name = '{table_name}'")
    if cursor.fetchone()[0] == 0:
        print(f"ERROR: Table '{table_name}' does not exist!")
    else:
        print(f"Table '{table_name}' exists.")
        
        # 2. List columns
        print(f"Columns in '{table_name}' table:")
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'")
        columns = [row[0] for row in cursor.fetchall()]
        print(columns)
        
        required_cols = ['referral_code', 'loyalty_points', 'total_orders']
        missing = [col for col in required_cols if col not in columns]
        
        if not missing:
            print("SUCCESS: All required customer columns found!")
        else:
            print(f"FAILURE: Missing columns: {missing}")

    conn.close()

except Exception as e:
    print(f"Connection Error: {e}")
