import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '@workspace/api-client-react';
import { Coins, UserPlus, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    registerMutation.mutate({
      username: username.trim(),
      password,
      email: email.trim() || null,
      referralCode: referralCode.trim() || null,
    });
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
            Join the fake money casino revolution
          </p>
        </div>

        {/* Register Form */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <UserPlus className="w-6 h-6 text-casino-gold" />
            <h2 className="text-2xl font-bold">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="Choose a username (3-30 characters)"
                disabled={registerMutation.isPending}
                minLength={3}
                maxLength={30}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Create a password (min 6 characters)"
                  disabled={registerMutation.isPending}
                  minLength={6}
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="your@email.com"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium mb-2">
                Referral Code (optional)
              </label>
              <input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="input w-full"
                placeholder="Enter referral code for bonus"
                disabled={registerMutation.isPending}
                maxLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">
                Get +$20K bonus with a valid referral code!
              </p>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || !username.trim() || !password.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {registerMutation.error && (
              <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-300">
                {(registerMutation.error as any)?.data?.error || 'Registration failed'}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/" className="text-casino-gold hover:text-yellow-400 font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Welcome Bonus Info */}
        <div className="card bg-gradient-to-r from-casino-dark to-gray-800 border border-casino-gold">
          <h3 className="font-bold text-casino-gold mb-2">Welcome Bonus</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Start with $10,000 fake money</li>
            <li>• +$20,000 bonus with referral code</li>
            <li>• Daily $500 reward available</li>
            <li>• Compete on global leaderboards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}