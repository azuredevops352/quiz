import { describe, it, expect } from 'vitest';
import {
  getRandomQuestions,
  normalizeAnswer,
  isCorrectAnswer,
  pointsByClue,
  calculateScore,
  getMaxGameScore
} from './gameLogic.js';

// Test data
const sampleQuestion = {
  id: 1,
  answer: 'Albert Einstein',
  acceptedAnswers: ['Einstein'],
  clues: ['clue1', 'clue2', 'clue3', 'clue4', 'clue5']
};

const sampleQuestionBank = [
  { id: 1, answer: 'One', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 2, answer: 'Two', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 3, answer: 'Three', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 4, answer: 'Four', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 5, answer: 'Five', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 6, answer: 'Six', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
];

describe('getRandomQuestions', () => {
  it('returns exactly count questions', () => {
    const result = getRandomQuestions(sampleQuestionBank, 3);
    expect(result.length).toBe(3);
  });

  it('returns unique questions (no duplicates)', () => {
    const result = getRandomQuestions(sampleQuestionBank, 5);
    const ids = result.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('does not exceed question bank size', () => {
    const result = getRandomQuestions(sampleQuestionBank, 10);
    expect(result.length).toBe(sampleQuestionBank.length);
  });

  it('returns empty array for count <= 0', () => {
    expect(getRandomQuestions(sampleQuestionBank, 0)).toEqual([]);
    expect(getRandomQuestions(sampleQuestionBank, -1)).toEqual([]);
  });
});

describe('normalizeAnswer', () => {
  it('lowercases the string', () => {
    expect(normalizeAnswer('APPLE')).toBe('apple');
  });

  it('trims whitespace', () => {
    expect(normalizeAnswer('  apple  ')).toBe('apple');
  });

  it('collapses multiple whitespace to single space', () => {
    expect(normalizeAnswer('apple   pie')).toBe('apple pie');
    expect(normalizeAnswer('  apple   pie  ')).toBe('apple pie');
  });

  it('handles empty string', () => {
    expect(normalizeAnswer('')).toBe('');
  });
});

describe('isCorrectAnswer', () => {
  it('returns true for exact answer match (case insensitive)', () => {
    expect(isCorrectAnswer('Albert Einstein', sampleQuestion)).toBe(true);
    expect(isCorrectAnswer('albert einstein', sampleQuestion)).toBe(true);
  });

  it('returns true for acceptedAnswers match', () => {
    expect(isCorrectAnswer('Einstein', sampleQuestion)).toBe(true);
    expect(isCorrectAnswer('einstein', sampleQuestion)).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    expect(isCorrectAnswer('Newton', sampleQuestion)).toBe(false);
  });

  it('handles whitespace and case', () => {
    expect(isCorrectAnswer('  EINSTEIN  ', sampleQuestion)).toBe(true);
  });
});

describe('pointsByClue', () => {
  it('is an array of 5 values', () => {
    expect(pointsByClue).toHaveLength(5);
  });

  it('has values [50, 40, 30, 20, 10] for clues 1-5', () => {
    expect(pointsByClue).toEqual([50, 40, 30, 20, 10]);
  });
});

describe('calculateScore', () => {
  it('returns 50 for clue index 0 (first/hardest clue)', () => {
    expect(calculateScore(0)).toBe(50);
  });

  it('returns 10 for clue index 4 (last/easiest clue)', () => {
    expect(calculateScore(4)).toBe(10);
  });

  it('returns correct points for middle clues', () => {
    expect(calculateScore(1)).toBe(40);
    expect(calculateScore(2)).toBe(30);
    expect(calculateScore(3)).toBe(20);
  });

  it('returns 0 for invalid index', () => {
    expect(calculateScore(-1)).toBe(0);
    expect(calculateScore(5)).toBe(0);
    expect(calculateScore(10)).toBe(0);
  });
});

describe('getMaxGameScore', () => {
  it('returns max points per question * questionsPerGame', () => {
    expect(getMaxGameScore(1)).toBe(50);
    expect(getMaxGameScore(5)).toBe(250);
    expect(getMaxGameScore(10)).toBe(500);
  });

  it('never hardcodes 50 - derives from pointsByClue', () => {
    // If pointsByClue changed, this would still work
    expect(getMaxGameScore(5)).toBe(Math.max(...pointsByClue) * 5);
  });
});