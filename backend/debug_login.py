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
    
    phone = '9999999992' # The one from the screenshot
    print(f"Checking user with phone: {phone}")
    
    cursor.execute("SELECT user_id, email, phone, password_hash, role FROM users WHERE phone = ?", (phone,))
    row = cursor.fetchone()
    
    if row:
        print(f"User Found: ID={row[0]}, Role={row[4]}")
        print(f"Stored Hash: '{row[3]}'")
        
        # Test comparison logic from main.py
        # main.py does: if user.password == hashlib.sha256(request.password.encode()).hexdigest():
        # But wait, my schema inserted 'hashed_password' as literal text?
        # Let's check what the schema inserted.
    else:
        print("User NOT found")

    conn.close()

except Exception as e:
    print(f"Connection Error: {e}")
