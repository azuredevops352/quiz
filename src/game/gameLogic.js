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
 * Returns `count` unique random questions from the question bank
 * @param {Array} questionBank - Array of question objects
 * @param {number} count - Number of questions to return
 * @returns {Array} Array of unique questions
 */
export function getRandomQuestions(questionBank, count) {
  if (count <= 0) return [];
  if (!questionBank || questionBank.length === 0) return [];

  const shuffled = fisherYatesShuffle(questionBank);
  return shuffled.slice(0, Math.min(count, questionBank.length));
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