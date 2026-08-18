import React, { useState, useMemo } from 'react';
import { getMaxGameScore, QUESTIONS_PER_GAME, getCategories, getDifficulties } from '../../game/gameLogic';

const StartScreen = ({ onStart, categories, selectedCategory, selectedDifficulty }) => {
  const [category, setCategory] = useState(selectedCategory);
  const [difficulty, setDifficulty] = useState(selectedDifficulty);

  const categoryOptions = useMemo(() => getCategories(categories), [categories]);
  const difficultyOptions = useMemo(() => getDifficulties(categories), [categories]);

  const selectedCategoryCount = category === 'All Categories' ? categories.length : categories.filter(q => q.category === category).length;
  const selectedDifficultyCount = difficulty === 'All Difficulties' ? categories.length : categories.filter(q => q.difficulty === difficulty).length;

  const combinationCount = category === 'All Categories' && difficulty === 'All Difficulties' ? categories.length :
    category === 'All Categories' ? selectedDifficultyCount :
    difficulty === 'All Difficulties' ? selectedCategoryCount :
    categories.filter(q => q.category === category && q.difficulty === difficulty).length;

  const hasValidCombination = combinationCount >= QUESTIONS_PER_GAME;

  const handleStartClick = () => {
    console.log('Start clicked');
    onStart?.(category, difficulty);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  const maxScore = getMaxGameScore(QUESTIONS_PER_GAME);

  return (
    <main className="start-screen" role="main">
      <header className="start-screen__header">
        <h1 className="start-screen__title">5 Clues Challenge</h1>
        <p className="start-screen__tagline">Guess the answer from 5 clues — the fewer you need, the more you score.</p>
      </header>

      <section className="start-screen__category" aria-labelledby="category-heading">
        <h2 id="category-heading" className="start-screen__section-title">Category</h2>
        <div className="category-selector" role="group" aria-label="Select question category">
          {categoryOptions.map((cat, index) => {
            const count = cat === 'All Categories' ? categories.length : categories.filter(q => q.category === cat).length;
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-chip ${isSelected ? 'category-chip--selected' : ''}`}
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={isSelected}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="category-chip__name">{cat}</span>
                <span className="category-chip__count">({count})</span>
              </button>
            );
          })}

          <br/>

          <div className="category-chip" role="group" aria-label="Select question difficulty">
            {difficultyOptions.map((diff, index) => {
              const count = diff === 'All Difficulties' ? categories.length : categories.filter(q => q.difficulty === diff).length;
              const isSelected = difficulty === diff;
              return (
                <button
                  key={diff}
                  type="button"
                  className={`category-chip ${isSelected ? 'category-chip--selected' : ''}`}
                  onClick={() => handleDifficultyChange(diff)}
                  aria-pressed={isSelected}
                  style={{ animationDelay: `${index * 50 + 1000}ms` }}
                  disabled={!hasValidCombination}
                >
                  <span className="category-chip__name">{diff}</span>
                  <span className="category-chip__count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

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

      {!hasValidCombination && (
        <p className="start-screen__warning" role="alert">
          Not enough questions for this combination. Please choose a different category or difficulty.
        </p>
      )}
      <button
        type="button"
        className="btn btn--primary start-screen__start-btn"
        onClick={handleStartClick}
        disabled={!hasValidCombination}
      >
        Start Game
      </button>
    </main>
  );
};

const scoringData = [
  { clue: 1, label: 'Clue 1 (Hardest)', points: 50 },
  { clue: 2, label: 'Clue 2', points: 40 },
  { clue: 3, label: 'Clue 3', points: 30 },
  { clue: 4, label: 'Clue 4', points: 20 },
  { clue: 5, label: 'Clue 5 (Easiest)', points: 10 },
];

export default StartScreen;