import pyodbc
from contextlib import contextmanager
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.connection_string = (
            f"Driver={{{settings.db_driver}}};"
            f"Server={settings.db_server};"
            f"Database={settings.db_name};"
            f"UID={settings.db_user};"
            f"PWD={settings.db_password};"
            f"Port={settings.db_port};"
            f"Encrypt=yes;"
            f"TrustServerCertificate=no;"
            f"Connection Timeout=30;"
        )
    
    @contextmanager
    def get_connection(self):
        """Get database connection"""
        conn = None
        try:
            conn = pyodbc.connect(self.connection_string)
            yield conn
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {str(e)}")
            raise
        finally:
            if conn:
                conn.close()
    
    @contextmanager
    def get_cursor(self):
        """Get database cursor"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                yield cursor
            finally:
                cursor.close()

# Global database instance
db = Database()

# Test connection
def test_connection():
    try:
        with db.get_cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM cities")
            result = cursor.fetchone()
            logger.info(f"Database connection successful. Cities count: {result}")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False