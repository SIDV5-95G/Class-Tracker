'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StudentDashboard from '@/components/StudentDashboard';
import CRDashboard from '@/components/CRDashboard';
import LoginPage from '@/components/LoginPage';
import { StudentBatch } from '@/types';
import {
  GraduationCap,
  ShieldCheck,
  LogOut,
  CalendarCheck2,
  Columns2,
} from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'Student' | 'CR' | 'Split'>('Student');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'Student' | 'CR'>('Student');
  const [userBatch, setUserBatch] = useState<string>('Batch B');
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('Student');
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem('class_tracker_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setStudentId(parsed.student_id || 'STUDENT');
          setStudentName(parsed.full_name || parsed.student_name || 'Student');
          setUserBatch(parsed.batch || 'Batch B');
          const role = parsed.role === 'CR' ? 'CR' : 'Student';
          setUserRole(role);
          if (role === 'CR') setActiveView('CR');
          else setActiveView('Student');
        }
      } catch (err) {
        console.warn('Session parse note:', err);
      } finally {
        setLoadingSession(false);
      }
    };

    initSession();
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('class_tracker_session');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setStudentId('');
    }
  };

  const handleLoginSuccess = (
    authUser: any,
    role_: 'Student' | 'CR' = 'Student',
    batch: StudentBatch = 'Batch B'
  ) => {
    setUser(authUser);
    const role: 'Student' | 'CR' = role_ === 'CR' ? 'CR' : 'Student';
    setUserRole(role);
    setActiveView(role === 'CR' ? 'CR' : 'Student');
    setUserBatch(batch);
    setStudentId(authUser.student_id || 'STUDENT');
    setStudentName(authUser.full_name || authUser.student_name || 'Student');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Connecting to Database...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Roster
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                Live Hub
              </span>
            </div>
          </div>

          {/* View Switcher Controls */}
          <div className="flex items-center gap-3">
            {/* Multi-view Pill: Student | CR Admin | Split Side-by-Side */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveView('Student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'Student'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                <span>Student View</span>
              </button>

              {/* Only CRs can access the Admin and Split views */}
              {userRole === 'CR' && (
                <>
                  <button
                    onClick={() => setActiveView('CR')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeView === 'CR'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                    <span>CR Admin View</span>
                  </button>

                  <button
                    onClick={() => setActiveView('Split')}
                    className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeView === 'Split'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Side-by-side view (Desktop & Tablet)"
                  >
                    <Columns2 className="w-3.5 h-3.5 text-slate-700" />
                    <span>Side-by-Side</span>
                  </button>
                </>
              )}
            </div>

            {/* Student ID & Sign Out */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[150px]">
                  {studentId || 'STUDENT'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {user.role || 'Student'} • {userBatch}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'Student' && (
          <StudentDashboard
            userId={user.id}
            studentId={studentId}
            studentName={studentName}
            initialBatch={userBatch}
          />
        )}

        {activeView === 'CR' && userRole === 'CR' && (
          <CRDashboard userId={user.id} userEmail={studentId} />
        )}

        {activeView === 'Split' && userRole === 'CR' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <div className="p-4 bg-white/50 rounded-3xl border border-slate-200">
              <CRDashboard userId={user.id} userEmail={studentId} />
            </div>
            <div className="p-4 bg-white/50 rounded-3xl border border-slate-200">
              <StudentDashboard
                userId={user.id}
                studentId={studentId}
                studentName={studentName}
                initialBatch={userBatch}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <p>Class Deadline & Lab Tracker • Modern Minimal Aesthetic</p>
      </footer>
    </div>
  );
}
