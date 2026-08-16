import React from 'react';

const ProgressIndicator = ({ currentQuestion, totalQuestions, currentClue, totalClues = 5 }) => {
  return (
    <div className="progress-indicator" role="status" aria-live="polite">
      <div className="progress-indicator__question">
        <span className="progress-indicator__label">Question</span>
        <span className="progress-indicator__value">
          {currentQuestion} of {totalQuestions}
        </span>
      </div>
      <div className="progress-indicator__clues" aria-label={`Clue ${currentClue} of ${totalClues}`}>
        <span className="progress-indicator__label">Clue</span>
        <div className="progress-indicator__dots">
          {Array.from({ length: totalClues }, (_, i) => (
            <span
              key={i}
              className={`progress-indicator__dot ${
                i < currentClue ? 'progress-indicator__dot--revealed' : ''
              } ${i === currentClue - 1 ? 'progress-indicator__dot--current' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="progress-indicator__value">
          {currentClue} of {totalClues}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;