import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

server = os.getenv("DB_SERVER")
database = os.getenv("DB_NAME")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")

conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

print("--- LOCATIONS ---")
cursor.execute("SELECT location_id, city_id, address FROM inventory_locations")
for row in cursor.fetchall():
    print(row)

print("\n--- STOCK (First 5) ---")
cursor.execute("""
    SELECT TOP 5 s.product_id, s.location_id, s.quantity_available, p.product_name 
    FROM inventory_stock s
    JOIN products p ON s.product_id = p.product_id
""")
for row in cursor.fetchall():
    print(row)

conn.close()
