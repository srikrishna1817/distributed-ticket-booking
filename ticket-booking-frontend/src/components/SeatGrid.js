import React from 'react';

const MAX_SEATS = 6;

function SeatGrid({ seats, selectedSeats, onToggleSeat, loading }) {
  // Group seats by row (first character of seat_number e.g. A, B, C)
  const rows = {};
  seats.forEach(seat => {
    const row = seat.seat_number[0];
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });

  const sortedRows = Object.keys(rows).sort();
  const selectedCount = selectedSeats.length;
  const isSelected = (seat) => selectedSeats.some(s => s.seat_id === seat.seat_id);

  if (loading) {
    return (
      <div className="app-card">
        <div className="card-header-custom">
          <span className="card-header-icon">💺</span>
          <h3>Choose Your Seats</h3>
        </div>
        <div className="card-body-custom">
          <div className="screen-indicator">🎬 CRICKET FIELD / PITCH END</div>
          {['A', 'B', 'C'].map(row => (
            <div key={row} className="seat-row" style={{ marginBottom: 10 }}>
              <div className="row-label">{row}</div>
              <div className="seats-in-row">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="skeleton skeleton-seat" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-card">
      <div className="card-header-custom">
        <span className="card-header-icon">💺</span>
        <h3>Choose Your Seats</h3>
        {selectedCount > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(0,212,255,0.15)',
            color: 'var(--accent-blue)',
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '3px 12px',
            borderRadius: 20
          }}>
            {selectedCount} selected
          </span>
        )}
      </div>
      <div className="card-body-custom">
        {/* Screen/Stage indicator */}
        <div className="screen-indicator">🎬 CRICKET FIELD / PITCH END</div>

        {/* Seat rows */}
        <div className="seat-section">
          {sortedRows.map(rowKey => (
            <div key={rowKey} className="seat-row">
              <div className="row-label">{rowKey}</div>
              <div className="seats-in-row">
                {rows[rowKey].map(seat => {
                  const sel = isSelected(seat);
                  const booked = Boolean(seat.is_booked);
                  const atMax = !sel && selectedCount >= MAX_SEATS;

                  let cls = 'seat-btn ';
                  if (booked) cls += 'booked';
                  else if (sel) cls += 'selected';
                  else cls += 'available';

                  return (
                    <button
                      key={seat.seat_id}
                      className={cls}
                      onClick={() => !booked && !atMax ? onToggleSeat(seat) : (sel ? onToggleSeat(seat) : null)}
                      disabled={booked || (atMax && !sel)}
                      title={booked ? 'Already booked' : atMax && !sel ? 'Max 6 seats' : seat.seat_number}
                    >
                      {sel ? (
                        <>
                          <span className="seat-check">✓</span>
                          <span>{seat.seat_number}</span>
                        </>
                      ) : (
                        seat.seat_number
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-dot available" />
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot selected" />
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot booked" />
            <span>Booked</span>
          </div>
        </div>

        {/* Selection summary */}
        {selectedCount > 0 && (
          <div className="selection-summary">
            <span className="selection-count">
              {selectedCount} seat{selectedCount > 1 ? 's' : ''} selected:{' '}
              {selectedSeats.map(s => s.seat_number).join(', ')}
            </span>
            <span className="selection-limit">Max {MAX_SEATS}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeatGrid;