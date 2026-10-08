'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Task, Completion, TaskCategory } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Search,
  BookOpen,
  FlaskConical,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';

interface StudentDashboardProps {
  userId: string;
  studentId?: string;
  studentName?: string;
  initialBatch?: string;
}

export default function StudentDashboard({
  userId,
  studentId = 'STUDENT',
  studentName = 'Student',
  initialBatch = 'Batch B',
}: StudentDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialBatch) {
      setSelectedBatch(initialBatch);
    }
  }, [initialBatch]);

  const isTaskForBatch = useCallback((taskAudience: string, currentBatch: string) => {
    if (taskAudience === 'All' || taskAudience === 'All Students') return true;
    if (taskAudience === currentBatch) return true;
    if (currentBatch === 'Batch B' && (taskAudience === 'Batch 2' || taskAudience === 'Batch B')) return true;
    if (currentBatch === 'Batch A' && (taskAudience === 'Batch 1' || taskAudience === 'Batch A')) return true;
    if (currentBatch === 'Batch C' && (taskAudience === 'Batch 3' || taskAudience === 'Batch C')) return true;
    return false;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, completionsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        userId
          ? supabase.from('completions').select('*').eq('user_id', userId)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (tasksRes.error) {
        console.error('Supabase tasks fetch error:', tasksRes.error);
      } else if (tasksRes.data) {
        setTasks(tasksRes.data as Task[]);
      }

      if (completionsRes.error) {
        console.error('Supabase completions fetch error:', completionsRes.error);
      } else if (completionsRes.data) {
        setCompletions(completionsRes.data as Completion[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('student-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const completedTaskIds = useMemo(() => {
    return new Set(completions.map((c) => c.task_id));
  }, [completions]);

  const handleToggleComplete = async (taskId: string) => {
    if (!userId) return;
    const isCompleted = completedTaskIds.has(taskId);
    setTogglingTaskId(taskId);

    if (isCompleted) {
      const prev = [...completions];
      setCompletions((c) => c.filter((x) => x.task_id !== taskId));

      try {
        const { error } = await supabase
          .from('completions')
          .delete()
          .eq('task_id', taskId)
          .eq('user_id', userId);

        if (error) {
          setCompletions(prev);
          alert('Could not remove completion: ' + error.message);
        }
      } catch (err) {
        setCompletions(prev);
      }
    } else {
      const optimisticComp: Completion = {
        id: `temp-${Date.now()}`,
        task_id: taskId,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      setCompletions((prev) => [...prev, optimisticComp]);

      try {
        const { data, error } = await supabase
          .from('completions')
          .insert([{ task_id: taskId, user_id: userId }])
          .select()
          .single();

        if (error) {
          setCompletions((c) => c.filter((x) => x.task_id !== taskId));
          alert('Could not record completion: ' + error.message);
        } else if (data) {
          setCompletions((c) =>
            c.map((x) => (x.id === optimisticComp.id ? (data as Completion) : x))
          );
        }
      } catch (err) {
        setCompletions((c) => c.filter((x) => x.task_id !== taskId));
      }
    }

    setTogglingTaskId(null);
  };

  const isOverdue = (dueDateStr: string): boolean => {
    return new Date(dueDateStr).getTime() < Date.now();
  };

  const isUrgent = (dueDateStr: string): boolean => {
    const dueDate = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  };

  const getCountdownHours = (dueDateStr: string): string => {
    const diff = new Date(dueDateStr).getTime() - Date.now();
    if (diff <= 0) return 'Due now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  const batchTasks = useMemo(() => {
    return tasks.filter((t) => isTaskForBatch(t.target_audience, selectedBatch));
  }, [tasks, selectedBatch, isTaskForBatch]);

  const displayedTasks = useMemo(() => {
    const filtered = batchTasks.filter((task) => {
      const matchesCat = selectedCategory === 'All' || task.category === selectedCategory;
      const isDone = completedTaskIds.has(task.id);
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Completed' && isDone) ||
        (statusFilter === 'Pending' && !isDone);
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesStatus && matchesSearch;
    });

    // Overdue pending tasks show on top, followed by upcoming, with completed at the end
    return filtered.sort((a, b) => {
      const isACompleted = completedTaskIds.has(a.id);
      const isBCompleted = completedTaskIds.has(b.id);
      const isAOverdue = !isACompleted && isOverdue(a.due_date);
      const isBOverdue = !isBCompleted && isOverdue(b.due_date);

      // 1. Pending overdue tasks jump to the top
      if (isAOverdue && !isBOverdue) return -1;
      if (!isAOverdue && isBOverdue) return 1;

      // 2. If both are overdue, sort earliest overdue first
      if (isAOverdue && isBOverdue) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }

      // 3. Completed tasks go to the bottom
      if (isACompleted && !isBCompleted) return 1;
      if (!isACompleted && isBCompleted) return -1;

      // 4. Upcoming tasks ordered chronologically ascending
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [batchTasks, selectedCategory, statusFilter, searchQuery, completedTaskIds]);

  // Statistics
  const totalCount = batchTasks.length;
  const completedCount = batchTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const pendingCount = Math.max(totalCount - completedCount, 0);
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compact Chart Data
  const pieData = useMemo(() => {
    if (totalCount === 0) {
      return [{ name: 'No Tasks', value: 1, color: '#e2e8f0' }];
    }
    return [
      { name: 'Completed', value: completedCount, color: '#10b981' },
      { name: 'Pending', value: pendingCount, color: '#e2e8f0' },
    ];
  }, [totalCount, completedCount, pendingCount]);

  const timelineData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = new Date().getDay();
    return days.map((day, idx) => {
      const isPastOrToday = idx <= (currentDayIdx === 0 ? 6 : currentDayIdx - 1);
      const count = isPastOrToday ? Math.min(completedCount, Math.round((idx + 1) * (completedCount / 4))) : 0;
      return { day, completed: count };
    });
  }, [completedCount]);

  const getCategoryBadge = (cat: TaskCategory) => {
    switch (cat) {
      case 'Assignment':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Test':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Lab':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Project':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    switch (cat) {
      case 'Assignment':
        return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case 'Test':
        return <GraduationCap className="w-3.5 h-3.5 text-rose-600" />;
      case 'Lab':
        return <FlaskConical className="w-3.5 h-3.5 text-purple-600" />;
      case 'Project':
        return <FolderKanban className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Welcome Card & Lab Batch Badge */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900">
              STUDENT DASHBOARD
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              {studentId}
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
            <span>Hello, <strong className="text-slate-900">{studentName || studentId}</strong>! Lab batch:</span>
            <span className="inline-flex items-center font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
              {selectedBatch}
            </span>
          </p>
        </div>

        {/* Allotted Batch Badge (Only allotted batch shown) */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Allotted Batch:</span>
          <span className="inline-flex items-center font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
            {selectedBatch}
          </span>
        </div>
      </div>

      {/* Main Grid: Deadlines Feed (Left) & Compact Progress Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: "My Deadlines" Feed */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deadlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {['All', 'Assignment', 'Test', 'Lab', 'Project'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchData}
                title="Refresh Deadlines"
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Deadlines List Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>My Deadlines</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {displayedTasks.length}
              </span>
            </h2>
            <div className="flex items-center gap-1">
              {(['All', 'Pending', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Task Feed Cards */}
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <h3 className="text-xs font-bold text-slate-900">All Deadlines Cleared</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No active tasks for {selectedBatch}.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedTasks.map((task) => {
                const isCompleted = completedTaskIds.has(task.id);
                const overdue = !isCompleted && isOverdue(task.due_date);
                const urgent = !isCompleted && !overdue && isUrgent(task.due_date);

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl p-4 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : overdue
                        ? 'bg-rose-50/60 border-rose-200 border-l-4 border-l-rose-500 shadow-xs'
                        : urgent
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${getCategoryBadge(
                            task.category
                          )}`}
                        >
                          {getCategoryIcon(task.category)}
                          {task.category}
                        </span>

                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {task.target_audience}
                        </span>

                        {overdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600 animate-pulse" />
                            Overdue
                          </span>
                        )}

                        {urgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            {getCountdownHours(task.due_date)}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-bold ${
                          isCompleted
                            ? 'line-through text-slate-400'
                            : overdue
                            ? 'text-rose-950 font-extrabold'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <span className={`flex items-center gap-1 ${overdue ? 'text-rose-600 font-semibold' : ''}`}>
                          <Clock className={`w-3 h-3 ${overdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          {formatDueDate(task.due_date)}
                        </span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          isCompleted
                            ? 'text-emerald-600'
                            : overdue
                            ? 'text-rose-600'
                            : 'text-slate-600'
                        }`}>
                          {isCompleted ? 'Completed' : overdue ? 'Past Deadline' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {task.drive_url && (
                        <a
                          href={task.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                          title="Reference Material (Google Drive)"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                          <span>Drive</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        disabled={togglingTaskId === task.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        } ${togglingTaskId === task.id ? 'opacity-50' : ''}`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Complete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Compact Progress Statistics Panel */}
        <div className="space-y-4">
          {/* Progress Donut Card (Compact & Perfectly Proportioned) */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  My Progress
                </h2>
                <p className="text-[10px] text-slate-400">Completion Status</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {completionPercentage}%
              </span>
            </div>

            {/* Compact Centered Donut Ring */}
            <div className="relative h-24 my-2 flex items-center justify-center">
              {isMounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={44}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={totalCount > 1 ? 3 : 0}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val} tasks`, '']}
                        contentStyle={{
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          fontSize: '11px',
                          padding: '4px 8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Clean Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-black text-slate-900 leading-none">
                      {completedCount}
                    </span>
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                      OF {totalCount} DONE
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Clean Single-Row Summary (Never wraps or truncates) */}
            <div className="flex items-center justify-between text-[11px] px-1 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{completedCount} Done</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                <span>{pendingCount} Pending</span>
              </span>
            </div>
          </div>

          {/* Tasks Completed Over Time (Compact) */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Activity Timeline
                </h3>
                <p className="text-[10px] text-slate-400">Weekly completion trend</p>
              </div>
              <div className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>

            <div className="h-24 w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} done`, '']}
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        fontSize: '11px',
                        padding: '4px 8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
