from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import database as db
import os

app = Flask(__name__)
app.secret_key = 'ticket_booking_secret_key_2026'
CORS(app, supports_credentials=True, origins=[
    "https://distributed-ticket-booking.vercel.app",
    "https://distributed-ticket-booking-git-main-krishnas-projects-3704f279.vercel.app",
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost",
])

# ─── Existing Routes ──────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    port = os.environ.get('PORT', '5000')
    return jsonify({'status': 'healthy', 'instance': f'Flask-{port}', 'port': port}), 200

@app.route('/instance')
def instance_info():
    port = os.environ.get('PORT', '5000')
    return jsonify({
        'instance': f'Flask-Instance-{port}',
        'port': port,
        'pid': os.getpid(),
        'message': f'Request handled by Flask instance on port {port}'
    }), 200

@app.route('/api/matches', methods=['GET'])
def get_matches():
    try:
        matches = db.get_all_matches()
        return jsonify({'success': True, 'matches': matches}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/seats/<int:match_id>', methods=['GET'])
def get_seats(match_id):
    try:
        seats = db.get_available_seats(match_id)
        return jsonify({'success': True, 'seats': seats}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/book', methods=['POST'])
def book_seat():
    try:
        data = request.get_json()
        required_fields = ['seat_id', 'user_name', 'email', 'match_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing field: {field}'}), 400

        result = db.book_seat_with_transaction(
            seat_id=data['seat_id'],
            user_name=data['user_name'],
            email=data['email'],
            match_id=data['match_id']
        )

        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 409

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ─── Upgrade 1: Authentication Endpoints ──────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        required = ['full_name', 'email', 'password']
        for field in required:
            if not data or field not in data or not str(data[field]).strip():
                return jsonify({'success': False, 'message': f'Missing field: {field}'}), 400

        result = db.register_user(
            full_name=data['full_name'].strip(),
            email=data['email'].strip().lower(),
            password=data['password']
        )

        if result['success']:
            return jsonify(result), 200
        elif result.get('code') == 'EMAIL_EXISTS':
            return jsonify(result), 409
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400

        result = db.login_user(
            email=data['email'].strip().lower(),
            password=data['password']
        )

        if result['success']:
            return jsonify(result), 200
        elif result.get('code') == 'WRONG_PASSWORD':
            return jsonify(result), 401
        else:
            return jsonify(result), 401

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

# ─── Upgrade 2: Multi-Seat Booking Endpoint ───────────────────────────────────

@app.route('/api/book-multiple', methods=['POST'])
def book_multiple_seats():
    try:
        data = request.get_json()
        required = ['seat_ids', 'event_id', 'user_id']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing field: {field}'}), 400

        seat_ids = data['seat_ids']
        if not isinstance(seat_ids, list) or len(seat_ids) == 0:
            return jsonify({'success': False, 'message': 'seat_ids must be a non-empty list'}), 400
        if len(seat_ids) > 6:
            return jsonify({'success': False, 'message': 'Maximum 6 seats per booking'}), 400

        result = db.book_multiple_seats_with_transaction(
            seat_ids=seat_ids,
            match_id=data['event_id'],
            user_id=data['user_id']
        )

        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 409

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/bookings', methods=['POST'])
def get_bookings():
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'success': False, 'message': 'Email required'}), 400

        result = db.get_user_bookings(data['email'])
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting Flask instance on port {port} (PID: {os.getpid()})")
    app.run(host='0.0.0.0', port=port, debug=False)