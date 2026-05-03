import React from 'react';

function MatchList({ matches, selectedMatch, onSelectMatch }) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Select Match</h3>
      </div>
      <div className="card-body">
        <select
          className="form-select"
          value={selectedMatch ? selectedMatch.match_id : ''}
          onChange={(e) => {
            const match = matches.find(m => m.match_id === parseInt(e.target.value));
            if (match) onSelectMatch(match);
          }}
        >
          <option value="">Select a match</option>
          {matches.map(match => (
            <option key={match.match_id} value={match.match_id}>
              {match.match_name} at {match.venue} ({match.match_date})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default MatchList;