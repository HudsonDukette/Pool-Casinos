import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRichestPlayers, getBiggestWinners, getBiggestBettors } from '@workspace/api-client-react';
import { Trophy, Crown, Target, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

type LeaderboardType = 'richest' | 'winners' | 'bettors';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('richest');

  const { data: richest, isLoading: richestLoading } = useQuery({
    queryKey: ['leaderboard-richest'],
    queryFn: getRichestPlayers,
    enabled: activeTab === 'richest',
  });

  const { data: winners, isLoading: winnersLoading } = useQuery({
    queryKey: ['leaderboard-winners'],
    queryFn: getBiggestWinners,
    enabled: activeTab === 'winners',
  });

  const { data: bettors, isLoading: bettorsLoading } = useQuery({
    queryKey: ['leaderboard-bettors'],
    queryFn: getBiggestBettors,
    enabled: activeTab === 'bettors',
  });

  const tabs = [
    { id: 'richest', label: 'Richest Players', icon: Crown, data: richest, loading: richestLoading },
    { id: 'winners', label: 'Biggest Winners', icon: Trophy, data: winners, loading: winnersLoading },
    { id: 'bettors', label: 'High Rollers', icon: Target, data: bettors, loading: bettorsLoading },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500'; // Gold
      case 2: return 'text-gray-400'; // Silver
      case 3: return 'text-orange-600'; // Bronze
      default: return 'text-gray-300';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-casino-gold mb-4 flex items-center justify-center space-x-3">
          <Trophy className="w-10 h-10" />
          <span>Leaderboards</span>
        </h1>
        <p className="text-xl text-gray-300">
          See who's dominating the casino
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as LeaderboardType)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === id
                ? 'bg-casino-gold text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard Content */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          {currentTab && <currentTab.icon className="w-6 h-6 text-casino-gold" />}
          <h2 className="text-2xl font-bold">{currentTab?.label}</h2>
        </div>

        {currentTab?.loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : currentTab?.data?.entries.length ? (
          <div className="space-y-3">
            {currentTab.data.entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-casino-dark to-gray-800 border border-casino-gold'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${getRankColor(entry.rank)} min-w-[3rem]`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-casino-gold rounded-full flex items-center justify-center text-black font-bold">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{entry.username}</p>
                      {entry.rank <= 3 && (
                        <p className="text-sm text-casino-gold">
                          {entry.rank === 1 ? 'Champion' : entry.rank === 2 ? 'Runner-up' : 'Third Place'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    entry.rank <= 3 ? 'text-casino-gold' : 'text-white'
                  }`}>
                    {entry.label}
                  </p>
                  {activeTab === 'richest' && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Balance</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No data available yet</p>
            <p className="text-gray-500">Start playing to appear on the leaderboards!</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-to-r from-casino-dark to-gray-800 border border-casino-gold">
        <h3 className="text-xl font-bold text-casino-gold mb-4">How Rankings Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-yellow-500 mb-2">👑 Richest Players</h4>
            <p className="text-gray-300">Ranked by current balance. The more money you have, the higher you rank.</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-500 mb-2">🏆 Biggest Winners</h4>
            <p className="text-gray-300">Ranked by largest single win. One lucky bet can put you on top!</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-500 mb-2">🎯 High Rollers</h4>
            <p className="text-gray-300">Ranked by biggest single bet. For those who dare to risk it all.</p>
          </div>
        </div>
      </div>
    </div>
  );
}