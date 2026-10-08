'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Task, Completion, TaskCategory, UserProfile, StudentBatch } from '@/types';
import { formatStudentId } from '@/lib/authUtils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Search,
  AlertCircle,
  X,
  RefreshCw,
  BarChart3,
  Layers,
  FileText,
  UserPlus,
  ShieldCheck,
  BadgeCheck,
  Hash,
  School,
  Lock,
  User,
  ArrowRight,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';

interface CRDashboardProps {
  userId?: string;
  userEmail?: string;
}

interface FormState {
  title: string;
  description: string;
  category: TaskCategory;
  due_date: string;
  target_audience: string;
  drive_url: string;
}

interface StudentFormState {
  name: string;
  className: string;
  rollNo: string;
  password: string;
  role: 'Student' | 'CR';
  batch: StudentBatch;
}

const initialFormState: FormState = {
  title: '',
  description: '',
  category: 'Assignment',
  due_date: '',
  target_audience: 'All Students',
  drive_url: '',
};

const initialStudentForm: StudentFormState = {
  name: '',
  className: 'D9B',
  rollNo: '',
  password: 'Password123!',
  role: 'Student',
  batch: 'Batch A',
};

export default function CRDashboard({ userId, userEmail }: CRDashboardProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Tasks' | 'Roster' | 'Reports'>('Overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allCompletions, setAllCompletions] = useState<Completion[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Task Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // User/Student Creation Modal State (CR Only)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [studentFormData, setStudentFormData] = useState<StudentFormState>(initialStudentForm);
  const [studentFormSubmitting, setStudentFormSubmitting] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAudience, setFilterAudience] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, completionsRes, profilesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('completions').select('*'),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ]);

      if (tasksRes.error) {
        console.error('Error fetching tasks:', tasksRes.error);
      } else if (tasksRes.data) {
        setTasks(tasksRes.data as Task[]);
      }

      if (completionsRes.error) {
        console.error('Error fetching completions:', completionsRes.error);
      } else if (completionsRes.data) {
        setAllCompletions(completionsRes.data as Completion[]);
      }

      if (profilesRes.data) {
        setStudents(profilesRes.data as UserProfile[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('cr-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name.trim() || !studentFormData.className.trim() || !studentFormData.rollNo.trim()) {
      alert('Please fill in Student Name, Class, and Roll Number');
      return;
    }

    setStudentFormSubmitting(true);
    const studentId = formatStudentId(studentFormData.name, studentFormData.className, studentFormData.rollNo);

    try {
      const newUserId = crypto.randomUUID();
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: newUserId,
          student_id: studentId,
          student_name: studentFormData.name.trim(),
          full_name: `${studentFormData.name.trim()} (${studentFormData.className.trim().toUpperCase()}-${studentFormData.rollNo.trim()})`,
          class_name: studentFormData.className.trim().toUpperCase(),
          roll_number: studentFormData.rollNo.trim(),
          password_hash: studentFormData.password || 'Password123!',
          role: studentFormData.role,
          batch: studentFormData.batch,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      alert(`Successfully registered ${studentFormData.role}: ${studentId}`);
      setIsAddUserModalOpen(false);
      setStudentFormData(initialStudentForm);
      fetchAllData();
    } catch (err: any) {
      console.error('Error adding student:', err);
      alert(err.message || 'Error registering student');
    } finally {
      setStudentFormSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentProfileId: string, studentIdTag: string) => {
    if (!window.confirm(`Are you sure you want to remove student account ${studentIdTag}?`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', studentProfileId);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== studentProfileId));
    } catch (err: any) {
      alert('Could not delete student: ' + err.message);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setFormData({
      ...initialFormState,
      due_date: localIso,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    let dateStr = task.due_date;
    try {
      const d = new Date(task.due_date);
      dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch {
      // keep
    }

    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      due_date: dateStr,
      target_audience: task.target_audience,
      drive_url: task.drive_url || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.due_date) {
      alert('Please fill in required fields (Title and Due Date)');
      return;
    }

    setFormSubmitting(true);

    const taskPayload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      due_date: new Date(formData.due_date).toISOString(),
      target_audience: formData.target_audience,
      drive_url: formData.drive_url.trim() || null,
      ...(userId ? { created_by: userId } : {}),
    };

    try {
      if (editingTaskId) {
        const { data, error } = await supabase
          .from('tasks')
          .update(taskPayload)
          .eq('id', editingTaskId)
          .select()
          .single();

        if (error) throw error;

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? (data as Task) : t))
        );
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert([taskPayload])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setTasks((prev) => [...prev, data as Task]);
        }
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingTaskId(null);
    } catch (err: any) {
      console.error('Failed to save task:', err);
      alert(err.message || 'Error saving task');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    const prev = [...tasks];
    setTasks((t) => t.filter((x) => x.id !== taskId));

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
        setTasks(prev);
        alert('Could not delete task: ' + error.message);
      } else {
        setAllCompletions((c) => c.filter((x) => x.task_id !== taskId));
      }
    } catch (err) {
      setTasks(prev);
    }
  };

  const taskCompletionMap = useMemo(() => {
    const map = new Map<string, number>();
    allCompletions.forEach((comp) => {
      map.set(comp.task_id, (map.get(comp.task_id) || 0) + 1);
    });
    return map;
  }, [allCompletions]);

  const totalTasks = tasks.length;
  const totalCompletions = allCompletions.length;
  const studentCount = Math.max(students.filter((s) => s.role === 'Student').length, 1);

  // Accurate aggregate submission calculation
  const expectedTotalSubmissions = totalTasks * studentCount;
  const completionRate = expectedTotalSubmissions > 0
    ? Math.min(Math.round((totalCompletions / expectedTotalSubmissions) * 100), 100)
    : 0;
  const pendingRate = Math.max(100 - completionRate, 0);

  // Modern clean palette: emerald + slate-200 track
  const classPieData = useMemo(() => {
    if (totalTasks === 0) {
      return [{ name: 'No Tasks', value: 1, color: '#e2e8f0' }];
    }
    return [
      { name: 'Completed', value: completionRate, color: '#10b981' },
      { name: 'Pending', value: pendingRate, color: '#e2e8f0' },
    ];
  }, [totalTasks, completionRate, pendingRate]);

  const batchStats = useMemo(() => {
    const computeBatchProgress = (batchName: string) => {
      // Tasks relevant to this batch
      const bTasks = tasks.filter(
        (t) => t.target_audience === 'All Students' || t.target_audience === batchName
      );
      if (bTasks.length === 0) return 0;

      // Only count students in this specific batch (exclude CRs)
      const batchStudents = students.filter((s) => s.batch === batchName && s.role === 'Student');
      const batchStudentIds = new Set(batchStudents.map((s) => s.id));
      const bStudentCount = Math.max(batchStudents.length, 1);

      // Count only completions from students in THIS batch
      let bCompletions = 0;
      bTasks.forEach((t) => {
        const taskBatchCompletions = allCompletions.filter(
          (c) => c.task_id === t.id && batchStudentIds.has(c.user_id)
        );
        bCompletions += taskBatchCompletions.length;
      });

      const expected = bTasks.length * bStudentCount;
      return expected > 0 ? Math.min(Math.round((bCompletions / expected) * 100), 100) : 0;
    };

    return [
      { name: 'Batch A', progress: computeBatchProgress('Batch A') },
      { name: 'Batch B', progress: computeBatchProgress('Batch B') },
      { name: 'Batch C', progress: computeBatchProgress('Batch C') },
    ];
  }, [tasks, allCompletions, students]);

  const isOverdue = (dateStr: string): boolean => {
    try {
      return new Date(dateStr).getTime() < Date.now();
    } catch {
      return false;
    }
  };

  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAudience =
        filterAudience === 'All' || task.target_audience === filterAudience;
      const matchesCategory =
        filterCategory === 'All' || task.category === filterCategory;

      return matchesSearch && matchesAudience && matchesCategory;
    });

    // Overdue tasks jump to the top
    return list.sort((a, b) => {
      const isAOverdue = isOverdue(a.due_date);
      const isBOverdue = isOverdue(b.due_date);

      if (isAOverdue && !isBOverdue) return -1;
      if (!isAOverdue && isBOverdue) return 1;

      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [tasks, searchQuery, filterAudience, filterCategory]);

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

  const getTimeRemaining = (dateStr: string) => {
    try {
      const diff = new Date(dateStr).getTime() - new Date().getTime();
      if (diff < 0) return 'Past Due';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 1) return `in ${days} days`;
      if (days === 1) return 'Tomorrow';
      if (hours > 0) return `in ${hours} hrs`;
      return 'Due soon';
    } catch {
      return '';
    }
  };

  const upcomingTasks = useMemo(() => {
    const now = new Date().getTime();
    return [...tasks]
      .filter((t) => new Date(t.due_date).getTime() >= now - 86400000)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 4);
  }, [tasks]);

  const nextUpcomingTask = useMemo(() => {
    const now = new Date().getTime();
    const sorted = [...tasks]
      .filter((t) => new Date(t.due_date).getTime() >= now)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return sorted[0] || null;
  }, [tasks]);

  const previewNewStudentId = useMemo(() => {
    return formatStudentId(studentFormData.name, studentFormData.className, studentFormData.rollNo);
  }, [studentFormData.name, studentFormData.className, studentFormData.rollNo]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CLASS ADMIN DASHBOARD</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Academic Course Management
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Task assignment, student roster administration, and batch analytics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-600" />
              <span>Add New User</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-2 bg-slate-50 border-t border-slate-100 overflow-x-auto">
          {(['Overview', 'Tasks', 'Roster', 'Reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-slate-900 border-slate-900 shadow-xs'
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW (Academic Command & Analytics Hub) */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Executive Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Tasks */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Coursework</span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">{totalTasks}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {tasks.filter((t) => t.category === 'Assignment').length} Assignments · {tasks.filter((t) => t.category === 'Lab').length} Labs · {tasks.filter((t) => t.category === 'Project').length} Projects
                </div>
              </div>
            </div>

            {/* Card 2: Overall Submissions */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Rate</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">{completionRate}%</div>
                <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                  {totalCompletions} total submissions
                </div>
              </div>
            </div>

            {/* Card 3: Class Roster */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">{students.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {students.filter((s) => s.role === 'Student').length} Students · {students.filter((s) => s.role === 'CR').length} CRs
                </div>
              </div>
            </div>

            {/* Card 4: Upcoming Target */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Deadline</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-base font-black text-slate-900 truncate">
                  {nextUpcomingTask ? nextUpcomingTask.title : 'None Scheduled'}
                </div>
                <div className="text-xs text-amber-600 font-semibold mt-0.5">
                  {nextUpcomingTask ? `${getTimeRemaining(nextUpcomingTask.due_date)} · ${formatDueDate(nextUpcomingTask.due_date)}` : 'All caught up'}
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-column Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Upcoming Deadlines Radar + Batch Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Deadlines Radar */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-700" />
                      <span>Upcoming Deadlines Radar</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Prioritized active tasks and class delivery timeline</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('Tasks')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-slate-600 transition cursor-pointer"
                  >
                    <span>Manage Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500">No pending deadlines. Class schedule is clear.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => {
                      const compCount = taskCompletionMap.get(task.id) || 0;
                      const completionPct = studentCount > 0 ? Math.min(Math.round((compCount / studentCount) * 100), 100) : 0;
                      const timeStr = getTimeRemaining(task.due_date);
                      const overdue = isOverdue(task.due_date);

                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            overdue
                              ? 'bg-rose-50/50 border-rose-200 border-l-4 border-l-rose-500 shadow-xs'
                              : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
                                {task.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {task.target_audience}
                              </span>
                              {timeStr && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  timeStr === 'Past Due'
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {timeStr}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Due {formatDueDate(task.due_date)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 sm:w-56">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                                <span>{completionPct}% Complete</span>
                                <span className="text-slate-400">{compCount}/{studentCount}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${completionPct}%` }}
                                />
                              </div>
                            </div>

                            {task.drive_url && (
                              <a
                                href={task.drive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition"
                                title="Reference Materials"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Batch-Wise Performance Progress */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-700" />
                      <span>Batch Performance Breakdown</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Submission velocity across assigned laboratory batches</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    3 Lab Sections
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {batchStats.map((b) => (
                    <div key={b.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{b.name}</span>
                        <span className="text-xs font-extrabold text-emerald-600">{b.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${b.progress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {students.filter((s) => s.batch === b.name).length} students enrolled
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 col: Class Progress Donut + Quick Actions */}
            <div className="space-y-6">
              {/* Progress Overview Card (Compact) */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Class Progress
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Semester Completion
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {completionRate}%
                  </span>
                </div>

                {/* Compact Minimal Donut Ring */}
                <div className="relative h-24 my-2 flex items-center justify-center">
                  {isMounted ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={classPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={32}
                            outerRadius={44}
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={totalTasks > 0 ? 3 : 0}
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={2}
                          >
                            {classPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val: any) => [`${val}%`, '']}
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                          {completionRate}%
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                          SUBMISSION
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Single Row Legend */}
                <div className="flex items-center justify-between text-[11px] px-1 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{completionRate}% Done</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <span>{pendingRate}% Pending</span>
                  </span>
                </div>
              </div>

              {/* Administrative Quick Shortcuts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('Tasks')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Create New Task</div>
                        <div className="text-[10px] text-slate-500">Publish lab or assignment to students</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition" />
                  </button>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900">
                        <UserPlus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Add Student Account</div>
                        <div className="text-[10px] text-slate-500">Enroll new student or delegate CR</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition" />
                  </button>

                  <button
                    onClick={() => setActiveTab('Reports')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Print Course Report</div>
                        <div className="text-[10px] text-slate-500">Export test and assignment breakdown</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TASKS MANAGEMENT & ASSIGNMENT HUB */}
      {activeTab === 'Tasks' && (
        <div className="space-y-6">
          {/* Top Filter and Actions Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>Task Management & Assignments</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish coursework, attach Drive resources, and track submission progress
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['All', 'Assignment', 'Test', 'Lab', 'Project'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Audience Filter Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['All', 'Batch A', 'Batch B', 'Batch C'] as const).map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setFilterAudience(aud)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      filterAudience === aud
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                />
              </div>

              <button
                onClick={fetchAllData}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 1 COL: "Create / Assign New Task" Form Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-slate-700" />
                    <span>Assign New Task</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Sync
                  </span>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Microprocessors Lab 4"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value as TaskCategory })
                        }
                        className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                      >
                        <option value="Assignment">Assignment</option>
                        <option value="Test">Test / Midterm</option>
                        <option value="Lab">Lab Exercise</option>
                        <option value="Project">Project / Capstone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Due Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full px-2 py-2 text-[11px] rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Audience <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      {['All Students', 'Batch A', 'Batch B', 'Batch C'].map((aud) => (
                        <button
                          type="button"
                          key={aud}
                          onClick={() => setFormData({ ...formData, target_audience: aud })}
                          className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                            formData.target_audience === aud
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {aud}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Drive Link <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.drive_url}
                      onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Instructions, problem statement, or criteria..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {formSubmitting ? 'Publishing...' : 'Publish to Students'}
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT 2 COLS: "Existing Tasks Catalog" */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Coursework Catalog ({filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'})
                </span>
                {(filterCategory !== 'All' || filterAudience !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterCategory('All');
                      setFilterAudience('All');
                      setSearchQuery('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No tasks found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your category or batch filter, or use the form on the left to assign a new task.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const compCount = taskCompletionMap.get(task.id) || 0;
                    const completionPct = studentCount > 0 ? Math.min(Math.round((compCount / studentCount) * 100), 100) : 0;
                    const timeRemaining = getTimeRemaining(task.due_date);
                    const overdue = isOverdue(task.due_date);

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl p-5 border transition space-y-3.5 ${
                          overdue
                            ? 'bg-rose-50/50 border-rose-200 border-l-4 border-l-rose-500 shadow-xs'
                            : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {task.category}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {task.target_audience}
                              </span>
                              {timeRemaining && (
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                  overdue
                                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {overdue ? 'Overdue' : timeRemaining}
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-slate-900">{task.title}</h4>
                            {task.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {task.drive_url && (
                              <a
                                href={task.drive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                                title="Reference Materials (Google Drive)"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                <span>Drive</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Submission Progress Meter */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Due: {formatDueDate(task.due_date)}</span>
                          </div>

                          <div className="flex items-center gap-3 sm:w-64">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                              {compCount}/{studentCount} ({completionPct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ROSTER DIRECTORY (With CR "Add New User" Action) */}
      {activeTab === 'Roster' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Students Directory</h2>
              <p className="text-xs text-slate-500">Only CR/Admin can manage student accounts and assign roles</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {students.length} Accounts
              </span>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student / CR</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Lab Batch</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-slate-900">{st.student_id || 'N/A'}</td>
                    <td className="p-3 font-semibold text-slate-800">{st.student_name || st.full_name || 'Student'}</td>
                    <td className="p-3 text-slate-600">{st.class_name || 'D9B'}</td>
                    <td className="p-3 text-slate-600">{st.roll_number || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {st.batch || 'Batch A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          st.role === 'CR'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteStudent(st.id, st.student_id || 'Student')}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REPORTS */}
      {activeTab === 'Reports' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Summary Report</h2>
              <p className="text-xs text-slate-500">Summary of all tests, lab submissions, and coursework</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
            >
              Print Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Total Assignments Published</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {tasks.filter((t) => t.category === 'Assignment').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Lab Exercises & Reports</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {tasks.filter((t) => t.category === 'Lab').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Scheduled Tests / Quizzes</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {tasks.filter((t) => t.category === 'Test').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Projects & Capstones</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {tasks.filter((t) => t.category === 'Project').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CR ONLY - ADD NEW STUDENT / USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New User Account</h3>
                <p className="text-xs text-slate-500">Authorized CR Administrative Action</p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class / Division <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. D9B"
                    value={studentFormData.className}
                    onChange={(e) => setStudentFormData({ ...studentFormData, className: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm uppercase rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15"
                    value={studentFormData.rollNo}
                    onChange={(e) => setStudentFormData({ ...studentFormData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Generated ID Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Assigned Student ID:</span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                  {previewNewStudentId || 'NAME-CLASS-ROLL'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={studentFormData.role}
                    onChange={(e) => setStudentFormData({ ...studentFormData, role: e.target.value as 'Student' | 'CR' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="Student">Student</option>
                    <option value="CR">Class Rep (CR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lab Batch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={studentFormData.batch}
                    onChange={(e) => setStudentFormData({ ...studentFormData, batch: e.target.value as StudentBatch })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                    <option value="Batch C">Batch C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Password
                </label>
                <input
                  type="password"
                  value={studentFormData.password}
                  onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={studentFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {studentFormSubmitting ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTaskId ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microprocessors Lab Report 4"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as TaskCategory })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Test">Test / Midterm</option>
                    <option value="Lab">Lab Exercise</option>
                    <option value="Project">Project / Capstone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Audience <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                    <option value="Batch C">Batch C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Due Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reference Materials (Google Drive URL) <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.drive_url}
                  onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Update Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
