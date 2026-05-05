import pymysql
import sys

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'mysqlpw',
    'database': 'ticket_booking',
    'port': 3307,
}

try:
    print("Connecting to database...")
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    print("Creating users table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id       INT AUTO_INCREMENT PRIMARY KEY,
        full_name     VARCHAR(255) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Users table created successfully!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
