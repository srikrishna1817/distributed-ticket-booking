"""
One-time setup script: runs setup_db_postgres.sql against the Render PostgreSQL
database and then prints row counts to verify everything is in place.
"""

import psycopg
import os

RENDER_DSN = (
    "host=dpg-d7u1c9ppo60c73e0ntr0-a.oregon-postgres.render.com "
    "port=5432 "
    "dbname=ticket_booking_db_p5b9 "
    "user=ticket_booking_db_p5b9_user "
    "password=tXAYRJIC5FITRGEebtFXimIfrlLGWi1Q "
    "sslmode=require"
)

SQL_FILE = os.path.join(os.path.dirname(__file__), "setup_db_postgres.sql")


def run_setup():
    print("=== Connecting to Render PostgreSQL ===")
    # autocommit=True needed so DDL statements (CREATE TABLE, DROP TABLE) run immediately
    conn = psycopg.connect(RENDER_DSN, autocommit=True)
    cursor = conn.cursor()

    print(f"Reading {SQL_FILE} ...")
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql = f.read()

    print("Running schema + seed SQL ...")
    cursor.execute(sql)
    print("SQL executed successfully.\n")

    # ── Verify row counts ─────────────────────────────────────────────────────
    print("=== Table verification ===")
    tables = ["users", "matches", "seats", "bookings"]
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  {table:<12}: {count} rows")

    # Show match names
    print("\n=== Sample match data ===")
    cursor.execute("SELECT match_id, match_name, match_date FROM matches ORDER BY match_id")
    for row in cursor.fetchall():
        print(f"  [{row[0]}] {row[1]}  |  {row[2]}")

    cursor.close()
    conn.close()
    print("\n[OK] Render database is fully set up and verified.")


if __name__ == "__main__":
    run_setup()
