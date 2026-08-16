import React from 'react';
import { getMaxGameScore, QUESTIONS_PER_GAME } from '../../game/gameLogic';

const StartScreen = ({ onStart }) => {
  const handleStartClick = () => {
    console.log('Start clicked');
    onStart?.();
  };

  const maxScore = getMaxGameScore(QUESTIONS_PER_GAME);
  const scoringData = [
    { clue: 1, label: 'Clue 1 (Hardest)', points: 50 },
    { clue: 2, label: 'Clue 2', points: 40 },
    { clue: 3, label: 'Clue 3', points: 30 },
    { clue: 4, label: 'Clue 4', points: 20 },
    { clue: 5, label: 'Clue 5 (Easiest)', points: 10 },
  ];

  return (
    <main className="start-screen" role="main">
      <header className="start-screen__header">
        <h1 className="start-screen__title">5 Clues Challenge</h1>
        <p className="start-screen__tagline">Guess the answer from 5 clues — the fewer you need, the more you score.</p>
      </header>

      <section className="start-screen__details" aria-labelledby="details-heading">
        <h2 id="details-heading" className="visually-hidden">Game Details</h2>
        <div className="start-screen__detail-grid">
          <div className="detail-card">
            <span className="detail-card__value">{QUESTIONS_PER_GAME}</span>
            <span className="detail-card__label">Questions per Game</span>
          </div>
          <div className="detail-card">
            <span className="detail-card__value">5</span>
            <span className="detail-card__label">Clues per Question</span>
          </div>
          <div className="detail-card">
            <span className="detail-card__value">{maxScore}</span>
            <span className="detail-card__label">Max Possible Score</span>
          </div>
        </div>
      </section>

      <section className="start-screen__scoring" aria-labelledby="scoring-heading">
        <h2 id="scoring-heading" className="start-screen__section-title">Scoring</h2>
        <table className="scoring-table">
          <thead>
            <tr>
              <th scope="col">Clue Used</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {scoringData.map((row) => (
              <tr key={row.clue}>
                <td>{row.label}</td>
                <td className="scoring-table__points">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="scoring-note">Clues are revealed one at a time, from hardest to easiest.</p>
      </section>

      <section className="start-screen__instructions" aria-labelledby="instructions-heading">
        <h2 id="instructions-heading" className="visually-hidden">How to Play</h2>
        <ul className="instructions-list">
          <li>Read each clue carefully — they go from hardest to easiest</li>
          <li>Type your answer at any time (case-insensitive)</li>
          <li>Submit early for more points, or wait for more clues</li>
          <li>Exact matches and common variations are accepted</li>
        </ul>
      </section>

      <button
        type="button"
        className="btn btn--primary start-screen__start-btn"
        onClick={handleStartClick}
      >
        Start Game
      </button>
    </main>
  );
};

export default StartScreen;