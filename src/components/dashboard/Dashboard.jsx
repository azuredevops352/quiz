import React from 'react';
import { games } from '../data/games';
import GameCard from './GameCard';

const Dashboard = ({ onPlayGame }) => {
  return (
    <main className="dashboard" role="main">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Games Hub</h1>
        <p className="dashboard__tagline">Premium game collection</p>
      </header>

      <section className="dashboard__intro">
        <p className="dashboard__intro-text">
          Explore our curated collection of brain-teasing games. Each game is designed to challenge your knowledge and thinking skills.
        </p>
      </section>

      <section className="dashboard__grid">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={onPlayGame}
          />
        ))}
      </section>
    </main>
  );
};

export default Dashboard;