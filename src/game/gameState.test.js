import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameStateReducer, INITIAL_STATE } from './gameState.js';

// Mock question bank for deterministic testing
const mockQuestionBank = [
  { id: 1, answer: 'Apple', acceptedAnswers: [], clues: ['clue1', 'clue2', 'clue3', 'clue4', 'clue5'] },
  { id: 2, answer: 'Banana', acceptedAnswers: [], clues: ['clue1', 'clue2', 'clue3', 'clue4', 'clue5'] },
  { id: 3, answer: 'Cherry', acceptedAnswers: [], clues: ['clue1', 'clue2', 'clue3', 'clue4', 'clue5'] },
];

describe('gameStateReducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('START_GAME', () => {
    it('initializes game with selected questions and resets state', () => {
      const action = { type: 'START_GAME', questionBank: mockQuestionBank, questionsPerGame: 3 };
      const state = gameStateReducer(INITIAL_STATE, action);

      expect(state.gameStatus).toBe('playing');
      expect(state.selectedQuestions).toHaveLength(3);
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.currentClueIndex).toBe(0);
      expect(state.totalScore).toBe(0);
      expect(state.questionResult).toBeNull();
    });

    it('selects correct number of questions', () => {
      const action = { type: 'START_GAME', questionBank: mockQuestionBank, questionsPerGame: 2 };
      const state = gameStateReducer(INITIAL_STATE, action);

      expect(state.selectedQuestions).toHaveLength(2);
    });
  });

  describe('SUBMIT_ANSWER - correct answer', () => {
    const playingState = {
      ...INITIAL_STATE,
      selectedQuestions: mockQuestionBank.slice(0, 3),
      currentQuestionIndex: 0,
      currentClueIndex: 0,
      totalScore: 0,
      gameStatus: 'playing',
    };

    it('shows feedback on correct answer (does not auto-advance)', () => {
      const action = { type: 'SUBMIT_ANSWER', userInput: 'Apple' };
      const state = gameStateReducer(playingState, action);

      expect(state.gameStatus).toBe('feedback');
      expect(state.currentQuestionIndex).toBe(0); // same question until NEXT_QUESTION
      expect(state.currentClueIndex).toBe(0);
      expect(state.totalScore).toBe(50); // clue 1 = 50 points
      expect(state.questionResult).toEqual({
        correct: true,
        points: 50,
        answer: 'Apple',
        isFinalClue: false,
      });
    });

    it('shows feedback with correct points based on clue index used', () => {
      const stateAtClue3 = { ...playingState, currentClueIndex: 2 }; // clue 3 = 30 points
      const action = { type: 'SUBMIT_ANSWER', userInput: 'Apple' };
      const state = gameStateReducer(stateAtClue3, action);

      expect(state.totalScore).toBe(30);
      expect(state.questionResult.points).toBe(30);
      expect(state.questionResult.isFinalClue).toBe(false);
    });

    it('shows feedback on last question (not gameComplete yet)', () => {
      const lastQuestionState = {
        ...playingState,
        currentQuestionIndex: 2, // last question (index 2 of 3)
        currentClueIndex: 0,
      };
      const action = { type: 'SUBMIT_ANSWER', userInput: 'Cherry' };
      const state = gameStateReducer(lastQuestionState, action);

      expect(state.gameStatus).toBe('feedback');
      expect(state.totalScore).toBe(50);
    });
  });

  describe('SUBMIT_ANSWER - incorrect answer', () => {
    const playingState = {
      ...INITIAL_STATE,
      selectedQuestions: mockQuestionBank.slice(0, 3),
      currentQuestionIndex: 0,
      currentClueIndex: 0,
      totalScore: 0,
      gameStatus: 'playing',
    };

    it('advances to next clue on incorrect answer (clue 1 -> clue 2), no feedback', () => {
      const action = { type: 'SUBMIT_ANSWER', userInput: 'Wrong' };
      const state = gameStateReducer(playingState, action);

      expect(state.currentClueIndex).toBe(1);
      expect(state.currentQuestionIndex).toBe(0); // same question
      expect(state.totalScore).toBe(0);
      expect(state.gameStatus).toBe('playing'); // still playing, no feedback
      expect(state.questionResult).toEqual({
        correct: false,
        points: 0,
        answer: 'Apple',
        isFinalClue: false,
      });
    });

    it('advances through clues 1-4 without feedback', () => {
      let state = gameStateReducer(playingState, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });
      expect(state.currentClueIndex).toBe(1);
      expect(state.gameStatus).toBe('playing');

      state = gameStateReducer(state, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });
      expect(state.currentClueIndex).toBe(2);
      expect(state.gameStatus).toBe('playing');

      state = gameStateReducer(state, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });
      expect(state.currentClueIndex).toBe(3);
      expect(state.gameStatus).toBe('playing');

      state = gameStateReducer(state, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });
      expect(state.currentClueIndex).toBe(4);
      expect(state.gameStatus).toBe('playing');
    });

    it('does not reveal clue 3 when wrong on clue 2', () => {
      const stateAtClue2 = { ...playingState, currentClueIndex: 1 };
      const state = gameStateReducer(stateAtClue2, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });

      expect(state.currentClueIndex).toBe(2);
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.gameStatus).toBe('playing');
    });

    it('shows feedback on clue 5 wrong (final fail), does not auto-advance', () => {
      const stateAtClue5 = { ...playingState, currentClueIndex: 4 };
      const state = gameStateReducer(stateAtClue5, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });

      expect(state.gameStatus).toBe('feedback');
      expect(state.questionResult.correct).toBe(false);
      expect(state.questionResult.points).toBe(0);
      expect(state.questionResult.isFinalClue).toBe(true);
      expect(state.totalScore).toBe(0);
    });

    it('shows feedback on last question failed at clue 5 (not gameComplete yet)', () => {
      const lastQuestionAtClue5 = {
        ...playingState,
        currentQuestionIndex: 2,
        currentClueIndex: 4,
      };
      const state = gameStateReducer(lastQuestionAtClue5, { type: 'SUBMIT_ANSWER', userInput: 'Wrong' });

      expect(state.gameStatus).toBe('feedback');
    });
  });

  describe('NEXT_QUESTION', () => {
    const feedbackStateCorrect = {
      ...INITIAL_STATE,
      selectedQuestions: mockQuestionBank.slice(0, 3),
      currentQuestionIndex: 0,
      currentClueIndex: 0,
      totalScore: 50,
      gameStatus: 'feedback',
      questionResult: { correct: true, points: 50, answer: 'Apple', isFinalClue: false },
    };

    it('advances to next question after correct feedback', () => {
      const state = gameStateReducer(feedbackStateCorrect, { type: 'NEXT_QUESTION' });

      expect(state.currentQuestionIndex).toBe(1);
      expect(state.currentClueIndex).toBe(0);
      expect(state.gameStatus).toBe('playing');
      expect(state.questionResult).toBeNull();
      expect(state.totalScore).toBe(50);
    });

    it('advances after final-clue-fail feedback', () => {
      const feedbackStateFail = {
        ...feedbackStateCorrect,
        currentClueIndex: 4,
        totalScore: 0,
        questionResult: { correct: false, points: 0, answer: 'Apple', isFinalClue: true },
      };
      const state = gameStateReducer(feedbackStateFail, { type: 'NEXT_QUESTION' });

      expect(state.currentQuestionIndex).toBe(1);
      expect(state.currentClueIndex).toBe(0);
      expect(state.gameStatus).toBe('playing');
      expect(state.totalScore).toBe(0);
    });

    it('completes game on last question after feedback', () => {
      const lastQuestionFeedback = {
        ...feedbackStateCorrect,
        currentQuestionIndex: 2,
        totalScore: 100,
      };
      const state = gameStateReducer(lastQuestionFeedback, { type: 'NEXT_QUESTION' });

      expect(state.gameStatus).toBe('gameComplete');
      expect(state.questionResult).toBeNull();
    });
  });

  describe('action guards (rapid double-dispatch protection)', () => {
    const playingState = {
      ...INITIAL_STATE,
      selectedQuestions: mockQuestionBank.slice(0, 3),
      currentQuestionIndex: 0,
      currentClueIndex: 0,
      totalScore: 0,
      gameStatus: 'playing',
    };

    it('ignores SUBMIT_ANSWER when not playing (double-submit)', () => {
      const correct = gameStateReducer(playingState, { type: 'SUBMIT_ANSWER', userInput: 'Apple' });
      expect(correct.gameStatus).toBe('feedback');
      expect(correct.totalScore).toBe(50);

      // Second submit arrives before re-render — must be a no-op
      const double = gameStateReducer(correct, { type: 'SUBMIT_ANSWER', userInput: 'Apple' });
      expect(double).toEqual(correct);
      expect(double.totalScore).toBe(50); // not double-scored
    });

    it('ignores NEXT_QUESTION when not in feedback (double-click Next)', () => {
      const correct = gameStateReducer(playingState, { type: 'SUBMIT_ANSWER', userInput: 'Apple' });
      const advanced = gameStateReducer(correct, { type: 'NEXT_QUESTION' });
      expect(advanced.currentQuestionIndex).toBe(1);
      expect(advanced.gameStatus).toBe('playing');

      // Second NEXT_QUESTION arrives before re-render — must be a no-op,
      // not a crash on the nulled questionResult or a skipped question
      const double = gameStateReducer(advanced, { type: 'NEXT_QUESTION' });
      expect(double).toEqual(advanced);
      expect(double.currentQuestionIndex).toBe(1); // not skipped to 2
    });

    it('ignores NEXT_QUESTION with a null questionResult', () => {
      const state = gameStateReducer(playingState, { type: 'NEXT_QUESTION' });
      expect(state).toEqual(playingState);
    });
  });

  describe('RESET_GAME', () => {
    it('resets to initial state', () => {
      const modifiedState = {
        ...INITIAL_STATE,
        selectedQuestions: mockQuestionBank,
        currentQuestionIndex: 1,
        currentClueIndex: 3,
        totalScore: 100,
        gameStatus: 'playing',
      };
      const state = gameStateReducer(modifiedState, { type: 'RESET_GAME' });
      expect(state).toEqual(INITIAL_STATE);
    });
  });
});