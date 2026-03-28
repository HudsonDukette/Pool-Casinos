import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const games = [
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'Classic red or black betting with European wheel',
    icon: '🎰',
    color: 'bg-red-600',
    available: true
  },
  {
    id: 'plinko',
    name: 'Plinko',
    description: 'Drop balls through pegs for multiplier rewards',
    icon: '⚪',
    color: 'bg-blue-600',
    available: true
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Beat the dealer with 21 or closest',
    icon: '🃏',
    color: 'bg-green-600',
    available: false
  },
  {
    id: 'slots',
    name: 'Slots',
    description: '3-reel slot machine with various symbols',
    icon: '🎰',
    color: 'bg-purple-600',
    available: false
  },
  {
    id: 'crash',
    name: 'Crash',
    description: 'Cash out before the multiplier crashes',
    icon: '📈',
    color: 'bg-orange-600',
    available: false
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    description: 'Simple heads or tails betting',
    icon: '🪙',
    color: 'bg-yellow-600',
    available: false
  }
];

export default function Games() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-casino-gold mb-4 flex items-center justify-center space-x-3">
          <Gamepad2 className="w-10 h-10" />
          <span>Casino Games</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose your game and test your luck against the global pool. 
          Remember: bigger bets have lower win chances!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game.id} className="card relative">
            {!game.available && (
              <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center z-10">
                <span className="text-casino-gold font-bold text-lg">Coming Soon</span>
              </div>
            )}
            
            <div className={`w-20 h-20 ${game.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-3xl">{game.icon}</span>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">{game.name}</h3>
            <p className="text-gray-400 text-center mb-6">{game.description}</p>
            
            {game.available ? (
              <Link
                to={`/games/${game.id}`}
                className="btn-primary w-full text-center block"
              >
                Play Now
              </Link>
            ) : (
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Game Rules */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="space-y-4 text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="text-casino-gold font-bold">1.</span>
            <p>All players share a global pool of money that starts at $1,000,000</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-casino-gold font-bold">2.</span>
            <p>When you win, money comes from the pool. When you lose, money goes to the pool</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-casino-gold font-bold">3.</span>
            <p>Win probability decreases as your bet size increases relative to the pool</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-casino-gold font-bold">4.</span>
            <p>Maximum bet is 10% of the current pool size (up to $50,000)</p>
          </div>
        </div>
      </div>
    </div>
  );
}