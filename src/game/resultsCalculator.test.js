import { describe, it, expect, vi } from 'vitest';
import { calculateResults } from './resultsCalculator.js';

// Mock question results from a completed game
const mockQuestionResults = [
  { question: 'Google', answer: 'Google', clueSolved: 1, points: 50, correct: true },
  { question: 'The Godfather', answer: 'The Godfather', clueSolved: 3, points: 30, correct: true },
  { question: 'Octopus', answer: 'Octopus', clueSolved: 5, points: 10, correct: true },
  { question: 'Pizza', answer: 'Pizza', clueSolved: 0, points: 0, correct: false },
  { question: 'iPhone', answer: 'iPhone', clueSolved: 2, points: 40, correct: true },
];

describe('calculateResults', () => {
  it('calculates total score correctly', () => {
    const results = calculateResults(mockQuestionResults);
    expect(results.totalScore).toBe(130); // 50 + 30 + 10 + 0 + 40
  });

  it('calculates max score correctly', () => {
    const results = calculateResults(mockQuestionResults);
    expect(results.maxScore).toBe(250); // 5 questions * 50
  });

  it('calculates percentage correctly (rounded)', () => {
    const results = calculateResults(mockQuestionResults);
    expect(results.percentage).toBe(52); // 130/250 = 0.52 = 52%
  });

  it('counts correct answers', () => {
    const results = calculateResults(mockQuestionResults);
    expect(results.correctCount).toBe(4);
  });

  it('counts incorrect answers', () => {
    const results = calculateResults(mockQuestionResults);
    expect(results.incorrectCount).toBe(1);
  });

  it('includes per-question breakdown with all fields', () => {
    const results = calculateResults(mockQuestionResults);
    expect(results.breakdown).toHaveLength(5);

    // Check first question
    expect(results.breakdown[0]).toEqual({
      question: 'Google',
      answer: 'Google',
      clueSolved: 1,
      points: 50,
      correct: true,
    });

    // Check failed question
    expect(results.breakdown[3]).toEqual({
      question: 'Pizza',
      answer: 'Pizza',
      clueSolved: 0,
      points: 0,
      correct: false,
    });
  });

  it('handles perfect score', () => {
    const perfectResults = mockQuestionResults.map(r => ({ ...r, points: 50, clueSolved: 1, correct: true }));
    const results = calculateResults(perfectResults);
    expect(results.totalScore).toBe(250);
    expect(results.percentage).toBe(100);
    expect(results.correctCount).toBe(5);
    expect(results.incorrectCount).toBe(0);
  });

  it('handles zero score', () => {
    const zeroResults = mockQuestionResults.map(r => ({ ...r, points: 0, clueSolved: 0, correct: false }));
    const results = calculateResults(zeroResults);
    expect(results.totalScore).toBe(0);
    expect(results.percentage).toBe(0);
    expect(results.correctCount).toBe(0);
    expect(results.incorrectCount).toBe(5);
  });

  it('rounds percentage correctly', () => {
    // 1/3 questions correct at 50 pts = 50/150 = 33.33% -> 33%
    const partialResults = [
      { question: 'Q1', answer: 'A1', clueSolved: 1, points: 50, correct: true },
      { question: 'Q2', answer: 'A2', clueSolved: 0, points: 0, correct: false },
      { question: 'Q3', answer: 'A3', clueSolved: 0, points: 0, correct: false },
    ];
    const results = calculateResults(partialResults);
    expect(results.percentage).toBe(33);
  });

  it('handles clueSolved 0 for failed questions', () => {
    const results = calculateResults([
      { question: 'Q1', answer: 'A1', clueSolved: 0, points: 0, correct: false },
    ]);
    expect(results.breakdown[0].clueSolved).toBe(0);
    expect(results.breakdown[0].points).toBe(0);
    expect(results.breakdown[0].correct).toBe(false);
  });
});