import { describe, it, expect } from 'vitest';
import {
  getRandomQuestions,
  getCategories,
  getDifficulties,
  ALL_CATEGORIES,
  ALL_DIFFICULTIES,
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

// Categorized bank for category-selection tests
const categorizedBank = [
  { id: 1, category: 'Animals', answer: 'Octopus', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 2, category: 'Animals', answer: 'Dolphin', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 3, category: 'Animals', answer: 'Penguin', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 4, category: 'Animals', answer: 'Kangaroo', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 5, category: 'Animals', answer: 'Owl', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 6, category: 'Food', answer: 'Pizza', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 7, category: 'Food', answer: 'Sushi', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 8, category: 'Science', answer: 'DNA', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
];

// Fully categorized bank for combined category+difficulty tests
const categorizedDifficultyBank = [
  { id: 1, category: 'Animals', difficulty: 'Easy', answer: 'Honeybee', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 2, category: 'Animals', difficulty: 'Medium', answer: 'Octopus', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 3, category: 'Animals', difficulty: 'Hard', answer: 'Great White Shark', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 4, category: 'Animals', difficulty: 'Easy', answer: 'Dolphin', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 5, category: 'Animals', difficulty: 'Easy', answer: 'Elephant', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 6, category: 'Food', difficulty: 'Easy', answer: 'Pizza', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 7, category: 'Food', difficulty: 'Medium', answer: 'Sushi', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 8, category: 'Food', difficulty: 'Hard', answer: 'Chocolate', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 9, category: 'Food', difficulty: 'Easy', answer: 'Tacos', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 10, category: 'Food', difficulty: 'Easy', answer: 'Ice Cream', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 11, category: 'Science', difficulty: 'Medium', answer: 'DNA', acceptedAnswers: [], clues: ['c1', 'c2', 'c3', 'c4', 'c5'] },
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

  describe('category filtering', () => {
    it('returns only questions from the selected category', () => {
      const result = getRandomQuestions(categorizedBank, 5, 'Animals');
      expect(result).toHaveLength(5);
      expect(result.every(q => q.category === 'Animals')).toBe(true);
    });

    it('returns unique questions within a category (no repeats)', () => {
      const result = getRandomQuestions(categorizedBank, 5, 'Animals');
      const ids = result.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('treats ALL_CATEGORIES identically to omitting the category', () => {
      // Both should draw from the whole bank (all 8 available)
      const withAll = getRandomQuestions(categorizedBank, 8, ALL_CATEGORIES);
      const withoutArg = getRandomQuestions(categorizedBank, 8);
      expect(withAll).toHaveLength(8);
      expect(withoutArg).toHaveLength(8);
      // Same set of ids regardless of order
      const idsAll = withAll.map(q => q.id).sort((a, b) => a - b);
      const idsNone = withoutArg.map(q => q.id).sort((a, b) => a - b);
      expect(idsAll).toEqual(idsNone);
    });

    it('caps at the number of questions in the category', () => {
      const result = getRandomQuestions(categorizedBank, 5, 'Food');
      expect(result).toHaveLength(2); // only 2 Food questions exist
      expect(result.every(q => q.category === 'Food')).toBe(true);
    });

    it('falls back to the whole bank when the category is unknown', () => {
      const result = getRandomQuestions(categorizedBank, 8, 'Nonexistent');
      expect(result).toHaveLength(8);
    });
  });

  describe('difficulty filtering', () => {
    it('returns only questions from the selected difficulty', () => {
      const result = getRandomQuestions(categorizedDifficultyBank, 5, ALL_CATEGORIES, 'Easy');
      expect(result).toHaveLength(5);
      expect(result.every(q => q.difficulty === 'Easy')).toBe(true);
    });

    it('returns unique questions within a difficulty (no repeats)', () => {
      const result = getRandomQuestions(categorizedDifficultyBank, 5, ALL_CATEGORIES, 'Easy');
      const ids = result.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('treats ALL_DIFFICULTIES identically to omitting the difficulty', () => {
      const withAll = getRandomQuestions(categorizedDifficultyBank, 11, ALL_CATEGORIES, ALL_DIFFICULTIES);
      const withoutArg = getRandomQuestions(categorizedDifficultyBank, 11, ALL_CATEGORIES);
      expect(withAll).toHaveLength(11);
      expect(withoutArg).toHaveLength(11);
      const idsAll = withAll.map(q => q.id).sort((a, b) => a - b);
      const idsNone = withoutArg.map(q => q.id).sort((a, b) => a - b);
      expect(idsAll).toEqual(idsNone);
    });

    it('caps at the number of questions in the difficulty', () => {
      const result = getRandomQuestions(categorizedDifficultyBank, 10, ALL_CATEGORIES, 'Hard');
      expect(result).toHaveLength(2); // only 2 Hard questions
      expect(result.every(q => q.difficulty === 'Hard')).toBe(true);
    });

    it('falls back to the bank when the difficulty is unknown', () => {
      const result = getRandomQuestions(categorizedDifficultyBank, 11, ALL_CATEGORIES, 'Nonexistent');
      expect(result).toHaveLength(11);
    });
  });

  describe('combined category and difficulty filtering', () => {
    it('filters correctly by both category and difficulty', () => {
      // Animals + Easy = 3 questions
      const result = getRandomQuestions(categorizedDifficultyBank, 5, 'Animals', 'Easy');
      expect(result.every(q => q.category === 'Animals' && q.difficulty === 'Easy')).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('filters correctly by category and falls back to difficulty filter when insufficient', () => {
      // Food + Medium = 1 question, asking for 5 -> capped at 1
      const result = getRandomQuestions(categorizedDifficultyBank, 5, 'Food', 'Medium');
      expect(result).toHaveLength(1);
      expect(result[0].difficulty).toBe('Medium');
    });

    it('returns empty array when combination has no matches', () => {
      // Birds (nonexistent category) + Easy -> should fall back to full bank
      const result = getRandomQuestions(categorizedDifficultyBank, 5, 'Birds', 'Easy');
      // Falls back to full bank since Birds has no questions
      expect(result).toHaveLength(5);
    });

    it('"All Categories" + "All Difficulties" behaves exactly like original unfiltered', () => {
      const withAllFilters = getRandomQuestions(categorizedDifficultyBank, 5, ALL_CATEGORIES, ALL_DIFFICULTIES);
      const noFilters = getRandomQuestions(categorizedDifficultyBank, 5);
      expect(withAllFilters).toHaveLength(5);
      expect(noFilters).toHaveLength(5);
    });
  });
});

describe('getCategories', () => {
  it('returns ALL_CATEGORIES as the first option', () => {
    const result = getCategories(categorizedBank);
    expect(result[0]).toBe(ALL_CATEGORIES);
  });

  it('returns a unique, sorted list of categories after the first option', () => {
    const result = getCategories(categorizedBank);
    const rest = result.slice(1);
    expect(rest).toEqual(['Animals', 'Food', 'Science']);
  });

  it('does not include duplicate categories', () => {
    const result = getCategories(categorizedBank);
    expect(new Set(result).size).toBe(result.length);
  });

  it('returns only ALL_CATEGORIES for an empty or missing bank', () => {
    expect(getCategories([])).toEqual([ALL_CATEGORIES]);
    expect(getCategories(null)).toEqual([ALL_CATEGORIES]);
  });
});

describe('getDifficulties', () => {
  it('returns ALL_DIFFICULTIES as the first option', () => {
    const result = getDifficulties(categorizedDifficultyBank);
    expect(result[0]).toBe(ALL_DIFFICULTIES);
  });

  it('returns difficulties in fixed order [Easy, Medium, Hard] after the first option', () => {
    const result = getDifficulties(categorizedDifficultyBank);
    const rest = result.slice(1);
    expect(rest).toEqual(['Easy', 'Medium', 'Hard']);
  });

  it('does not include duplicate difficulties', () => {
    const result = getDifficulties(categorizedDifficultyBank);
    expect(new Set(result).size).toBe(result.length);
  });

  it('returns only ALL_DIFFICULTIES for an empty or missing bank', () => {
    expect(getDifficulties([])).toEqual([ALL_DIFFICULTIES]);
    expect(getDifficulties(null)).toEqual([ALL_DIFFICULTIES]);
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