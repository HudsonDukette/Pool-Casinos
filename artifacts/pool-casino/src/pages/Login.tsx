import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@workspace/api-client-react';
import { Coins, LogIn, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Coins className="w-12 h-12 text-casino-gold" />
            <h1 className="text-4xl font-bold text-casino-gold">PoolCasino</h1>
          </div>
          <p className="text-gray-300">
            Fake money casino with a shared global pool
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <LogIn className="w-6 h-6 text-casino-gold" />
            <h2 className="text-2xl font-bold">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="Enter your username"
                disabled={loginMutation.isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || !username.trim() || !password.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner />
                  <span>Logging in...</span>
                </div>
              ) : (
                'Login'
              )}
            </button>

            {loginMutation.error && (
              <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
                {(loginMutation.error as any)?.data?.error || 'Login failed'}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-casino-gold hover:text-yellow-400 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="card bg-gray-800 border-gray-600">
          <h3 className="font-bold text-casino-gold mb-2">Demo Information</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Start with $10,000 fake money</li>
            <li>• All players share a $1M global pool</li>
            <li>• Win probability decreases with bet size</li>
            <li>• Compete on leaderboards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}