import React from 'react';

function MatchList({ matches, selectedMatch, onSelectMatch, loading }) {
  // Count available seats per match (computed from seats data if passed, else just show match info)
  if (loading) {
    return (
      <div className="app-card">
        <div className="card-header-custom">
          <span className="card-header-icon">🏟️</span>
          <h3>Select a Match</h3>
        </div>
        <div className="card-body-custom">
          <div className="match-cards-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-card">
      <div className="card-header-custom">
        <span className="card-header-icon">🏟️</span>
        <h3>Select a Match</h3>
      </div>
      <div className="card-body-custom">
        <div className="match-cards-grid">
          {matches.map(match => {
            const isSelected = selectedMatch && selectedMatch.match_id === match.match_id;
            return (
              <div
                key={match.match_id}
                className={`match-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectMatch(match)}
              >
                <div className="match-card-badge">IPL 2026</div>
                <div className="match-card-title">{match.match_name}</div>
                <div className="match-card-meta">
                  <div className="match-card-meta-item">
                    <span className="match-card-meta-icon">📍</span>
                    <span>{match.venue}</span>
                  </div>
                  <div className="match-card-meta-item">
                    <span className="match-card-meta-icon">🗓️</span>
                    <span>{match.match_date}</span>
                  </div>
                </div>
                <div className="match-card-footer">
                  <span className={`seats-badge ${isSelected ? '' : ''}`}>
                    🎟️ Available
                  </span>
                  {isSelected && (
                    <span style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600 }}>
                      ✓ Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MatchList;