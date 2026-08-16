/**
 * Calculates game results from question results
 * @param {Array} questionResults - Array of { question, answer, clueSolved, points, correct }
 * @returns {Object} { totalScore, maxScore, percentage, correctCount, incorrectCount, breakdown }
 */
export function calculateResults(questionResults) {
  const totalScore = questionResults.reduce((sum, r) => sum + (r.points || 0), 0);
  const maxScore = questionResults.length * 50;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const correctCount = questionResults.filter(r => r.correct).length;
  const incorrectCount = questionResults.filter(r => !r.correct).length;

  return {
    totalScore,
    maxScore,
    percentage,
    correctCount,
    incorrectCount,
    breakdown: questionResults.map(r => ({
      question: r.question,
      answer: r.answer,
      clueSolved: r.clueSolved || 0,
      points: r.points || 0,
      correct: !!r.correct,
    })),
  };
}