import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://ticket-booking-backend-1vuk.onrender.com/api';

function MyBookings({ currentUser }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/user/bookings`, {
        email: currentUser.email
      });
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  }, [currentUser.email]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="app-card">
        <div className="card-header-custom">
          <span className="card-header-icon">🎟️</span>
          <h3>My Bookings</h3>
        </div>
        <div className="card-body-custom">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="spinner" style={{ borderColor: 'rgba(0,212,255,0.3)', borderTopColor: 'var(--accent-blue)', width: 30, height: 30 }} />
            <div style={{ marginTop: 10, color: 'var(--text-muted)' }}>Loading your tickets...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-card">
        <div className="card-body-custom">
          <div className="inline-error">⚠️ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-card">
      <div className="card-header-custom">
        <span className="card-header-icon">🎟️</span>
        <h3>My Bookings</h3>
      </div>
      <div className="card-body-custom">
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <p>You haven't booked any tickets yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(booking => (
              <div 
                key={booking.booking_id} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Booking #{booking.booking_id}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-white)', marginBottom: '4px' }}>
                    {booking.match_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🗓️ {booking.match_date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>📍 {booking.venue}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-orange)', marginBottom: '4px' }}>
                    Seat {booking.seat_number}
                  </div>
                  <div style={{ display: 'inline-block', background: 'rgba(0, 212, 100, 0.12)', color: '#00d464', fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
                    ✓ {booking.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Booked on: {booking.booking_time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
