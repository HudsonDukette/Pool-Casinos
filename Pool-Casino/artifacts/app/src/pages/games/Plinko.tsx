import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playPlinko, PlinkoResult, PlinkoRequest } from '@workspace/api-client-react';
import { ArrowLeft, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Plinko() {
  const [betAmount, setBetAmount] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [result, setResult] = useState<any>(null);
  const [isDropping, setIsDropping] = useState(false);

  const queryClient = useQueryClient();

  const playMutation = useMutation<PlinkoResult, Error, PlinkoRequest>({
    mutationFn: (variables) => playPlinko(variables),
    onSuccess: (data) => {
      setResult(data);
      setIsDropping(false);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['pool'] });
    },
    onError: () => {
      setIsDropping(false);
    }
  });

  const handlePlay = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount < 0.01) {
      alert('Please enter a valid bet amount (minimum $0.01)');
      return;
    }

    setIsDropping(true);
    setResult(null);
    
    // Add dropping delay for better UX
    setTimeout(() => {
      playMutation.mutate({
        betAmount: amount,
        risk: selectedRisk
      });
    }, 2000);
  };

  const getRiskMultipliers = (risk: string) => {
    switch (risk) {
      case 'low': return [0.5, 1, 1.5, 2, 2.5, 2, 1.5, 1, 0.5];
      case 'medium': return [0.3, 0.5, 1, 2, 5, 2, 1, 0.5, 0.3];
      case 'high': return [0.2, 0.3, 0.5, 2, 10, 2, 0.5, 0.3, 0.2];
      default: return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/games" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-3xl font-bold text-casino-gold">Plinko</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Area */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 text-center">Drop the Ball</h2>
          
          {/* Plinko Board */}
          <div className="relative bg-gray-900 rounded-lg p-6 mb-6" style={{ height: '400px' }}>
            {/* Pegs */}
            <div className="absolute inset-0 flex flex-col justify-around">
              {[...Array(8)].map((_, row) => (
                <div key={row} className="flex justify-around">
                  {[...Array(row + 2)].map((_, peg) => (
                    <div
                      key={peg}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Ball */}
            {isDropping && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-casino-gold rounded-full plinko-ball"></div>
              </div>
            )}

            {/* Multiplier Slots */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {getRiskMultipliers(selectedRisk).map((multiplier, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center py-2 text-xs font-bold border-r border-gray-700 last:border-r-0 ${
                    result && result.slot === index
                      ? result.won
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : multiplier >= 2
                      ? 'bg-green-800 text-green-300'
                      : multiplier >= 1
                      ? 'bg-yellow-800 text-yellow-300'
                      : 'bg-red-800 text-red-300'
                  }`}
                >
                  {multiplier}x
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && !isDropping && (
            <div className={`card text-center ${result.won ? 'win-glow' : 'lose-glow'}`}>
              <h3 className={`text-2xl font-bold mb-2 ${result.won ? 'text-green-500' : 'text-red-500'}`}>
                {result.won ? 'You Won!' : 'You Lost!'}
              </h3>
              <p className="text-lg mb-2">
                Ball landed in <span className="font-bold text-casino-gold">
                  {result.multiplier}x
                </span> slot
              </p>
              <p className="text-lg">
                {result.won ? '+' : ''}${(result.payout - result.betAmount).toLocaleString()}
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
                disabled={isDropping || playMutation.isPending}
              />
            </div>
          </div>

          {/* Risk Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Risk Level</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedRisk('low')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRisk === 'low'
                    ? 'border-green-500 bg-green-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-green-500'
                }`}
                disabled={isDropping || playMutation.isPending}
              >
                <div className="text-green-500 font-bold">LOW</div>
                <div className="text-sm text-gray-400">Safe</div>
              </button>
              
              <button
                onClick={() => setSelectedRisk('medium')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRisk === 'medium'
                    ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-yellow-500'
                }`}
                disabled={isDropping || playMutation.isPending}
              >
                <div className="text-yellow-500 font-bold">MEDIUM</div>
                <div className="text-sm text-gray-400">Balanced</div>
              </button>
              
              <button
                onClick={() => setSelectedRisk('high')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRisk === 'high'
                    ? 'border-red-500 bg-red-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-red-500'
                }`}
                disabled={isDropping || playMutation.isPending}
              >
                <div className="text-red-500 font-bold">HIGH</div>
                <div className="text-sm text-gray-400">Risky</div>
              </button>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            disabled={isDropping || playMutation.isPending || !betAmount}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDropping || playMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner />
                <span>Dropping...</span>
              </div>
            ) : (
              'Drop Ball'
            )}
          </button>

          {playMutation.error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
              {(playMutation.error as any)?.data?.error || 'An error occurred'}
            </div>
          )}

          {/* Multiplier Preview */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">Multipliers ({selectedRisk.toUpperCase()})</h3>
            <div className="flex text-xs">
              {getRiskMultipliers(selectedRisk).map((multiplier, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center py-1 ${
                    multiplier >= 2
                      ? 'text-green-400'
                      : multiplier >= 1
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {multiplier}x
                </div>
              ))}
            </div>
          </div>

          {/* Game Info */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">How to Play</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Ball bounces off pegs randomly</li>
              <li>• Higher risk = higher potential rewards</li>
              <li>• Center slots usually have better odds</li>
              <li>• Higher bets = lower win chance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}