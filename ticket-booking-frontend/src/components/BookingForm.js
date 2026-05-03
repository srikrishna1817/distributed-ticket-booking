import React, { useState } from 'react';

function BookingForm({ selectedSeat, onBook, onCancel }) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim() && userEmail.trim()) {
      onBook(userName, userEmail);
      setUserName('');
      setUserEmail('');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Booking Details</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Selected Seat: <strong>{selectedSeat.seat_number}</strong>
            </label>
          </div>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary me-2">
            Confirm Booking
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;