import pyodbc
import os
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
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        print("--- TABLE INFO: inventory_locations ---")
        # Get columns
        cur.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'inventory_locations'")
        for row in cur.fetchall():
            print(f"Column: {row[0]}, Type: {row[1]}")

        print("\n--- CONSTRAINTS ---")
        # Get FKs
        sql = """
        SELECT 
            KCU1.CONSTRAINT_NAME AS FK_Constraint_Name, 
            KCU1.TABLE_NAME AS FK_Table_Name, 
            KCU1.COLUMN_NAME AS FK_Column_Name, 
            KCU2.TABLE_NAME AS Referenced_Table_Name, 
            KCU2.COLUMN_NAME AS Referenced_Column_Name 
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS RC 
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU1 
            ON KCU1.CONSTRAINT_CATALOG = RC.CONSTRAINT_CATALOG  
            AND KCU1.CONSTRAINT_SCHEMA = RC.CONSTRAINT_SCHEMA 
            AND KCU1.CONSTRAINT_NAME = RC.CONSTRAINT_NAME 
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU2 
            ON KCU2.CONSTRAINT_CATALOG = RC.UNIQUE_CONSTRAINT_CATALOG  
            AND KCU2.CONSTRAINT_SCHEMA = RC.UNIQUE_CONSTRAINT_SCHEMA 
            AND KCU2.CONSTRAINT_NAME = RC.UNIQUE_CONSTRAINT_NAME 
            AND KCU2.ORDINAL_POSITION = KCU1.ORDINAL_POSITION 
        WHERE KCU1.TABLE_NAME = 'inventory_locations'
        """
        cur.execute(sql)
        fks = cur.fetchall()
        if not fks:
            print("No Foreign Keys found.")
        for row in fks:
            print(f"FK: {row[0]} on {row[2]} -> {row[3]}({row[4]})")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    diagnose()
