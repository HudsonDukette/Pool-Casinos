import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPool, getRecentBigWins } from '@workspace/api-client-react';
import { Coins, TrendingUp, Users, Zap } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { data: pool, isLoading: poolLoading } = useQuery({
    queryKey: ['pool'],
    queryFn: getPool,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentWins, isLoading: winsLoading } = useQuery({
    queryKey: ['recent-big-wins'],
    queryFn: getRecentBigWins,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-casino-gold mb-4">
          Welcome to PoolCasino
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience the thrill of casino games with fake money in a shared global pool economy. 
          Every bet affects the pool, every win comes from other players' losses.
        </p>
        <Link
          to="/games"
          className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          <span>Start Playing</span>
        </Link>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <Coins className="w-12 h-12 text-casino-gold mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Global Pool</h3>
          {poolLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-2xl font-bold text-casino-gold">
              ${pool?.totalAmount.toLocaleString() || '0'}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-2">
            Shared by all players
          </p>
        </div>

        <div className="card text-center">
          <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Biggest Win</h3>
          {poolLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-2xl font-bold text-green-500">
              ${pool?.biggestWin.toLocaleString() || '0'}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-2">
            Record single win
          </p>
        </div>

        <div className="card text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Max Bet</h3>
          {poolLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-2xl font-bold text-blue-500">
              ${pool?.maxBet.toLocaleString() || '0'}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-2">
            10% of pool
          </p>
        </div>
      </div>

      {/* Recent Big Wins */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <span>Recent Big Wins</span>
        </h2>
        
        {winsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : recentWins?.wins.length ? (
          <div className="space-y-3">
            {recentWins.wins.slice(0, 5).map((win, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-casino-gold rounded-full flex items-center justify-center text-black font-bold">
                    {win.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{win.username}</p>
                    <p className="text-sm text-gray-400">{win.gameType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-500">
                    +${win.payout.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {win.multiplier && `${win.multiplier}x`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            No recent big wins yet. Be the first!
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/games/roulette" className="card hover:casino-glow transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎰</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Roulette</h3>
              <p className="text-gray-400">Classic red or black betting</p>
            </div>
          </div>
        </Link>

        <Link to="/games/plinko" className="card hover:casino-glow transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚪</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Plinko</h3>
              <p className="text-gray-400">Drop balls for multipliers</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}