import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserStats, claimDailyReward } from '@workspace/api-client-react';
import { User, TrendingUp, Target, Calendar, Gift } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: getUserStats,
  });

  const claimMutation = useMutation({
    mutationFn: claimDailyReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const canClaimDaily = () => {
    if (!stats?.lastDailyClaim) return true;
    const lastClaim = new Date(stats.lastDailyClaim);
    const now = new Date();
    const timeDiff = now.getTime() - lastClaim.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-casino-gold mb-4 flex items-center justify-center space-x-3">
          <User className="w-10 h-10" />
          <span>Your Profile</span>
        </h1>
      </div>

      {/* Daily Reward */}
      <div className="card text-center">
        <Gift className="w-12 h-12 text-casino-gold mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">Daily Reward</h2>
        {canClaimDaily() ? (
          <button
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            className="btn-primary"
          >
            {claimMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>Claiming...</span>
              </div>
            ) : (
              'Claim $500'
            )}
          </button>
        ) : (
          <div>
            <p className="text-gray-400 mb-2">Already claimed today</p>
            <p className="text-sm text-gray-500">
              Last claimed: {stats?.lastDailyClaim ? new Date(stats.lastDailyClaim).toLocaleDateString() : 'Never'}
            </p>
          </div>
        )}
        
        {claimMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg text-green-300">
            Daily reward claimed! +$500
          </div>
        )}
        
        {claimMutation.error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
            {(claimMutation.error as any)?.data?.error || 'Failed to claim reward'}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Total Profit</h3>
          <p className={`text-2xl font-bold ${stats?.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats?.totalProfit >= 0 ? '+' : ''}${stats?.totalProfit.toLocaleString()}
          </p>
        </div>

        <div className="card text-center">
          <Target className="w-8 h-8 text-casino-gold mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Biggest Win</h3>
          <p className="text-2xl font-bold text-casino-gold">
            ${stats?.biggestWin.toLocaleString()}
          </p>
        </div>

        <div className="card text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Biggest Bet</h3>
          <p className="text-2xl font-bold text-blue-500">
            ${stats?.biggestBet.toLocaleString()}
          </p>
        </div>

        <div className="card text-center">
          <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Games Played</h3>
          <p className="text-2xl font-bold text-purple-500">
            {stats?.gamesPlayed.toLocaleString()}
          </p>
        </div>

        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Win Streak</h3>
          <p className="text-2xl font-bold text-orange-500">
            {stats?.winStreak}
          </p>
          <p className="text-sm text-gray-400">
            Current: {stats?.currentStreak}
          </p>
        </div>

        <div className="card text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-red-500 rounded-full mx-auto mb-3"></div>
          <h3 className="text-lg font-semibold mb-2">Win Rate</h3>
          <p className="text-2xl font-bold text-white">
            {stats?.gamesPlayed > 0 
              ? Math.round((stats.totalWins / stats.gamesPlayed) * 100)
              : 0
            }%
          </p>
          <p className="text-sm text-gray-400">
            {stats?.totalWins}W / {stats?.totalLosses}L
          </p>
        </div>
      </div>

      {/* Current Balance */}
      <div className="card text-center casino-glow">
        <h2 className="text-2xl font-bold mb-4">Current Balance</h2>
        <p className="text-4xl font-bold text-casino-gold mb-2">
          ${stats?.balance.toLocaleString()}
        </p>
        <p className="text-gray-400">
          Available for betting
        </p>
      </div>
    </div>
  );
}