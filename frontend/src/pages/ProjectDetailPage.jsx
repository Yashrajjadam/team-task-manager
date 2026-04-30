import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Trash2, UserPlus, UserMinus, ArrowLeft, Calendar, Edit3 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', status: 'todo', dueDate: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      if (isAdmin) {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally { setLoading(false); }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assignedTo: '', status: 'todo', dueDate: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Title required');
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskForm);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', { ...taskForm, project: id });
        toast.success('Task created');
      }
      setShowTaskModal(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      setTasks((p) => p.filter((t) => t._id !== taskId));
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks((p) => p.map((t) => (t._id === taskId ? { ...t, status } : t)));
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.post(`/projects/${id}/members`, { userId });
      toast.success('Member added');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const isOverdue = (t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done';
  const columns = [
    { key: 'todo', label: 'Todo', color: 'border-surface-500' },
    { key: 'in-progress', label: 'In Progress', color: 'border-amber-500' },
    { key: 'done', label: 'Done', color: 'border-emerald-500' },
  ];

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  const nonMembers = allUsers.filter((u) => !project.members.some((m) => m._id === u._id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="btn-ghost"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="page-title">{project.title}</h1>
            <p className="text-surface-400 text-sm mt-0.5">{project.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-sm"><UserPlus size={15} /> Members</button>}
          <button onClick={openCreateTask} className="btn-primary text-sm"><Plus size={15} /> Add Task</button>
        </div>
      </div>

      {/* Members */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-surface-400 mb-3">Team Members ({project.members.length})</h3>
        <div className="flex flex-wrap gap-2">
          {project.members.map((m) => (
            <div key={m._id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-700/40 rounded-lg text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                {m.name.charAt(0)}
              </div>
              <span className="text-surface-300">{m.name}</span>
              <span className={m.role === 'admin' ? 'badge-admin text-[10px]' : 'badge-member text-[10px]'}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ key, label, color }) => {
          const colTasks = tasks.filter((t) => t.status === key);
          return (
            <div key={key} className="space-y-3">
              <div className={`flex items-center gap-2 pb-2 border-b-2 ${color}`}>
                <h3 className="text-sm font-semibold text-surface-300">{label}</h3>
                <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              {colTasks.length === 0 ? (
                <div className="glass-card p-6 text-center text-surface-600 text-sm">No tasks</div>
              ) : colTasks.map((task) => (
                <div key={task._id} className={`glass-card p-4 space-y-2 ${isOverdue(task) ? 'border-red-500/30 bg-red-500/5' : ''}`}>
                  <div className="flex items-start justify-between">
                    <h4 className={`font-medium text-sm ${task.status === 'done' ? 'text-surface-500 line-through' : 'text-white'}`}>{task.title}</h4>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditTask(task)} className="p-1 text-surface-500 hover:text-brand-400 rounded transition-colors"><Edit3 size={13} /></button>
                      {(isAdmin || task.createdBy?._id === user?.id) && (
                        <button onClick={() => handleDeleteTask(task._id)} className="p-1 text-surface-500 hover:text-red-400 rounded transition-colors"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </div>
                  {task.description && <p className="text-xs text-surface-500 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      {task.assignedTo && (
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-brand-500/30 flex items-center justify-center text-[8px] font-bold text-brand-300">{task.assignedTo.name?.charAt(0)}</div>
                          {task.assignedTo.name?.split(' ')[0]}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-400' : ''}`}>
                          <Calendar size={11} />{format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} className="text-[10px] bg-surface-700/60 border border-surface-600/40 rounded-lg px-2 py-1 text-surface-300 focus:outline-none">
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="label-text">Title</label>
            <input className="input-field" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field resize-none" rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Assign To</label>
              <select className="select-field" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Status</label>
              <select className="select-field" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Due Date</label>
            <input type="date" className="input-field" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">{editingTask ? 'Update' : 'Create'} Task</button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-surface-400 mb-2">Current Members</h4>
            <div className="space-y-1">
              {project.members.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-700/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">{m.name.charAt(0)}</div>
                    <div><p className="text-sm text-white">{m.name}</p><p className="text-xs text-surface-500">{m.email}</p></div>
                  </div>
                  {m._id !== project.owner._id && isAdmin && (
                    <button onClick={() => handleRemoveMember(m._id)} className="p-1.5 text-surface-500 hover:text-red-400 rounded-lg hover:bg-red-500/10"><UserMinus size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {nonMembers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-400 mb-2">Add Members</h4>
              <div className="space-y-1">
                {nonMembers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-700/40">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-600 flex items-center justify-center text-xs font-bold text-surface-300">{u.name.charAt(0)}</div>
                      <div><p className="text-sm text-white">{u.name}</p><p className="text-xs text-surface-500">{u.email}</p></div>
                    </div>
                    <button onClick={() => handleAddMember(u._id)} className="p-1.5 text-surface-500 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10"><UserPlus size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
