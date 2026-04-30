import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, ArrowRight, Calendar, FolderKanban } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyTasks(); }, []);

  const fetchMyTasks = async () => {
    try {
      const { data } = await api.get('/tasks/my');
      setTasks(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const isOverdue = (t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done';

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(t);
    return t.status === filter;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  };

  const statusLabel = (s) => ({ todo: 'Todo', 'in-progress': 'In Progress', done: 'Done' }[s] || s);
  const statusBadge = (t) => {
    if (isOverdue(t)) return 'badge-overdue';
    return { todo: 'badge-todo', 'in-progress': 'badge-in-progress', done: 'badge-done' }[t.status];
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      setTasks((p) => p.map((t) => (t._id === id ? { ...t, status } : t)));
    } catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  const filters = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'todo', label: 'Todo', count: stats.todo },
    { key: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { key: 'done', label: 'Done', count: stats.done },
    { key: 'overdue', label: 'Overdue', count: stats.overdue },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-surface-400 mt-1">Welcome back, <span className="text-white font-medium">{user?.name}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: ListTodo, label: 'Total', value: stats.total, color: 'text-surface-400', vColor: 'text-white' },
          { icon: Clock, label: 'Todo', value: stats.todo, color: 'text-surface-400', vColor: 'text-surface-300' },
          { icon: Clock, label: 'In Progress', value: stats.inProgress, color: 'text-amber-400', vColor: 'text-amber-400' },
          { icon: CheckCircle2, label: 'Completed', value: stats.done, color: 'text-emerald-400', vColor: 'text-emerald-400' },
          { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'text-red-400', vColor: 'text-red-400' },
        ].map(({ icon: Icon, label, value, color, vColor }) => (
          <div key={label} className="stat-card">
            <div className={`flex items-center gap-2 ${color}`}><Icon size={16} /><span className="text-xs font-medium">{label}</span></div>
            <p className={`text-2xl font-bold ${vColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === key ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-800/40 text-surface-400 border border-surface-700/30 hover:text-white hover:bg-surface-700/60'}`}>
            {label} <span className="ml-1 text-xs opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ListTodo size={40} className="mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400 font-medium">No tasks found</p>
          </div>
        ) : filteredTasks.map((task, i) => (
          <div key={task._id} className={`glass-card-hover p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-slide-up ${isOverdue(task) ? 'border-red-500/30 bg-red-500/5' : ''}`}
            style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium truncate ${task.status === 'done' ? 'text-surface-500 line-through' : 'text-white'}`}>{task.title}</h3>
                <span className={statusBadge(task)}>{isOverdue(task) ? 'Overdue' : statusLabel(task.status)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                {task.project && <span className="flex items-center gap-1"><FolderKanban size={12} />{task.project.title}</span>}
                {task.dueDate && <span className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-400' : ''}`}><Calendar size={12} />{format(new Date(task.dueDate), 'MMM d, yyyy')}{isToday(new Date(task.dueDate)) && ' (Today)'}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} className="select-field text-xs py-1.5 px-3 w-auto">
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {task.project && <Link to={`/projects/${task.project._id}`} className="btn-ghost text-xs"><ArrowRight size={14} /></Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
