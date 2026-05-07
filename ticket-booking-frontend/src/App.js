import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

import LoginPage    from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MatchList    from './components/MatchList';
import SeatGrid     from './components/SeatGrid';
import BookingForm  from './components/BookingForm';
import MyBookings   from './components/MyBookings';
import { useToast } from './components/Toast';

const API_URL = 'https://ticket-booking-backend-1vuk.onrender.com/api';

function App() {
  // ── Auth state ────────────────────────────────────────────
  const [authView, setAuthView]   = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('book'); // 'book' | 'my-bookings'
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('tb_user')) || null; }
    catch { return null; }
  });

  // ── App state ─────────────────────────────────────────────
  const [matches, setMatches]           = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [seats, setSeats]               = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingSeats, setLoadingSeats]     = useState(false);

  const { addToast, ToastRenderer } = useToast();

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await axios.get(`${API_URL}/matches`);
      setMatches(res.data.matches);
    } catch (err) {
      addToast('Error loading matches: ' + err.message, 'error');
    } finally {
      setLoadingMatches(false);
    }
  }, [addToast]);

  // ── Load matches once logged in ───────────────────────────
  useEffect(() => {
    if (currentUser) loadMatches();
  }, [currentUser, loadMatches]);

  const loadSeats = async (matchId) => {
    setLoadingSeats(true);
    try {
      const res = await axios.get(`${API_URL}/seats/${matchId}`);
      setSeats(res.data.seats);
    } catch (err) {
      addToast('Error loading seats: ' + err.message, 'error');
    } finally {
      setLoadingSeats(false);
    }
  };

  // ── Auth handlers ─────────────────────────────────────────
  const handleLogin = (user) => {
    sessionStorage.setItem('tb_user', JSON.stringify(user));
    setCurrentUser(user);
    setAuthView('login');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tb_user');
    setCurrentUser(null);
    setMatches([]);
    setSelectedMatch(null);
    setSeats([]);
    setSelectedSeats([]);
    axios.post(`${API_URL}/auth/logout`).catch(() => {});
  };

  // ── Match / Seat handlers ─────────────────────────────────
  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setSelectedSeats([]);
    loadSeats(match.match_id);
  };

  const handleToggleSeat = (seat) => {
    setSelectedSeats(prev => {
      const already = prev.some(s => s.seat_id === seat.seat_id);
      if (already) return prev.filter(s => s.seat_id !== seat.seat_id);
      if (prev.length >= 6) return prev; // max guard
      return [...prev, seat];
    });
  };

  // ── Booking handler ───────────────────────────────────────
  const handleBooking = async () => {
    if (!selectedSeats.length || !selectedMatch || !currentUser) return;

    try {
      let result;
      if (selectedSeats.length === 1) {
        // Use existing single-seat endpoint
        const res = await axios.post(`${API_URL}/book`, {
          seat_id:   selectedSeats[0].seat_id,
          user_name: currentUser.full_name,
          email:     currentUser.email,
          match_id:  selectedMatch.match_id
        });
        result = res.data;
      } else {
        // Use new multi-seat endpoint
        const res = await axios.post(`${API_URL}/book-multiple`, {
          seat_ids: selectedSeats.map(s => s.seat_id),
          event_id: selectedMatch.match_id,
          user_id:  currentUser.user_id
        });
        result = res.data;
      }

      if (result.success) {
        const ids = result.booking_ids
          ? result.booking_ids.join(', #')
          : result.booking_id;
        addToast(
          `Booking #${ids} confirmed for seats: ${selectedSeats.map(s => s.seat_number).join(', ')}`,
          'success',
          '🎉 Booking Confirmed!'
        );
        loadSeats(selectedMatch.match_id);
        setSelectedSeats([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const failedSeats = err.response?.data?.failed_seats;
      addToast(
        failedSeats ? `Seats already taken: ${failedSeats.join(', ')}` : msg,
        'error',
        'Booking Failed'
      );
    }
  };

  // ── Routing: Auth screens ─────────────────────────────────
  if (!currentUser) {
    if (authView === 'register') {
      return <RegisterPage onGoLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthView('register')}
      />
    );
  }

  // ── Main App ──────────────────────────────────────────────
  return (
    <div className="App page-enter">
      <ToastRenderer />

      {/* Navbar */}
      <nav className="app-navbar">
        <div className="navbar-logo">
          🏏 <span>TicketBook</span>
        </div>
        <div className="navbar-right">
          <button 
            className={`btn-nav ${currentView === 'book' ? 'active' : ''}`}
            onClick={() => setCurrentView('book')}
          >
            Book Tickets
          </button>
          <button 
            className={`btn-nav ${currentView === 'my-bookings' ? 'active' : ''}`}
            onClick={() => setCurrentView('my-bookings')}
          >
            My Bookings
          </button>
          <span className="navbar-welcome">
            Welcome, <strong>{currentUser.full_name}</strong>
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {currentView === 'book' ? (
          <>
            <h1 className="page-title">Book Your Tickets</h1>
            <p className="page-subtitle">Select a match, pick your seats, and confirm</p>

            {/* Match Selection */}
            <MatchList
              matches={matches}
              selectedMatch={selectedMatch}
              onSelectMatch={handleMatchSelect}
              loading={loadingMatches}
            />

            {/* Seat Grid */}
            {selectedMatch && (
              <SeatGrid
                seats={seats}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                loading={loadingSeats}
              />
            )}

            {/* Booking Form */}
            {selectedSeats.length > 0 && (
              <BookingForm
                selectedSeats={selectedSeats}
                currentUser={currentUser}
                onBook={handleBooking}
                onCancel={() => setSelectedSeats([])}
              />
            )}
          </>
        ) : (
          <MyBookings currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}

export default App;