import React from 'react';

const BackToDashboard = ({ onBack }) => {
  return (
    <button
      type="button"
      className="back-to-dashboard"
      onClick={onBack}
      aria-label="Back to Games"
    >
      ← Back to Games
    </button>
  );
};

export default BackToDashboard;