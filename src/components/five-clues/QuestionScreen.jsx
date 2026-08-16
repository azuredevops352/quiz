import React, { useState, useRef, useEffect } from 'react';
import ProgressIndicator from './ProgressIndicator';

const INCORRECT_FLASH_MS = 1600;

const QuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  clueIndex,
  totalScore,
  onSubmit,
  onNext,
  questionResult,
  gameStatus,
  isLastQuestion = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showIncorrectFlash, setShowIncorrectFlash] = useState(false);
  const inputRef = useRef(null);
  const isFirstRender = useRef(true);

  const isFeedback = gameStatus === 'feedback';
  const visibleClues = question?.clues?.slice(0, clueIndex + 1) ?? [];
  const currentClueNumber = clueIndex + 1;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Auto-focus when clue changes (new question or new clue)
    inputRef.current?.focus();
  }, [question, clueIndex]);

  // A wrong non-final answer keeps us in 'playing' but records a failed
  // attempt in questionResult — flash a brief message, then let the newly
  // revealed clue (already stacked below) take over.
  useEffect(() => {
    if (gameStatus === 'playing' && questionResult && !questionResult.correct) {
      setShowIncorrectFlash(true);
      const timer = setTimeout(() => setShowIncorrectFlash(false), INCORRECT_FLASH_MS);
      return () => clearTimeout(timer);
    }
  }, [questionResult, gameStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFeedback || !inputValue.trim()) return;
    onSubmit(inputValue);
    setInputValue(''); // Clear input after submit
  };

  return (
    <main className="question-screen" role="main">
      <ProgressIndicator
        currentQuestion={questionNumber}
        totalQuestions={totalQuestions}
        currentClue={currentClueNumber}
      />

      <header className="question-screen__header">
        <div className="question-screen__meta">
          <span className="question-screen__score" aria-label={`Current score: ${totalScore}`}>
            Score: {totalScore}
          </span>
          <span className="question-screen__clue-number" aria-label={`Clue ${currentClueNumber} of 5`}>
            Clue {currentClueNumber} of 5
          </span>
        </div>
      </header>

      <section className="question-screen__clues" aria-live="polite">
        {visibleClues.map((clue, i) => (
          <article
            key={`${questionNumber}-${i}`}
            className={`question-screen__clue ${
              i === clueIndex ? 'question-screen__clue--current' : ''
            }`}
          >
            <span className="question-screen__clue-label">Clue {i + 1}</span>
            <p className="question-screen__clue-text">{clue}</p>
          </article>
        ))}
      </section>

      <form className="question-screen__form" onSubmit={handleSubmit}>
        <label htmlFor="answer-input" className="visually-hidden">
          Your answer
        </label>
        <input
          ref={inputRef}
          id="answer-input"
          type="text"
          className="question-screen__input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your answer..."
          disabled={isFeedback}
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          className="btn btn--primary question-screen__submit-btn"
          disabled={isFeedback || !inputValue.trim()}
        >
          Submit
        </button>
      </form>

      {showIncorrectFlash && !isFeedback && (
        <p className="question-screen__flash" role="status">
          <span aria-hidden="true">❌</span> Incorrect — try the next clue!
        </p>
      )}

      {isFeedback && questionResult && (
        <div
          className={`question-screen__feedback ${
            questionResult.correct
              ? 'question-screen__feedback--success'
              : 'question-screen__feedback--error'
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="question-screen__feedback-title">
            <span aria-hidden="true">{questionResult.correct ? '🎉' : '❌'}</span>{' '}
            {questionResult.correct ? 'Correct!' : 'Not quite!'}
          </p>

          {questionResult.correct ? (
            <p className="question-screen__feedback-points">
              +{questionResult.points} points · Total: {totalScore}
            </p>
          ) : (
            <p className="question-screen__feedback-answer">
              The answer was "{questionResult.answer}". You earned 0 points.
            </p>
          )}

          <button
            type="button"
            className="btn btn--primary question-screen__next-btn"
            onClick={onNext}
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}

      {!isFeedback && (
        <p className="question-screen__hint">
          Press Enter to submit. Answer is case-insensitive.
        </p>
      )}
    </main>
  );
};

export default QuestionScreen;
