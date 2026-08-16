import React from 'react';
import { calculateResults } from '../../game/resultsCalculator.js';

const ResultsScreen = ({ questionResults, onPlayAgain }) => {
  const results = calculateResults(questionResults);

  return (
    <main className="results-screen" role="main">
      <div className="results-screen__card">
        <header className="results-screen__header">
          <h1 className="results-screen__title">Results</h1>
        </header>

        <div className="results-screen__summary">
          <div className="results-screen__score" aria-label={`Final score: ${results.totalScore} out of ${results.maxScore}`}>
            <span className="results-screen__score-value">{results.totalScore}</span>
            <span className="results-screen__score-max">/ {results.maxScore}</span>
          </div>
          <p className="results-screen__percentage">{results.percentage}%</p>
        </div>

        <div className="results-screen__counts">
          <div className="results-screen__count results-screen__count--correct">
            <span className="results-screen__count-value">{results.correctCount}</span>
            <span className="results-screen__count-label">Correct</span>
          </div>
          <div className="results-screen__count results-screen__count--incorrect">
            <span className="results-screen__count-value">{results.incorrectCount}</span>
            <span className="results-screen__count-label">Incorrect</span>
          </div>
        </div>

        <p className="results-screen__message">
          {results.percentage === 100
            ? 'Perfect score! 🎉'
            : results.percentage >= 80
            ? 'Excellent!'
            : results.percentage >= 60
            ? 'Good job!'
            : results.percentage >= 40
            ? 'Not bad!'
            : 'Keep practicing!'}
        </p>

        <section className="results-screen__breakdown" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="results-screen__breakdown-title">
            Question Breakdown
          </h2>
          <table className="results-screen__table">
            <thead>
              <tr>
                <th scope="col">Question</th>
                <th scope="col">Answer</th>
                <th scope="col">Clue Solved</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {results.breakdown.map((item, index) => (
                <tr key={index} className={item.correct ? 'results-screen__row--correct' : 'results-screen__row--incorrect'}>
                  <td>Q{index + 1}</td>
                  <td className="results-screen__answer">{item.answer}</td>
                  <td className="results-screen__clue">
                    {item.correct ? (
                      <span className="results-screen__clue-badge">{item.clueSolved}/5</span>
                    ) : (
                      <span className="results-screen__clue-failed">—</span>
                    )}
                  </td>
                  <td className="results-screen__points">
                    {item.correct ? '+' : ''}{item.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <button
          type="button"
          className="btn btn--primary results-screen__play-again"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
      </div>
    </main>
  );
};

export default ResultsScreen;