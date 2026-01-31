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

def check_data():
    conn = get_db_connection()
    cur = conn.cursor()
    
    print("--- USERS ---")
    cur.execute("SELECT user_id, phone, email, role FROM users")
    for row in cur.fetchall():
        print(row)

    print("\n--- LOCATIONS ---")
    try:
        cur.execute("SELECT location_id, city_id, address FROM inventory_locations")
        for row in cur.fetchall():
            print(row)
    except Exception as e:
        print(f"Error reading locations: {e}")

    conn.close()

if __name__ == "__main__":
    check_data()
