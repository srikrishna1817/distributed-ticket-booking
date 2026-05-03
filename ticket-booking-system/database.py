import pymysql
from pymysql.cursors import DictCursor

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'mysqlpw',  # CHANGE THIS
    'database': 'ticket_booking',
    'port': 3307,
    'cursorclass': DictCursor
}

def get_db_connection():
    """Create and return database connection"""
    return pymysql.connect(**DB_CONFIG)

def get_all_matches():
    """Fetch all matches"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM matches")
    matches = cursor.fetchall()
    cursor.close()
    conn.close()
    return matches

def get_available_seats(match_id):
    """Fetch available seats for a match"""
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        SELECT seat_id, seat_number, is_booked 
        FROM seats 
        WHERE match_id = %s
        ORDER BY seat_number
    """
    cursor.execute(query, (match_id,))
    seats = cursor.fetchall()
    cursor.close()
    conn.close()
    return seats

def book_seat_with_transaction(seat_id, user_name, email, match_id):
    """
    Book a seat using database transaction with row-level locking
    This prevents double booking
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Start transaction
        conn.begin()
        
        # Lock the seat row and check if available
        # FOR UPDATE locks the row until transaction completes
        cursor.execute("""
            SELECT seat_id, is_booked 
            FROM seats 
            WHERE seat_id = %s 
            FOR UPDATE
        """, (seat_id,))
        
        seat = cursor.fetchone()
        
        if not seat:
            conn.rollback()
            return {'success': False, 'message': 'Seat not found'}
        
        if seat['is_booked']:
            conn.rollback()
            return {'success': False, 'message': 'Seat already booked'}
        
        # Insert booking record
        cursor.execute("""
            INSERT INTO bookings (user_name, email, seat_id, match_id, status)
            VALUES (%s, %s, %s, %s, 'confirmed')
        """, (user_name, email, seat_id, match_id))
        
        booking_id = cursor.lastrowid
        
        # Update seat as booked
        cursor.execute("""
            UPDATE seats 
            SET is_booked = TRUE, booking_id = %s 
            WHERE seat_id = %s
        """, (booking_id, seat_id))
        
        # Commit transaction
        conn.commit()
        
        return {
            'success': True, 
            'message': 'Booking successful',
            'booking_id': booking_id
        }
        
    except Exception as e:
        # Rollback on any error
        conn.rollback()
        return {'success': False, 'message': f'Error: {str(e)}'}
    
    finally:
        cursor.close()
        conn.close()