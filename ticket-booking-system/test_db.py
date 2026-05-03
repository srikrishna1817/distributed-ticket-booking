import database as db

# Test 1: Connection
try:
    conn = db.get_db_connection()
    print("✅ Database connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit()

# Test 2: Get matches
try:
    matches = db.get_all_matches()
    print(f"✅ Found {len(matches)} match(es):")
    for match in matches:
        print(f"   - {match['match_name']} at {match['venue']} ({match['match_date']})")
except Exception as e:
    print(f"❌ Failed to get matches: {e}")

# Test 3: Get seats
try:
    seats = db.get_available_seats(1)
    available = [s for s in seats if not s['is_booked']]
    booked = [s for s in seats if s['is_booked']]
    print(f"✅ Found {len(seats)} total seats:")
    print(f"   - Available: {len(available)}")
    print(f"   - Booked: {len(booked)}")
except Exception as e:
    print(f"❌ Failed to get seats: {e}")

# Test 4: Book a seat (transaction test)
try:
    result = db.book_seat_with_transaction(
        seat_id=1,
        user_name="Test User",
        email="test@example.com",
        match_id=1
    )
    if result['success']:
        print(f"✅ Booking successful! Booking ID: {result['booking_id']}")
    else:
        print(f"⚠️  Booking result: {result['message']}")
except Exception as e:
    print(f"❌ Booking failed: {e}")