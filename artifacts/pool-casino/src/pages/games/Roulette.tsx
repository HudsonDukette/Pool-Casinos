import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playRoulette } from '@workspace/api-client-react';
import { ArrowLeft, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Roulette() {
  const [betAmount, setBetAmount] = useState('');
  const [selectedColor, setSelectedColor] = useState<'red' | 'black' | 'green'>('red');
  const [result, setResult] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const queryClient = useQueryClient();

  const playMutation = useMutation({
    mutationFn: playRoulette,
    onSuccess: (data) => {
      setResult(data);
      setIsSpinning(false);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['pool'] });
    },
    onError: () => {
      setIsSpinning(false);
    }
  });

  const handlePlay = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount < 0.01) {
      alert('Please enter a valid bet amount (minimum $0.01)');
      return;
    }

    setIsSpinning(true);
    setResult(null);
    
    // Add spinning delay for better UX
    setTimeout(() => {
      playMutation.mutate({
        betAmount: amount,
        color: selectedColor
      });
    }, 2000);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-500';
      case 'black': return 'text-gray-900';
      case 'green': return 'text-green-500';
      default: return 'text-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/games" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-3xl font-bold text-casino-gold">Roulette</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Area */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 text-center">European Roulette</h2>
          
          {/* Roulette Wheel */}
          <div className="flex justify-center mb-8">
            <div className={`w-48 h-48 rounded-full border-8 border-casino-gold relative ${isSpinning ? 'roulette-wheel' : ''}`}>
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-red-600 via-black to-green-600"></div>
              <div className="absolute inset-8 rounded-full bg-casino-dark flex items-center justify-center">
                {result && !isSpinning && (
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getColorClass(result.resultColor)}`}>
                      {result.resultNumber}
                    </div>
                    <div className={`text-sm ${getColorClass(result.resultColor)}`}>
                      {result.resultColor.toUpperCase()}
                    </div>
                  </div>
                )}
                {isSpinning && (
                  <div className="text-center">
                    <LoadingSpinner size="large" />
                    <div className="text-sm mt-2">Spinning...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result */}
          {result && !isSpinning && (
            <div className={`card text-center ${result.won ? 'win-glow' : 'lose-glow'}`}>
              <h3 className={`text-2xl font-bold mb-2 ${result.won ? 'text-green-500' : 'text-red-500'}`}>
                {result.won ? 'You Won!' : 'You Lost!'}
              </h3>
              <p className="text-lg mb-2">
                Ball landed on <span className={`font-bold ${getColorClass(result.resultColor)}`}>
                  {result.resultNumber} {result.resultColor.toUpperCase()}
                </span>
              </p>
              <p className="text-lg">
                {result.won ? '+' : '-'}${Math.abs(result.payout - result.betAmount).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Win chance was {result.winChance}%
              </p>
            </div>
          )}
        </div>

        {/* Betting Panel */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Place Your Bet</h2>
          
          {/* Bet Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Bet Amount</label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-casino-gold" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="input pl-10 w-full"
                disabled={isSpinning || playMutation.isPending}
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Choose Color</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedColor('red')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedColor === 'red'
                    ? 'border-red-500 bg-red-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-red-500'
                }`}
                disabled={isSpinning || playMutation.isPending}
              >
                <div className="text-red-500 font-bold">RED</div>
                <div className="text-sm text-gray-400">1.95x</div>
              </button>
              
              <button
                onClick={() => setSelectedColor('black')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedColor === 'black'
                    ? 'border-gray-400 bg-gray-400 bg-opacity-20'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                disabled={isSpinning || playMutation.isPending}
              >
                <div className="text-gray-300 font-bold">BLACK</div>
                <div className="text-sm text-gray-400">1.95x</div>
              </button>
              
              <button
                onClick={() => setSelectedColor('green')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedColor === 'green'
                    ? 'border-green-500 bg-green-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-green-500'
                }`}
                disabled={isSpinning || playMutation.isPending}
              >
                <div className="text-green-500 font-bold">GREEN</div>
                <div className="text-sm text-gray-400">14x</div>
              </button>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            disabled={isSpinning || playMutation.isPending || !betAmount}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning || playMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner />
                <span>Spinning...</span>
              </div>
            ) : (
              'Spin the Wheel'
            )}
          </button>

          {playMutation.error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
              {(playMutation.error as any)?.data?.error || 'An error occurred'}
            </div>
          )}

          {/* Game Info */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">How to Play</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Choose Red, Black, or Green</li>
              <li>• Red/Black pay 1.95x your bet</li>
              <li>• Green (0) pays 14x your bet</li>
              <li>• Higher bets = lower win chance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}