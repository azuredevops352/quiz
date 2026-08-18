import React, { useReducer } from 'react';
import StartScreen from './components/five-clues/StartScreen';
import QuestionScreen from './components/five-clues/QuestionScreen';
import ResultsScreen from './components/five-clues/ResultsScreen';
import { gameStateReducer, INITIAL_STATE } from './game/gameState';
import { questions } from './data/questions';
import { QUESTIONS_PER_GAME, ALL_CATEGORIES, ALL_DIFFICULTIES } from './game/gameLogic';

const App = () => {
  const [state, dispatch] = useReducer(gameStateReducer, INITIAL_STATE);

  const handleStartGame = (selectedCategory = ALL_CATEGORIES, selectedDifficulty = ALL_DIFFICULTIES) => {
    dispatch({ type: 'START_GAME', questionBank: questions, questionsPerGame: QUESTIONS_PER_GAME, selectedCategory, selectedDifficulty });
  };

  const handleSubmitAnswer = (userInput) => {
    dispatch({ type: 'SUBMIT_ANSWER', userInput });
  };

  const handleNextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  if (state.gameStatus === 'start') {
    return (
      <div className="app">
        <StartScreen onStart={handleStartGame} categories={questions} selectedCategory={state.selectedCategory} selectedDifficulty={state.selectedDifficulty} />
      </div>
    );
  }

  if (state.gameStatus === 'gameComplete') {
    return (
      <div className="app">
        <ResultsScreen
          questionResults={state.questionResults}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  // 'playing' and 'feedback' both render QuestionScreen — feedback appears
  // inline below the answer form instead of navigating to a separate screen.
  const currentQuestion = state.selectedQuestions[state.currentQuestionIndex];
  const questionNumber = state.currentQuestionIndex + 1;
  const isLastQuestion = state.currentQuestionIndex === state.selectedQuestions.length - 1;

  return (
    <div className="app">
      <QuestionScreen
        question={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={state.selectedQuestions.length}
        clueIndex={state.currentClueIndex}
        totalScore={state.totalScore}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
        questionResult={state.questionResult}
        gameStatus={state.gameStatus}
        isLastQuestion={isLastQuestion}
      />
    </div>
  );
};

export default App;
