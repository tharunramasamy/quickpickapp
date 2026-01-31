import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

DATABASE_CONFIG = {
    "server": os.getenv("DB_SERVER"),
    "database": os.getenv("DB_NAME"),
    "uid": os.getenv("DB_USER"),
    "pwd": os.getenv("DB_PASSWORD"),
}

def get_db_connection():
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={DATABASE_CONFIG['server']};"
        f"DATABASE={DATABASE_CONFIG['database']};"
        f"UID={DATABASE_CONFIG['uid']};"
        f"PWD={DATABASE_CONFIG['pwd']}"
    )
    return pyodbc.connect(conn_str)

def diagnose():
    print("Connecting...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        print("\n--- Constraints on dbo.customers ---")
        cur.execute("""
            SELECT name, type_desc 
            FROM sys.key_constraints 
            WHERE parent_object_id = OBJECT_ID('dbo.customers')
        """)
        for row in cur.fetchall():
            print(f"Constraint: {row[0]} ({row[1]})")
            
        print("\n--- Indexes on dbo.customers ---")
        cur.execute("""
            SELECT name, type_desc, is_unique, has_filter 
            FROM sys.indexes 
            WHERE object_id = OBJECT_ID('dbo.customers')
        """)
        for row in cur.fetchall():
            print(f"Index: {row[0]} (Unique: {row[2]}, Filtered: {row[3]})")
            
        print("\n--- Columns in dbo.customers ---")
        cur.execute("""
            SELECT c.name, t.name, c.is_nullable
            FROM sys.columns c
            JOIN sys.types t ON c.user_type_id = t.user_type_id
            WHERE c.object_id = OBJECT_ID('dbo.customers')
        """)
        for row in cur.fetchall():
            print(f"Column: {row[0]} ({row[1]}), Nullable: {row[2]}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    diagnose()
