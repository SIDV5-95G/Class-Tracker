'use client';

import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { StudentBatch } from '@/types';
import {
  formatStudentId,
  normalizeStudentId,
} from '@/lib/authUtils';
import {
  CalendarCheck2,
  Lock,
  User,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  Hash,
  School,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any, role?: 'Student' | 'CR', batch?: StudentBatch) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');

  const [signInId, setSignInId] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [rollNo, setRollNo] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [batch, setBatch] = useState<StudentBatch>('Batch A');

  const [resetId, setResetId] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const generatedStudentId = useMemo(() => formatStudentId(name, className, rollNo), [name, className, rollNo]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setMessage(null);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const studentId = normalizeStudentId(resetId);
      if (!studentId) throw new Error('Please enter your Student ID');
      if (!newPassword || newPassword.length < 4) throw new Error('New password must be at least 4 characters');
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

      const { data: profile, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, student_id')
        .eq('student_id', studentId)
        .maybeSingle();

      if (fetchErr) throw new Error(fetchErr.message);
      if (!profile) throw new Error(`No account found for ID: ${studentId}. Check your Student ID.`);

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ password_hash: newPassword })
        .eq('id', profile.id);

      if (updateErr) throw new Error(updateErr.message);

      setMessage({ type: 'success', text: `Password reset for ${studentId}. Redirecting to sign in...` });
      setTimeout(() => {
        setSignInId(studentId);
        setNewPassword('');
        setConfirmPassword('');
        setResetId('');
        switchMode('signin');
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'signup') {
        if (!name.trim() || !className.trim() || !rollNo.trim()) throw new Error('Please fill in all required fields');
        if (!signUpPassword || signUpPassword.length < 4) throw new Error('Password must be at least 4 characters');

        const cleanRoll = parseInt(rollNo.trim().replace(/[^0-9]/g, ''), 10);
        if (isNaN(cleanRoll) || cleanRoll < 1) throw new Error('Please enter a valid roll number.');

        // Block excluded roll numbers
        const EXCLUDED_ROLLS = [17, 68];
        if (EXCLUDED_ROLLS.includes(cleanRoll)) throw new Error(`Roll number ${cleanRoll} does not exist in this class. Please check your roll number.`);

        // Enforce batch-specific roll number ranges
        const BATCH_RANGES: Record<string, { min: number; max: number }> = {
          'Batch A': { min: 1, max: 24 },
          'Batch B': { min: 25, max: 48 },
          'Batch C': { min: 49, max: 71 },
        };
        const range = BATCH_RANGES[batch];
        if (!range) throw new Error('Invalid batch selected.');
        if (cleanRoll < range.min || cleanRoll > range.max) {
          throw new Error(
            `Roll number ${cleanRoll} does not belong to ${batch}. ` +
            `${batch} covers rolls ${range.min}–${range.max} (excl. 17 & 68).`
          );
        }

        const studentId = generatedStudentId;

        const newUserId = crypto.randomUUID();
        const { error: insertError } = await supabase.from('profiles').insert([{
          id: newUserId, student_id: studentId,
          student_name: name.trim(),
          full_name: `${name.trim()} (${className.trim().toUpperCase()}-${cleanRoll})`,
          class_name: className.trim().toUpperCase(), roll_number: String(cleanRoll),
          password_hash: signUpPassword, role: 'Student', batch,
          last_login_at: new Date().toISOString(), created_at: new Date().toISOString(),
        }]);

        // Handle duplicate roll/student_id violations (from DB UNIQUE constraint)
        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error(`Roll number ${cleanRoll} is already registered. This roll number belongs to an existing student. Please sign in instead.`);
          }
          throw new Error(insertError.message);
        }

        const sessionUser = { id: newUserId, student_id: studentId, role: 'Student', batch, full_name: name.trim() };
        localStorage.setItem('class_tracker_session', JSON.stringify(sessionUser));
        setMessage({ type: 'success', text: `Account created for ${studentId}! Logging you in...` });
        setTimeout(() => onLoginSuccess(sessionUser, 'Student', batch), 500);
      } else {
        if (!signInId.trim() || !signInPassword) throw new Error('Please enter your Student ID and Password');
        const studentId = normalizeStudentId(signInId);

        const { data: profile, error: fetchError } = await supabase.from('profiles').select('*').eq('student_id', studentId).maybeSingle();
        if (fetchError) throw new Error(fetchError.message);
        if (!profile) throw new Error(`No account found for ID: ${studentId}. Please register or ask your CR.`);
        // Trim whitespace and normalize case — mobile keyboards auto-capitalize and add trailing spaces
        const enteredPassword = signInPassword.trim().toUpperCase();
        const storedPassword = (profile.password_hash || '').trim().toUpperCase();
        if (storedPassword !== enteredPassword) throw new Error('Incorrect password. Please try again.');

        await supabase.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', profile.id);

        const sessionUser = { id: profile.id, student_id: profile.student_id, role: profile.role || 'Student', batch: profile.batch || 'Batch A', full_name: profile.student_name || profile.full_name };
        localStorage.setItem('class_tracker_session', JSON.stringify(sessionUser));
        setMessage({ type: 'success', text: `Welcome back, ${studentId}!` });
        setTimeout(() => onLoginSuccess(sessionUser, profile.role as 'Student' | 'CR', profile.batch as StudentBatch), 400);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error' });
    } finally {
      setLoading(false);
    }
  };

  const FeedbackAlert = () => !message ? null : (
    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-5 ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
      {message.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />}
      <span>{message.text}</span>
    </div>
  );

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 selection:bg-slate-900 selection:text-white">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center text-white shadow-md shadow-slate-900/10 mb-3">
            <KeyRound className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">Enter your Student ID and choose a new password</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <FeedbackAlert />

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student ID</label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" required placeholder="e.g. ROHAN-D9B-28" value={resetId}
                  onChange={(e) => setResetId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2 text-sm uppercase font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Format: <span className="font-mono text-slate-600">NAME-CLASS-ROLLNO</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="password" required placeholder="Min. 4 characters" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="password" required placeholder="Re-enter new password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${confirmPassword && confirmPassword !== newPassword ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-slate-400'}`} />
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === newPassword && newPassword.length >= 4 && (
                <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
              {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><KeyRound className="w-4 h-4" /><span>Reset Password</span></>}
            </button>

            <button type="button" onClick={() => switchMode('signin')}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Roster • Authorized Academic Portal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 selection:bg-slate-900 selection:text-white">
      <div className="text-center mb-8">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center text-white shadow-md shadow-slate-900/10 mb-3">
          <CalendarCheck2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Roster</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">Academic tasks, lab deadlines &amp; student portal</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
          <button type="button" onClick={() => switchMode('signin')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}>
            Sign In with ID
          </button>
          <button type="button" onClick={() => switchMode('signup')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}>
            Student Register
          </button>
        </div>

        <FeedbackAlert />

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signin' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student ID</label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" required placeholder="e.g. ROHAN-D9B-28" value={signInId}
                    onChange={(e) => setSignInId(e.target.value.toUpperCase())}
                    autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username"
                    className="w-full pl-10 pr-4 py-2 text-sm uppercase font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Format: <span className="font-mono text-slate-600">NAME-CLASS-ROLLNO</span></p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button type="button" onClick={() => switchMode('forgot')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer underline underline-offset-2">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="password" required placeholder="••••••••" value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" required placeholder="e.g. Rohan" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class / Division</label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" required placeholder="e.g. D9B" value={className}
                      onChange={(e) => setClassName(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-3 py-2 text-sm uppercase rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Roll Number</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" required placeholder="e.g. 28" value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Assigned Student ID:</span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                  {generatedStudentId || 'NAME-CLASS-ROLL'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Set Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="password" required placeholder="••••••••" value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lab Batch</label>
                <select value={batch} onChange={(e) => setBatch(e.target.value as StudentBatch)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400">
                  <option value="Batch A">Batch A</option>
                  <option value="Batch B">Batch B</option>
                  <option value="Batch C">Batch C</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Registering as <strong>Student</strong>. CR credentials are assigned by the Class Administrator.</span>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signup' ? (
              <><UserPlus className="w-4 h-4" /><span>Register Student Account</span></>
            ) : (
              <><LogIn className="w-4 h-4" /><span>Sign In to Dashboard</span></>
            )}
          </button>
        </form>
      </div>
      <p className="text-center text-xs text-slate-400 mt-6">Roster • Authorized Academic Portal</p>
    </div>
  );
}
