import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

# Load .env file for local development (no-op in production if not present)
load_dotenv()

# Database configuration — reads from environment variables with local fallbacks
DB_CONFIG = {
    'host':     os.environ.get('DB_HOST',     'localhost'),
    'port':     int(os.environ.get('DB_PORT', 5432)),
    'user':     os.environ.get('DB_USER',     'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'mysqlpw'),
    'dbname':   os.environ.get('DB_NAME',     'ticket_booking'),
}

def get_db_connection():
    """Create and return a psycopg2 database connection."""
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

# ─── Existing Functions ───────────────────────────────────────────────────────

def get_all_matches():
    """Fetch all matches."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM matches")
    matches = cursor.fetchall()
    cursor.close()
    conn.close()
    return matches

def get_available_seats(match_id):
    """Fetch all seats for a match with booking status."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
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
    Book a single seat using database transaction with row-level locking.
    Prevents double booking.
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # psycopg2 starts a transaction automatically (autocommit=False by default)

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

        # Use RETURNING to get the new booking_id (psycopg2 has no lastrowid)
        cursor.execute("""
            INSERT INTO bookings (user_name, email, seat_id, match_id, status)
            VALUES (%s, %s, %s, %s, 'confirmed')
            RETURNING booking_id
        """, (user_name, email, seat_id, match_id))

        booking_id = cursor.fetchone()['booking_id']

        cursor.execute("""
            UPDATE seats 
            SET is_booked = TRUE, booking_id = %s 
            WHERE seat_id = %s
        """, (booking_id, seat_id))

        conn.commit()

        return {
            'success': True,
            'message': 'Booking successful',
            'booking_id': booking_id
        }

    except Exception as e:
        conn.rollback()
        return {'success': False, 'message': f'Error: {str(e)}'}

    finally:
        cursor.close()
        conn.close()

# ─── Upgrade 1: Auth Functions ────────────────────────────────────────────────

def register_user(full_name, email, password):
    """Register a new user. Returns error if email already exists."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Check if email already registered
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        existing = cursor.fetchone()
        if existing:
            conn.rollback()
            return {
                'success': False,
                'code': 'EMAIL_EXISTS',
                'message': 'An account with this email already exists'
            }

        # Hash password and insert user; RETURNING gives us the new user_id
        password_hash = generate_password_hash(password)
        cursor.execute("""
            INSERT INTO users (full_name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING user_id
        """, (full_name, email, password_hash))
        conn.commit()

        user_id = cursor.fetchone()['user_id']
        return {
            'success': True,
            'message': 'Account created successfully',
            'user': {
                'user_id': user_id,
                'full_name': full_name,
                'email': email
            }
        }

    except Exception as e:
        conn.rollback()
        return {'success': False, 'message': f'Error: {str(e)}'}

    finally:
        cursor.close()
        conn.close()

def login_user(email, password):
    """Verify credentials and return user info."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cursor.execute("""
            SELECT user_id, full_name, email, password_hash 
            FROM users 
            WHERE email = %s
        """, (email,))
        user = cursor.fetchone()

        if not user:
            return {
                'success': False,
                'code': 'USER_NOT_FOUND',
                'message': 'No account found with this email'
            }

        if not check_password_hash(user['password_hash'], password):
            return {
                'success': False,
                'code': 'WRONG_PASSWORD',
                'message': 'Incorrect password'
            }

        return {
            'success': True,
            'message': 'Login successful',
            'user': {
                'user_id': user['user_id'],
                'full_name': user['full_name'],
                'email': user['email']
            }
        }

    except Exception as e:
        return {'success': False, 'message': f'Error: {str(e)}'}

    finally:
        cursor.close()
        conn.close()

# ─── Upgrade 2: Multi-Seat Booking ───────────────────────────────────────────

def book_multiple_seats_with_transaction(seat_ids, match_id, user_id):
    """
    Book multiple seats atomically in a single transaction.
    If ANY seat is already booked, the entire transaction rolls back.
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Get user info for booking records
        cursor.execute("SELECT full_name, email FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            conn.rollback()
            return {'success': False, 'message': 'User not found'}

        # Lock ALL requested seats simultaneously with FOR UPDATE
        placeholders = ', '.join(['%s'] * len(seat_ids))
        cursor.execute(f"""
            SELECT seat_id, seat_number, is_booked 
            FROM seats 
            WHERE seat_id IN ({placeholders}) AND match_id = %s
            FOR UPDATE
        """, (*seat_ids, match_id))

        locked_seats = cursor.fetchall()

        # Validate all seats exist
        if len(locked_seats) != len(seat_ids):
            found_ids = {s['seat_id'] for s in locked_seats}
            missing = [sid for sid in seat_ids if sid not in found_ids]
            conn.rollback()
            return {
                'success': False,
                'message': f'Seats not found for this match: {missing}'
            }

        # Check if any seat is already booked
        already_booked = [s['seat_number'] for s in locked_seats if s['is_booked']]
        if already_booked:
            conn.rollback()
            return {
                'success': False,
                'message': f'Seats already booked: {", ".join(already_booked)}',
                'failed_seats': already_booked
            }

        # Book all seats; use RETURNING to retrieve each new booking_id
        booking_ids = []
        for seat in locked_seats:
            cursor.execute("""
                INSERT INTO bookings (user_name, email, seat_id, match_id, status)
                VALUES (%s, %s, %s, %s, 'confirmed')
                RETURNING booking_id
            """, (user['full_name'], user['email'], seat['seat_id'], match_id))

            booking_id = cursor.fetchone()['booking_id']
            booking_ids.append(booking_id)

            cursor.execute("""
                UPDATE seats 
                SET is_booked = TRUE, booking_id = %s 
                WHERE seat_id = %s
            """, (booking_id, seat['seat_id']))

        conn.commit()

        booked_seat_numbers = [s['seat_number'] for s in locked_seats]
        return {
            'success': True,
            'message': f'Successfully booked {len(seat_ids)} seat(s)',
            'booking_ids': booking_ids,
            'booked_seats': booked_seat_numbers
        }

    except Exception as e:
        conn.rollback()
        return {'success': False, 'message': f'Error: {str(e)}'}

    finally:
        cursor.close()
        conn.close()

# ─── Upgrade 3: User Profile & Bookings ──────────────────────────────────────

def get_user_bookings(email):
    """Fetch all bookings for a specific user email, joined with match details."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        query = """
            SELECT 
                b.booking_id, b.status, b.booking_time, 
                s.seat_number, 
                m.match_name, m.match_date, m.venue
            FROM bookings b
            JOIN seats s ON b.seat_id = s.seat_id
            JOIN matches m ON b.match_id = m.match_id
            WHERE b.email = %s
            ORDER BY b.booking_time DESC
        """
        cursor.execute(query, (email,))
        bookings = cursor.fetchall()

        # Convert datetime objects to string for JSON serialization
        for booking in bookings:
            if booking['booking_time']:
                booking['booking_time'] = booking['booking_time'].strftime("%Y-%m-%d %H:%M:%S")

        return {'success': True, 'bookings': bookings}

    except Exception as e:
        return {'success': False, 'message': f'Error: {str(e)}'}

    finally:
        cursor.close()
        conn.close()