import { getRandomQuestions, isCorrectAnswer, calculateScore, getMaxGameScore, ALL_CATEGORIES, ALL_DIFFICULTIES } from './gameLogic.js';

const INITIAL_STATE = {
  selectedQuestions: [],
  currentQuestionIndex: 0,
  currentClueIndex: 0,
  totalScore: 0,
  gameStatus: 'start', // 'start' | 'playing' | 'feedback' | 'gameComplete'
  questionResult: null, // { correct: boolean, points: number, answer: string, isFinalClue: boolean }
  questionResults: [], // Array of { question, answer, clueSolved, points, correct }
  selectedCategory: ALL_CATEGORIES,
  selectedDifficulty: ALL_DIFFICULTIES,
};

function gameStateReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const questions = getRandomQuestions(action.questionBank, action.questionsPerGame, action.selectedCategory, action.selectedDifficulty);
      return {
        ...state,
        selectedQuestions: questions,
        currentQuestionIndex: 0,
        currentClueIndex: 0,
        totalScore: 0,
        gameStatus: 'playing',
        questionResult: null,
        questionResults: [],
        selectedCategory: action.selectedCategory,
        selectedDifficulty: action.selectedDifficulty,
      };
    }

    case 'SUBMIT_ANSWER': {
      // Guard: only accept answers while playing (blocks rapid double-submits
      // from double-scoring or advancing clues twice)
      if (state.gameStatus !== 'playing') return state;

      const currentQuestion = state.selectedQuestions[state.currentQuestionIndex];
      if (!currentQuestion) return state;

      const correct = isCorrectAnswer(action.userInput, currentQuestion);
      const points = correct ? calculateScore(state.currentClueIndex) : 0;
      const isFinalClue = state.currentClueIndex === 4;
      const clueSolved = correct ? state.currentClueIndex + 1 : 0;

      const questionResult = {
        correct,
        points,
        answer: currentQuestion.answer,
        isFinalClue,
      };

      if (correct) {
        // Correct answer - show feedback, then advance on "Next Question"
        return {
          ...state,
          totalScore: state.totalScore + points,
          gameStatus: 'feedback',
          questionResult,
        };
      } else if (isFinalClue) {
        // Incorrect on final clue - show feedback with 0 points, then advance on NEXT_QUESTION
        return {
          ...state,
          gameStatus: 'feedback',
          questionResult,
        };
      } else {
        // Incorrect on non-final clue - just advance clue, no feedback screen
        return {
          ...state,
          currentClueIndex: state.currentClueIndex + 1,
          questionResult,
        };
      }
    }

    case 'NEXT_QUESTION': {
      // Guard: only advance from the feedback step (blocks rapid double-clicks
      // from skipping a question or crashing on the nulled questionResult)
      if (state.gameStatus !== 'feedback' || !state.questionResult) return state;

      // Add the completed question to questionResults
      const completedQuestion = state.selectedQuestions[state.currentQuestionIndex];
      const newQuestionResults = [
        ...state.questionResults,
        {
          question: completedQuestion.answer,
          answer: state.questionResult.answer,
          clueSolved: state.questionResult.correct ? state.currentClueIndex + 1 : 0,
          points: state.questionResult.points,
          correct: state.questionResult.correct,
        },
      ];

      const nextQuestionIndex = state.currentQuestionIndex + 1;
      if (nextQuestionIndex >= state.selectedQuestions.length) {
        return {
          ...state,
          questionResults: newQuestionResults,
          gameStatus: 'gameComplete',
          questionResult: null,
        };
      }
      return {
        ...state,
        questionResults: newQuestionResults,
        currentQuestionIndex: nextQuestionIndex,
        currentClueIndex: 0,
        gameStatus: 'playing',
        questionResult: null,
      };
    }

    case 'RESET_GAME':
      return {
        ...INITIAL_STATE,
        selectedCategory: state.selectedCategory,
        selectedDifficulty: state.selectedDifficulty,
      };

    default:
      return state;
  }
}

export { gameStateReducer, INITIAL_STATE };