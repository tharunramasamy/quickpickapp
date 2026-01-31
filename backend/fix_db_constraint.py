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
    # Use the same connection string format as main.py
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={DATABASE_CONFIG['server']};"
        f"DATABASE={DATABASE_CONFIG['database']};"
        f"UID={DATABASE_CONFIG['uid']};"
        f"PWD={DATABASE_CONFIG['pwd']}"
    )
    return pyodbc.connect(conn_str)

def fix_constraint():
    print("Connecting to database...")
    try:
        conn = get_db_connection()
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    cur = conn.cursor()
    
    try:
        # 1. Find the constraint name
        print("Finding constraint name...")
        # Note: Using schema name 'dbo' is safer
        cur.execute("""
            SELECT name
            FROM sys.key_constraints 
            WHERE parent_object_id = OBJECT_ID('dbo.customers') 
            AND type = 'UQ'
            AND EXISTS (
                SELECT 1 
                FROM sys.index_columns ic 
                WHERE ic.object_id = sys.key_constraints.parent_object_id 
                AND ic.index_id = sys.key_constraints.unique_index_id 
                AND ic.column_id = COL_LENGTH('dbo.customers', 'referral_code')
            );
        """)
        row = cur.fetchone()
        
        if row:
            constraint_name = row[0]
            print(f"Found constraint: {constraint_name}. Dropping it...")
            cur.execute(f"ALTER TABLE customers DROP CONSTRAINT {constraint_name}")
            print("Constraint dropped.")
        else:
            print("No UNIQUE constraint found on referral_code (maybe already dropped or named differently). Checking for index...")

        # 2. Check if the filtered index exists, if not create it
        print("Checking/Creating filtered index...")
        # Check if the index already exists
        cur.execute("SELECT name FROM sys.indexes WHERE name = 'UQ_customers_referral_code' AND object_id = OBJECT_ID('dbo.customers')")
        if cur.fetchone():
             print('Filtered index UQ_customers_referral_code already exists')
        else:
             print('Creating filtered unique index UQ_customers_referral_code...')
             cur.execute("CREATE UNIQUE INDEX UQ_customers_referral_code ON dbo.customers(referral_code) WHERE referral_code IS NOT NULL")
             print('Created filtered unique index UQ_customers_referral_code')
        
        conn.commit()
        print("Success! Referral code constraint fixed.")

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    fix_constraint()
