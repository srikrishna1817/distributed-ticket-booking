import React, { useState } from 'react';

function BookingForm({ selectedSeats, currentUser, onBook, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeats || selectedSeats.length === 0) return;
    setLoading(true);
    await onBook();
    setLoading(false);
  };

  if (!selectedSeats || selectedSeats.length === 0) return null;

  return (
    <div className="app-card">
      <div className="card-header-custom">
        <span className="card-header-icon">🎟️</span>
        <h3>Confirm Your Booking</h3>
      </div>
      <div className="card-body-custom">
        {/* Selected seats as chips */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="form-label-custom" style={{ marginBottom: 8 }}>
            Selected Seats ({selectedSeats.length})
          </div>
          <div className="seat-chips">
            {selectedSeats.map(seat => (
              <span key={seat.seat_id} className="seat-chip">
                {seat.seat_number}
              </span>
            ))}
          </div>
        </div>

        {/* User info (pre-filled, read-only) */}
        <div className="form-label-custom" style={{ marginBottom: 8 }}>
          Booking For
        </div>
        <div className="booking-user-info">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div className="booking-user-info-label">Name</div>
              <div className="booking-user-info-value">{currentUser.full_name}</div>
            </div>
            <div>
              <div className="booking-user-info-label">Email</div>
              <div className="booking-user-info-value">{currentUser.email}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <form onSubmit={handleSubmit}>
          <div className="booking-actions">
            <button
              type="submit"
              className="btn-primary-custom"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" /> Booking…</>
                : `🎟️ Confirm ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`
              }
            </button>
            <button
              type="button"
              className="btn-secondary-custom"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;