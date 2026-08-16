import React from 'react';

const GameCard = ({ game, onPlay }) => {
  const isComingSoon = game.status === 'comingSoon';

  return (
    <article className={`game-card ${isComingSoon ? 'game-card--coming-soon' : ''}`}>
      <div className="game-card__thumbnail">
        <img
          src={game.thumbnail}
          alt=""
          className="game-card__image"
          loading="lazy"
        />
        {isComingSoon && (
          <span className="game-card__badge">Coming Soon</span>
        )}
      </div>
      <div className="game-card__content">
        <h3 className="game-card__title">{game.title}</h3>
        <p className="game-card__description">{game.description}</p>
        <button
          type="button"
          className={`btn btn--primary game-card__play-btn ${isComingSoon ? 'game-card__play-btn--disabled' : ''}`}
          onClick={isComingSoon ? undefined : () => onPlay(game.id)}
          disabled={isComingSoon}
        >
          {isComingSoon ? 'Coming Soon' : 'Play'}
        </button>
      </div>
    </article>
  );
};

export default GameCard;