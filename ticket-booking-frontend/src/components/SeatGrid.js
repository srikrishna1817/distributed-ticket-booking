import React from 'react';

function SeatGrid({ seats, selectedSeat, onSelectSeat }) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Select Seat</h3>
      </div>
      <div className="card-body">
        <div className="seat-grid">
          {seats.map(seat => (
            <div
              key={seat.seat_id}
              className={`seat ${seat.is_booked ? 'booked' : ''} ${
                selectedSeat && selectedSeat.seat_id === seat.seat_id ? 'selected' : ''
              }`}
              onClick={() => onSelectSeat(seat)}
            >
              {seat.seat_number}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span className="badge bg-success me-2">Available</span>
          <span className="badge bg-danger me-2">Booked</span>
          <span className="badge bg-primary">Selected</span>
        </div>
      </div>
    </div>
  );
}

export default SeatGrid;