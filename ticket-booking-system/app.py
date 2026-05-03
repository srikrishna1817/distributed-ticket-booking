from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import database as db
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Route: Home page
@app.route('/')
def index():
    return render_template('index.html')

# Route: Health check (for load balancer)
@app.route('/health')
def health():
    port = os.environ.get('PORT', '5000')
    return jsonify({'status': 'healthy', 'instance': f'Flask-{port}', 'port': port}), 200

# Route: Instance info (to verify load balancing is working)
@app.route('/instance')
def instance_info():
    port = os.environ.get('PORT', '5000')
    return jsonify({
        'instance': f'Flask-Instance-{port}',
        'port': port,
        'pid': os.getpid(),
        'message': f'Request handled by Flask instance on port {port}'
    }), 200

# API Route: Get all matches
@app.route('/api/matches', methods=['GET'])
def get_matches():
    try:
        matches = db.get_all_matches()
        return jsonify({'success': True, 'matches': matches}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# API Route: Get available seats for a match
@app.route('/api/seats/<int:match_id>', methods=['GET'])
def get_seats(match_id):
    try:
        seats = db.get_available_seats(match_id)
        return jsonify({'success': True, 'seats': seats}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# API Route: Book a seat
@app.route('/api/book', methods=['POST'])
def book_seat():
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['seat_id', 'user_name', 'email', 'match_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False, 
                    'message': f'Missing field: {field}'
                }), 400
        
        # Book seat with transaction
        result = db.book_seat_with_transaction(
            seat_id=data['seat_id'],
            user_name=data['user_name'],
            email=data['email'],
            match_id=data['match_id']
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 409  # 409 Conflict
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    # Port is configurable via PORT env variable (default: 5000)
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting Flask instance on port {port} (PID: {os.getpid()})")
    app.run(host='0.0.0.0', port=port, debug=False)