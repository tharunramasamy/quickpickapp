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

def fix():
    print("Connecting...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # queries to find constraint on referral_code
        query = """
        SELECT 
            kc.name AS ConstraintName,
            c.name AS ColumnName
        FROM sys.key_constraints kc
        JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id 
            AND kc.unique_index_id = ic.index_id
        JOIN sys.columns c ON ic.object_id = c.object_id 
            AND ic.column_id = c.column_id
        WHERE kc.parent_object_id = OBJECT_ID('dbo.customers')
        AND kc.type = 'UQ'
        """
        
        cur.execute(query)
        rows = cur.fetchall()
        
        for row in rows:
            constraint_name = row[0]
            column_name = row[1]
            print(f"Found UNIQUE constraint '{constraint_name}' on column '{column_name}'")
            
            if column_name == 'referral_code':
                print(f"--> This is the BAD constraint. Dropping {constraint_name}...")
                cur.execute(f"ALTER TABLE customers DROP CONSTRAINT {constraint_name}")
                print("--> DATEGRITY RESTORED: Constraint Dropped.")
            elif column_name == 'user_id':
                print("--> This is valid (user_id). Keeping it.")
            else:
                print("--> Unknown column. Keeping it.")

        conn.commit()
        print("Done.")

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix()
