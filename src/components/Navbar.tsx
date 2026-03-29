import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout, MessageResponse } from '@workspace/api-client-react';
import { User } from '@workspace/api-client-react';
import { Coins, Hop as Home, Gamepad2, User as UserIcon, Trophy, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const location = useLocation();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation<MessageResponse, Error, void>({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="bg-casino-dark border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Coins className="w-8 h-8 text-casino-gold" />
            <span className="text-xl font-bold text-casino-gold">PoolCasino</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'bg-casino-gold text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
              <Coins className="w-4 h-4 text-casino-gold" />
              <span className="font-semibold text-casino-gold">
                ${user.balance.toLocaleString()}
              </span>
            </div>
            
            <div className="hidden md:block text-sm text-gray-300">
              {user.username}
            </div>

            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center space-x-1 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around py-2 border-t border-gray-700">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'text-casino-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}