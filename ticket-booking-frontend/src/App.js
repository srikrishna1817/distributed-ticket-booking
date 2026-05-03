import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MatchList from './components/MatchList';
import SeatGrid from './components/SeatGrid';
import BookingForm from './components/BookingForm';

const API_URL = 'http://localhost:80/api';

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load matches on component mount
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/matches`);
      setMatches(response.data.matches);
    } catch (error) {
      showMessage('Error loading matches: ' + error.message, 'danger');
    }
  };

 const loadSeats = async (matchId) => {
    try {
      const response = await axios.get(`${API_URL}/seats/${matchId}`);
      console.log('Loaded seats from API:', response.data.seats);  // ADD THIS
      setSeats(response.data.seats);
    } catch (error) {
      showMessage('Error loading seats: ' + error.message, 'danger');
    }
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setSelectedSeat(null);
    loadSeats(match.match_id);
  };

  const handleSeatSelect = (seat) => {
    if (!seat.is_booked) {
      setSelectedSeat(seat);
    }
  };

  const handleBooking = async (userName, userEmail) => {
    if (!selectedSeat || !selectedMatch) {
      showMessage('Please select a seat', 'warning');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/book`, {
        seat_id: selectedSeat.seat_id,
        user_name: userName,
        email: userEmail,
        match_id: selectedMatch.match_id
      });

      if (response.data.success) {
        showMessage(
          `✅ ${response.data.message}! Booking ID: ${response.data.booking_id}`,
          'success'
        );
        // Reload seats
        loadSeats(selectedMatch.match_id);
        setSelectedSeat(null);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        showMessage(`❌ ${error.response.data.message}`, 'danger');
      } else {
        showMessage('Error booking ticket: ' + error.message, 'danger');
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  return (
    <div className="App">
      <div className="container mt-5">
        <h1 className="text-center mb-4">🏏 Ticket Booking System</h1>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`}>
            {message.text}
            <button
              type="button"
              className="btn-close"
              onClick={() => setMessage({ text: '', type: '' })}
            ></button>
          </div>
        )}

        {/* Match Selection */}
        <MatchList
          matches={matches}
          selectedMatch={selectedMatch}
          onSelectMatch={handleMatchSelect}
        />

        {/* Seat Grid */}
        {selectedMatch && (
          <SeatGrid
            seats={seats}
            selectedSeat={selectedSeat}
            onSelectSeat={handleSeatSelect}
          />
        )}

        {/* Booking Form */}
        {selectedSeat && (
          <BookingForm
            selectedSeat={selectedSeat}
            onBook={handleBooking}
            onCancel={() => setSelectedSeat(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;