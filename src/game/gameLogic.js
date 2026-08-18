/**
 * Fisher-Yates shuffle - returns a shuffled copy of the array
 */
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Virtual category label representing the entire question bank.
 * Selecting it (or omitting a category) reproduces the pre-category behavior.
 */
export const ALL_CATEGORIES = 'All Categories';

/**
 * Virtual difficulty label representing all difficulty levels.
 * Selecting it (or omitting a difficulty) draws from all difficulties.
 */
export const ALL_DIFFICULTIES = 'All Difficulties';

/**
 * Returns the unique, sorted list of categories present in the question bank,
 * with the virtual "All Categories" option prepended.
 * @param {Array} questionBank - Array of question objects with a `category` field
 * @returns {string[]} Category names, "All Categories" first
 */
export function getCategories(questionBank) {
  if (!questionBank || questionBank.length === 0) return [ALL_CATEGORIES];
  const categories = new Set(
    questionBank.map(q => q.category).filter(Boolean)
  );
  return [ALL_CATEGORIES, ...[...categories].sort()];
}

/**
 * Returns the unique, sorted list of difficulties present in the question bank,
 * with the virtual "All Difficulties" option prepended in fixed order.
 * @param {Array} questionBank - Array of question objects with a `difficulty` field
 * @returns {string[]} Difficulty names, "All Difficulties" first in order [Easy, Medium, Hard]
 */
export function getDifficulties(questionBank) {
  if (!questionBank || questionBank.length === 0) return [ALL_DIFFICULTIES];
  const difficulties = new Set(
    questionBank.map(q => q.difficulty).filter(Boolean)
  );
  // Fixed order: All Difficulties first, then sorted remaining
  const order = ['Easy', 'Medium', 'Hard'];
  return [ALL_DIFFICULTIES, ...order.filter(d => difficulties.has(d))];
}

/**
 * Normalizes an answer string: lowercase, trim, collapse whitespace
 * @param {string} str - Input string
 * @returns {string} Normalized string
 */
export function normalizeAnswer(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Checks if user input matches the correct answer or any accepted answers
 * @param {string} userInput - User's answer
 * @param {Object} question - Question object with answer and acceptedAnswers
 * @returns {boolean} True if correct
 */
export function isCorrectAnswer(userInput, question) {
  const normalizedInput = normalizeAnswer(userInput);
  const normalizedAnswer = normalizeAnswer(question.answer);

  if (normalizedInput === normalizedAnswer) return true;

  if (question.acceptedAnswers && Array.isArray(question.acceptedAnswers)) {
    return question.acceptedAnswers.some(accepted =>
      normalizeAnswer(accepted) === normalizedInput
    );
  }

  return false;
}

/**
 * Points awarded for each clue index (0 = hardest clue = 50 points)
 */
export const pointsByClue = [50, 40, 30, 20, 10];

/**
 * Number of questions randomly selected per game.
 * The question bank may be larger — only this many are played.
 */
export const QUESTIONS_PER_GAME = 5;

/**
 * Calculates score based on which clue index was used
 * @param {number} clueIndex - Index of clue used (0-4)
 * @returns {number} Points awarded
 */
export function calculateScore(clueIndex) {
  if (clueIndex < 0 || clueIndex >= pointsByClue.length) return 0;
  return pointsByClue[clueIndex];
}

/**
 * Returns the maximum possible score for a game
 * @param {number} questionsPerGame - Number of questions in a game
 * @returns {number} Maximum possible score
 */
export function getMaxGameScore(questionsPerGame) {
  const maxPerQuestion = Math.max(...pointsByClue);
  return maxPerQuestion * questionsPerGame;
}

/**
 * Returns a random selection of questions from the question bank,
 * optionally filtered by category and difficulty.
 * @param {Array} questionBank - Array of question objects
 * @param {number} count - Number of questions to return
 * @param {string} category - Optional category filter (default: all)
 * @param {string} difficulty - Optional difficulty filter (default: all)
 * @returns {Array} Array of randomly selected questions
 */
/**
 * Returns a random selection of questions from the question bank,
 * optionally filtered by category and difficulty.
 * @param {Array} questionBank - Array of question objects
 * @param {number} count - Number of questions to return
 * @param {string} category - Optional category filter (default: all)
 * @param {string} difficulty - Optional difficulty filter (default: all)
 * @returns {Array} Array of randomly selected questions
 */
export function getRandomQuestions(questionBank, count, category, difficulty) {
  if (!questionBank || questionBank.length === 0) return [];
  if (count <= 0) return [];

  // Apply combined category and difficulty filtering
  let filtered = [...questionBank];

  // Category filter
  if (category && category !== ALL_CATEGORIES) {
    filtered = filtered.filter(q => q.category === category);
  }

  // Difficulty filter
  if (difficulty && difficulty !== ALL_DIFFICULTIES) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // If combined filter yields no results, fall back to full bank
  if (filtered.length === 0) {
    filtered = [...questionBank];
  }

  // Shuffle and return exactly 'count' questions (or all if fewer than count exist)
  const shuffled = fisherYatesShuffle(filtered);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}