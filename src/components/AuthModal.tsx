'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Lock, Mail, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StudentBatch } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [batch, setBatch] = useState<StudentBatch>('Batch 1');
  const [role, setRole] = useState<'Student' | 'CR'>('Student');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
              batch: batch,
            },
          },
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Account created successfully!',
        });
        if (data.user) {
          onAuthSuccess(data.user);
          setTimeout(() => onClose(), 1000);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Signed in successfully!',
        });
        if (data.user) {
          onAuthSuccess(data.user);
          setTimeout(() => onClose(), 600);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isSignUp ? 'Create an Account' : 'Sign In to Portal'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access real-time tasks, lab batches, and submissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
              message.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Student' | 'CR')}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="Student">Student</option>
                  <option value="CR">Class Rep (CR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Batch
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value as StudentBatch)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="Batch 1">Batch 1</option>
                  <option value="Batch 2">Batch 2</option>
                  <option value="Batch 3">Batch 3</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-3 mt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account yet? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
